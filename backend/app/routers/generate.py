"""
AI generation routes.

"/analyze-image" analyzes uploaded syllabus images and generates ICS files.
"/generate-ics" generates ICS calendar files from events data.
"/generate-ics-selected" generates ICS calendar files from selected events only.
"/chat" chat with the AI assistant for schedule management.
"/chat-stream" chat with the AI assistant using streaming.
"""

import base64
import json
import re
from datetime import datetime
from typing import Dict, Any, AsyncGenerator

import aiohttp
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Request
from fastapi.responses import StreamingResponse, Response

from app.services.o4_mini_service import OpenAIo4Service
from app.prompts import (
    SYLLABUS_ANALYSIS_SYSTEM_PROMPT,
    SYLLABUS_ANALYSIS_USER_PROMPT,
    CHAT_SYSTEM_PROMPT,
)
from app.core.limiter import limiter

router = APIRouter(prefix="/generate", tags=["AI Generation"])

o4_service = OpenAIo4Service()


async def call_o4_api_stream(
    system_prompt: str,
    data: str,
) -> AsyncGenerator[str, None]:
    """
    Asynchronously streams a response from the OpenAI o4-mini model using SSE.

    This function sends a system prompt and a user-formatted message to the OpenAI
    Chat Completions API with streaming enabled. It yields incremental chunks of
    the model's response as they arrive.

    Args:
        system_prompt (str): The system-level instructions for the model.
        data (str): Input string from client

    Yields:
        str: Chunks of the model's response text as they are received.
    """
    api_key = o4_service.api_key
    model = o4_service.model
    base_url = o4_service.base_url
    reasoning_effort = o4_service.reasoning_effort

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": data},
        ],
        "max_completion_tokens": 12000,
        "stream": True,
        "reasoning_effort": reasoning_effort,
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                base_url, headers=headers, json=payload
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    print(f"Error response: {error_text}")
                    raise ValueError(
                        f"OpenAI API returned status code {response.status}: {error_text}"
                    )

                line_count = 0
                async for line in response.content:
                    line = line.decode("utf-8").strip()
                    if not line:
                        continue

                    line_count += 1

                    if line.startswith("data: "):
                        if line == "data: [DONE]":
                            break
                        try:
                            data = json.loads(line[6:])
                            content = (
                                data.get("choices", [{}])[0]
                                .get("delta", {})
                                .get("content")
                            )
                            if content:
                                yield content
                        except json.JSONDecodeError as e:
                            print(f"JSON decode error: {e} for line: {line}")
                            continue

                if line_count == 0:
                    print("Warning: No lines received in stream response")

    except aiohttp.ClientError as e:
        print(f"Connection error: {str(e)}")
        raise ValueError(f"Failed to connect to OpenAI API: {str(e)}") from e
    except Exception as e:
        print(f"Unexpected error in streaming API call: {str(e)}")
        raise


def call_vision_api(system_prompt: str, user_prompt: str, image_base64: str) -> str:
    """
    Call OpenAI Vision API to analyze images.

    Args:
        system_prompt: System instructions
        user_prompt: User prompt
        image_base64: Base64 encoded image

    Returns:
        AI response as string
    """
    try:
        response = o4_service.default_client.chat.completions.create(
            model="gpt-4o",  # use vision model
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            },
                        },
                    ],
                },
            ],
            max_tokens=4000,
        )

        if response.choices[0].message.content is None:
            raise ValueError("No content returned from OpenAI Vision API")

        return response.choices[0].message.content

    except Exception as e:
        print(f"Error in Vision API call: {str(e)}")
        raise


def generate_ics_file(schedule_data: Dict[str, Any]) -> str:
    """
    Generate ICS calendar file from schedule data.

    Args:
        schedule_data: Dictionary containing course and event information

    Returns:
        ICS file content as string
    """
    course_name = schedule_data.get("course_name", "Course")
    course_code = schedule_data.get("course_code", "COURSE-101")
    events = schedule_data.get("events", [])

    # ICS file header
    ics_content = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Syllendar//AI Generated Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:{course_name} ({course_code})",
        "X-WR-TIMEZONE:UTC",
    ]

    # Add events
    for event in events:
        title = event.get("title", "Event")
        start_time = event.get("start_time", "2024-01-15T10:00:00")
        end_time = event.get("end_time", "2024-01-15T11:30:00")
        location = event.get("location", "")
        description = event.get("description", "")
        recurrence = event.get("recurrence", "")
        days = event.get("days", [])

        # Convert to ICS format
        start_dt = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
        end_dt = datetime.fromisoformat(end_time.replace("Z", "+00:00"))

        # Format dates for ICS (using local time without timezone indicator)
        start_ics = start_dt.strftime("%Y%m%dT%H%M%S")
        end_ics = end_dt.strftime("%Y%m%dT%H%M%S")
        created_ics = datetime.now().strftime("%Y%m%dT%H%M%SZ")

        # Generate unique ID
        uid = f"{course_code}-{title}-{start_ics}@syllendar.com"

        # Add event
        ics_content.extend(
            [
                "BEGIN:VEVENT",
                f"UID:{uid}",
                f"DTSTART:{start_ics}",
                f"DTEND:{end_ics}",
                f"DTSTAMP:{created_ics}",
                f"SUMMARY:{title}",
                f"DESCRIPTION:{description}",
            ]
        )

        if location:
            ics_content.append(f"LOCATION:{location}")

        # Add recurrence rule if specified
        if recurrence == "weekly" and days:
            # Convert days to ICS format
            day_map = {
                "Monday": "MO",
                "Tuesday": "TU",
                "Wednesday": "WE",
                "Thursday": "TH",
                "Friday": "FR",
                "Saturday": "SA",
                "Sunday": "SU",
            }
            ics_days = [day_map.get(day, day) for day in days]
            rrule = f"FREQ=WEEKLY;BYDAY={','.join(ics_days)};UNTIL=20251231T235959"
            ics_content.append(f"RRULE:{rrule}")

        ics_content.append("END:VEVENT")

    # ICS file footer
    ics_content.append("END:VCALENDAR")

    return "\r\n".join(ics_content)


