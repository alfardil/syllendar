"""
Routes to invoke our LLM and generate responses.

"/test" tests our o4-mini implementation without streaming.
"/stream-test" tests our o4-mini implementation with streaming.
"/analyze-image" analyzes uploaded syllabus images and generates ICS files.
"/analyze-pdf" analyzes uploaded PDF syllabi and extracts exam events.
"/generate-ics" generates ICS calendar files from events data.
"/generate-ics-selected" generates ICS calendar files from selected events only.

"""

import base64
import io
import json
import os
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any

import PyPDF2
from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse, Response
from openai import OpenAI

from app.services.o4_mini_service import OpenAIo4Service
from app.prompts import (
    TEST_SYSTEM_PROMPT,
    TEST_DATA,
    SYLLABUS_ANALYSIS_SYSTEM_PROMPT,
    SYLLABUS_ANALYSIS_USER_PROMPT,
    PDF_EXAM_ANALYSIS_SYSTEM_PROMPT,
    PDF_EXAM_ANALYSIS_USER_PROMPT,
    CHAT_SYSTEM_PROMPT,
)


load_dotenv()

router = APIRouter(prefix="/generate", tags=["OpenAI"])

o4_service = OpenAIo4Service()


def extract_text_from_pdf(pdf_data: bytes) -> str:
    """
    Extract text content from PDF bytes.

    Args:
        pdf_data: PDF file as bytes

    Returns:
        Extracted text content
    """
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_data))
        text = ""

        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"

        return text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")


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
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # Use GPT-4 Vision model
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


@router.get("/test")
async def test():
    """Test route for GPT implementation."""

    system_prompt: str = TEST_SYSTEM_PROMPT
    data: str = TEST_DATA

    return o4_service.call_o4_api(system_prompt, data)


@router.get("/stream-test")
async def stream_test():
    """Test route for GPT's streaming implementation."""

    system_prompt: str = TEST_SYSTEM_PROMPT
    data: str = TEST_DATA

    async def generate_stream():
        async for chunk in o4_service.call_o4_api_stream(system_prompt, data):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "X-Accel-Buffering": "no",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
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

        # System prompt for syllabus analysis
        system_prompt = SYLLABUS_ANALYSIS_SYSTEM_PROMPT

        # Create the prompt with image for vision model
        user_prompt = SYLLABUS_ANALYSIS_USER_PROMPT

        # Use vision model for image analysis
        ai_response = call_vision_api(system_prompt, user_prompt, image_base64)

        print(f"AI Response: {ai_response}")

        # Parse AI response (assuming it returns JSON)
        try:

            # Try to extract JSON from the response if it's wrapped in text
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
            # If AI doesn't return valid JSON, raise an error instead of using sample data
            raise HTTPException(
                status_code=500,
                detail=f"AI returned invalid JSON format. Response: {ai_response[:200]}...",
            )

        # Return extracted events as JSON
        return schedule_data

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


@router.post("/analyze-pdf")
async def analyze_pdf(file: UploadFile = File(...)):
    """
    Analyze uploaded PDF syllabus and extract exam events.

    Args:
        file: Uploaded PDF file

    Returns:
        Extracted exam events as JSON
    """
    try:
        print(f"Received PDF file: {file.filename}, content_type: {file.content_type}")

        # Validate file type
        if not file.content_type or file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File must be a PDF")

        # Read PDF data
        pdf_data = await file.read()

        # Extract text from PDF
        pdf_text = extract_text_from_pdf(pdf_data)

        if not pdf_text.strip():
            raise HTTPException(status_code=400, detail="No text content found in PDF")

        print(f"Extracted PDF text length: {len(pdf_text)} characters")

        # Use o4 service to analyze the text
        ai_response = o4_service.call_o4_api(PDF_EXAM_ANALYSIS_SYSTEM_PROMPT, pdf_text)

        print(f"AI Response: {ai_response}")

        # Parse AI response (assuming it returns JSON)
        try:
            # Try to extract JSON from the response if it's wrapped in text
            json_match = re.search(r"\{.*\}", ai_response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                exam_data = json.loads(json_str)
            else:
                exam_data = json.loads(ai_response)

            print(f"Parsed exam data: {exam_data}")

        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Raw AI response: {ai_response}")
            # If AI doesn't return valid JSON, raise an error
            raise HTTPException(
                status_code=500,
                detail=f"AI returned invalid JSON format. Response: {ai_response[:200]}...",
            )

        # Return extracted events as JSON
        return exam_data

    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


@router.post("/generate-ics")
async def generate_ics_from_events(events_data: Dict[str, Any]):
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


@router.post("/generate-ics-selected")
async def generate_ics_from_selected_events(selected_events_data: Dict[str, Any]):
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


@router.post("/chat")
async def chat_with_assistant(
    message: str = Form(...), conversation_history: str = Form(None)
):
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
                # If history is malformed, ignore it
                pass

        # Add current message
        conversation_context += f"User: {message}\n"

        # Call the AI service with the chat prompt and conversation context
        response = o4_service.call_o4_api(
            system_prompt=CHAT_SYSTEM_PROMPT, data=conversation_context
        )

        # Parse the JSON response
        try:
            parsed_response = json.loads(response)
            return parsed_response
        except json.JSONDecodeError:
            # If it's not valid JSON, return as a chat response
            return {"action": "chat", "response": response}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing chat message: {str(e)}"
        )
