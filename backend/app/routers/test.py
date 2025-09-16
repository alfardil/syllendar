"""
Test routes for LLM implementation.

"/test" tests our o4-mini implementation without streaming.
"/stream-test" tests our o4-mini implementation with streaming.
"""

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse


from app.services.o4_mini_service import OpenAIo4Service
from app.prompts import TEST_SYSTEM_PROMPT, TEST_DATA
from app.routers.generate import call_o4_api_stream
from app.core.limiter import limiter

router = APIRouter(prefix="/test", tags=["Test"])

o4_service = OpenAIo4Service()


@limiter.limit("10/day")
@router.get("/")
async def test(request: Request):
    _ = request
    """Test route for GPT implementation."""

    system_prompt: str = TEST_SYSTEM_PROMPT
    data: str = TEST_DATA

    response = o4_service.default_client.chat.completions.create(
        model=o4_service.model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": data},
        ],
        max_completion_tokens=12000,
        reasoning_effort=o4_service.reasoning_effort,
    )

    if response.choices[0].message.content is None:
        raise ValueError("No content returned from OpenAI o4-mini")

    return response.choices[0].message.content


@limiter.limit("10/day")
@router.get("/stream")
async def stream_test(request: Request):
    _ = request
    """Test route for GPT's streaming implementation."""

    system_prompt: str = TEST_SYSTEM_PROMPT
    data: str = TEST_DATA

    async def generate_stream():
        async for chunk in call_o4_api_stream(system_prompt, data):
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