@limiter.limit("50/day")
@router.post("/analyze-image")
async def analyze_image(request: Request, file: UploadFile = File(...)):
    _ = request
    """
    Analyze uploaded syllabus image and generate ICS calendar file.

    Args:
        file: Uploaded image file

    Returns:
        ICS file as response
    """
    try:
        print(f"Received file: {file.filename}, content_type: {file.content_type}")

        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read image data
        image_data = await file.read()

        # Convert to base64 for AI analysis
        image_base64 = base64.b64encode(image_data).decode("utf-8")

        system_prompt = SYLLABUS_ANALYSIS_SYSTEM_PROMPT
        user_prompt = SYLLABUS_ANALYSIS_USER_PROMPT

        # Use vision model for image analysis
        ai_response = call_vision_api(system_prompt, user_prompt, image_base64)

        print(f"AI Response: {ai_response}")

        try:

            # extract json
            json_match = re.search(r"\{.*\}", ai_response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                schedule_data = json.loads(json_str)
            else:
                schedule_data = json.loads(ai_response)

            print(f"Parsed schedule data: {schedule_data}")

        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Raw AI response: {ai_response}")

            raise HTTPException(
                status_code=500,
                detail=f"AI returned invalid JSON format. Response: {ai_response[:200]}...",
            )

        # Return extracted events as JSON
        return schedule_data

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


@limiter.limit("100/day")
@router.post("/generate-ics")
async def generate_ics_from_events(request: Request, events_data: Dict[str, Any]):
    _ = request
    """
    Generate ICS calendar file from events data.

    Args:
        events_data: Dictionary containing course and event information

    Returns:
        ICS file as response
    """
    try:
        # Generate ICS file
        ics_content = generate_ics_file(events_data)

        # Return ICS file
        return Response(
            content=ics_content,
            media_type="text/calendar",
            headers={"Content-Disposition": "attachment; filename=schedule.ics"},
        )

    except Exception as e:
        print(f"Error generating ICS file: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error generating ICS file: {str(e)}"
        )


@limiter.limit("100/day")
@router.post("/generate-ics-selected")
async def generate_ics_from_selected_events(
    request: Request, selected_events_data: Dict[str, Any]
):
    _ = request
    """
    Generate ICS calendar file from selected events only.

    Args:
        selected_events_data: Dictionary containing course info and selected events
            {
                "course_name": "Course Name",
                "course_code": "COURSE-101",
                "selected_events": [list of selected event objects]
            }

    Returns:
        ICS file as response
    """
    try:
        # Extract course info and selected events
        course_name = selected_events_data.get("course_name", "Selected Events")
        course_code = selected_events_data.get("course_code", "SELECTED")
        selected_events = selected_events_data.get("selected_events", [])

        # Create events data structure for ICS generation
        events_data = {
            "course_name": course_name,
            "course_code": course_code,
            "events": selected_events,
        }

        # Generate ICS file
        ics_content = generate_ics_file(events_data)

        # Return ICS file
        return Response(
            content=ics_content,
            media_type="text/calendar",
            headers={"Content-Disposition": "attachment; filename=selected_events.ics"},
        )

    except Exception as e:
        print(f"Error generating ICS file from selected events: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error generating ICS file: {str(e)}"
        )


@limiter.limit("50/day")
@router.post("/chat")
async def chat_with_assistant(
    request: Request, message: str = Form(...), conversation_history: str = Form(None)
):
    _ = request
    """
    Chat with the AI assistant for schedule management.
    """
    try:
        # Build the conversation context
        conversation_context = ""
        if conversation_history:
            try:
                history = json.loads(conversation_history)
                for msg in history:
                    role = "User" if msg.get("isUser", False) else "Assistant"
                    conversation_context += f"{role}: {msg.get('text', '')}\n"
            except json.JSONDecodeError:
                # if malformed data, just ignore
                pass

        # Add current message
        conversation_context += f"User: {message}\n"

        # Build system prompt with current datetime context to anchor relative dates
        now = datetime.now().astimezone()
        system_prompt_with_now = (
            CHAT_SYSTEM_PROMPT
            + "\n\n"
            + "Current datetime (ISO 8601, include timezone offset): "
            + now.isoformat()
            + "\n"
            + "Interpret relative dates like 'today', 'tomorrow', and weekdays using this current datetime."
        )

        # Call the AI service with the chat prompt and conversation context
        response = o4_service.default_client.chat.completions.create(
            model=o4_service.model,
            messages=[
                {"role": "system", "content": system_prompt_with_now},
                {"role": "user", "content": conversation_context},
            ],
            max_completion_tokens=12000,
            reasoning_effort=o4_service.reasoning_effort,
        )

        if response.choices[0].message.content is None:
            raise ValueError("No content returned from OpenAI o4-mini")

        response = response.choices[0].message.content

        # Parse the JSON response
        try:
            parsed_response = json.loads(response)
            # Only return the response text and ICS data separately, never the full JSON
            if parsed_response.get("response"):
                result = {"action": "chat", "response": parsed_response["response"]}
                if parsed_response.get(
                    "action"
                ) == "generate_ics" and parsed_response.get("ics_data"):
                    result["action"] = "generate_ics"
                    result["ics_data"] = parsed_response["ics_data"]
                return result
            else:
                # If no response field, return a clean error message
                return {
                    "action": "chat",
                    "response": "I apologize, but I encountered an issue processing your request. Please try again.",
                }
        except json.JSONDecodeError:
            # If it's not valid JSON, wrap the plain text response in JSON format
            return {"action": "chat", "response": response}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing chat message: {str(e)}"
        )


