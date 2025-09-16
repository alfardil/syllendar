"""
PDF analysis routes.

"/analyze-pdf" analyzes uploaded PDF syllabi and extracts exam events.
"/analyze-pdf-stream" analyzes uploaded PDF syllabi with streaming.
"""

import io
import json
import re

import PyPDF2
from fastapi import APIRouter, Request, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse

from app.services.o4_mini_service import OpenAIo4Service
from app.prompts import PDF_EXAM_ANALYSIS_SYSTEM_PROMPT
from app.routers.generate import call_o4_api_stream
from app.core.limiter import limiter

router = APIRouter(prefix="/pdf", tags=["PDF Analysis"])

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


@limiter.limit("25/day")
@router.post("/analyze")
async def analyze_pdf(request: Request, file: UploadFile = File(...)):
    _ = request
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

        # Read PDF data and extract text
        pdf_data = await file.read()
        pdf_text = extract_text_from_pdf(pdf_data)

        if not pdf_text.strip():
            raise HTTPException(status_code=400, detail="No text content found in PDF")

        print(f"Extracted PDF text length: {len(pdf_text)} characters")

        response = o4_service.default_client.chat.completions.create(
            model=o4_service.model,
            messages=[
                {"role": "system", "content": PDF_EXAM_ANALYSIS_SYSTEM_PROMPT},
                {"role": "user", "content": pdf_text},
            ],
            max_completion_tokens=12000,
            reasoning_effort=o4_service.reasoning_effort,
        )

        if response.choices[0].message.content is None:
            raise ValueError("No content returned from OpenAI o4-mini")

        ai_response = response.choices[0].message.content

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


@limiter.limit("50/day")
@router.post("/analyze-stream")
async def analyze_pdf_stream(request: Request, file: UploadFile = File(...)):
    _ = request
    """
    Analyze uploaded PDF syllabus and extract exam events using streaming.

    Args:
        file: Uploaded PDF file

    Returns:
        Streamed analysis response
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

        async def generate_stream():
            # Send initial status
            yield f"data: {json.dumps({'status': 'analyzing', 'message': 'Analyzing PDF content...'})}\n\n"

            try:
                # Stream the AI analysis
                full_response = ""
                async for chunk in call_o4_api_stream(
                    PDF_EXAM_ANALYSIS_SYSTEM_PROMPT, pdf_text
                ):
                    full_response += chunk
                    yield f"data: {json.dumps({'status': 'streaming', 'chunk': chunk})}\n\n"

                # Parse the complete response
                try:
                    # Try to extract JSON from the response if it's wrapped in text
                    json_match = re.search(r"\{.*\}", full_response, re.DOTALL)
                    if json_match:
                        json_str = json_match.group()
                        exam_data = json.loads(json_str)
                    else:
                        exam_data = json.loads(full_response)

                    print(f"Parsed exam data: {exam_data}")
                    yield f"data: {json.dumps({'status': 'complete', 'data': exam_data})}\n\n"

                except json.JSONDecodeError as e:
                    print(f"JSON decode error: {e}")
                    print(f"Raw AI response: {full_response}")
                    yield f"data: {json.dumps({'status': 'error', 'message': f'AI returned invalid JSON format. Response: {full_response[:200]}...'})}\n\n"

            except Exception as e:
                print(f"Error in streaming analysis: {str(e)}")
                yield f"data: {json.dumps({'status': 'error', 'message': f'Error analyzing PDF: {str(e)}'})}\n\n"

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
        print(f"Error processing PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
