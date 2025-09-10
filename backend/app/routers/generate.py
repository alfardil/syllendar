"""
Routes to invoke our LLM and generate responses.

"/test" tests our o4-mini implementation without streaming.
"/stream-test" tests our o4-mini implementation with streaming.
"/analyze-image" analyzes uploaded syllabus images and generates ICS files.

"""

import base64
import io
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse, Response
from openai import OpenAI
from app.services.o4_mini_service import OpenAIo4Service


load_dotenv()

router = APIRouter(prefix="/generate", tags=["OpenAI"])

o4_service = OpenAIo4Service()


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

    system_prompt: str = """
    You are a friendly chatbot. For now, simply return the data you recieve.
    """

    data: str = "This is the test endpoint for your o4 mini call."

    return o4_service.call_o4_api(system_prompt, data)


@router.get("/stream-test")
async def stream_test():
    """Test route for GPT's streaming implementation."""

    system_prompt: str = """
    You are a friendly chatbot. For now, simply return the data you recieve.
    """

    data: str = "This is the test endpoint for your o4 mini call."

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
        system_prompt = """
        You are an expert at analyzing images containing event schedules, course syllabi, and calendar information.
        
        IMPORTANT: You must analyze the ACTUAL content visible in the image. Do not make up or use placeholder data.
        
        Extract all event and schedule information from the image including:
        - Event names/titles
        - Dates and times
        - Locations/venues
        - Event descriptions
        - Any recurring patterns
        - Course or program names (if applicable)
        
        Return ONLY a valid JSON object with this exact structure (no additional text):
        {
            "course_name": "Actual name from image or 'Events' if no course name",
            "course_code": "Actual code from image or 'EVENTS' if no code",
            "events": [
                {
                    "title": "Exact event name from image",
                    "start_time": "YYYY-MM-DDTHH:MM:SS format (use the timezone shown in image, convert ET to local time)",
                    "end_time": "YYYY-MM-DDTHH:MM:SS format (use the timezone shown in image, convert ET to local time)", 
                    "recurrence": "weekly/daily/once or empty string",
                    "days": ["Monday", "Tuesday", etc. or empty array],
                    "location": "Exact location from image or empty string",
                    "description": "Event description from image or empty string"
                }
            ]
        }
        
        Use the actual dates from the image. If you see September 2025, use September 2025.
        Be precise and only include information actually visible in the image.
        """

        # Create the prompt with image for vision model
        user_prompt = "Analyze this image and extract all event information. Look for event names, dates, times, locations, and any other schedule details. Return only the JSON format specified in the system prompt."

        # Use vision model for image analysis
        ai_response = call_vision_api(system_prompt, user_prompt, image_base64)

        print(f"AI Response: {ai_response}")

        # Parse AI response (assuming it returns JSON)
        try:
            import json
            import re

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