@limiter.limit("50/day")
@router.post("/chat-stream")
async def chat_with_assistant_stream(
    request: Request, message: str = Form(...), conversation_history: str = Form(None)
):
    _ = request
    """
    Chat with the AI assistant for schedule management using streaming.
    """
    try:
        # Build the conversation context
        conversation_context = ""
        if conversation_history:
            try:
                history = json.loads(conversation_history)
                for msg in history:
                    role = "User" if msg.get("isUser", False) else "Assistant"
                    conversation_context += f"{role}: {msg.get('text', '')}\n"
            except json.JSONDecodeError:
                # If history is malformed, ignore it
                pass

        # Add current message
        conversation_context += f"User: {message}\n"

        async def generate_stream():
            full_response = ""
            # State for incremental extraction of the JSON field "response":"..."
            response_started = False
            response_closed = False
            response_start_index = (
                -1
            )  # index in full_response where content of response starts
            last_emitted_index = -1  # last emitted char index (exclusive)
            try:
                now = datetime.now().astimezone()
                system_prompt_with_now = (
                    CHAT_SYSTEM_PROMPT
                    + "\n\n"
                    + "Current datetime (ISO 8601, include timezone offset): "
                    + now.isoformat()
                    + "\n"
                    + "Interpret relative dates like 'today', 'tomorrow', and weekdays using this current datetime."
                )

                async for chunk in call_o4_api_stream(
                    system_prompt_with_now, conversation_context
                ):
                    if not chunk:
                        continue
                    prev_len = len(full_response)
                    full_response += chunk

                    # Detect the start of the response string once
                    if not response_started:
                        # Find pattern: "response"\s*:\s*"
                        match = re.search(r'"response"\s*:\s*"', full_response)
                        if match:
                            response_started = True
                            # The content starts right after the opening quote
                            response_start_index = match.end()
                            last_emitted_index = response_start_index

                    # If we are within the response string and not closed, emit newly arrived chars
                    if response_started and not response_closed:
                        # We need to scan for closing quote, considering escapes
                        i = max(prev_len, response_start_index)
                        escape = False
                        closing_pos = None
                        while i < len(full_response):
                            ch = full_response[i]
                            if escape:
                                escape = False
                            else:
                                if ch == "\\":
                                    escape = True
                                elif ch == '"':
                                    # Found closing quote for the response string
                                    closing_pos = i
                                    break
                            i += 1

                        # Determine how much new content to emit (up to current end or closing quote)
                        end_index = (
                            closing_pos
                            if closing_pos is not None
                            else len(full_response)
                        )
                        if last_emitted_index != -1 and end_index > last_emitted_index:
                            new_text = full_response[last_emitted_index:end_index]
                            if new_text:
                                yield f"data: {json.dumps({'chunk': new_text})}\n\n"
                                last_emitted_index = end_index

                        if closing_pos is not None:
                            response_closed = True

                # After stream ends, try to emit ICS data if present
                try:
                    final_parsed = json.loads(full_response)
                    if final_parsed.get(
                        "action"
                    ) == "generate_ics" and final_parsed.get("ics_data"):
                        yield f"data: {json.dumps({'ics_data': final_parsed['ics_data']})}\n\n"
                except json.JSONDecodeError:
                    # Ignore; model might have returned plain text
                    pass

                yield f"data: {json.dumps({'done': True})}\n\n"

            except Exception as e:
                print(f"Error in streaming: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={
                "X-Accel-Buffering": "no",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing chat message: {str(e)}"
        )
