"""Main entry point for the FastAPI application."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.routers import test, pdf, generate
from app.core.limiter import limiter
from typing import cast
from starlette.middleware.exceptions import ExceptionMiddleware

app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded, cast(ExceptionMiddleware, _rate_limit_exceeded_handler)
)

app.include_router(test.router)
app.include_router(pdf.router)
app.include_router(generate.router)


@app.get("/")
@limiter.limit("100/day")
async def root(request: Request):
    """Root API for the project."""
    return {
        "message": "Welcome to the Syllendar API!",
        "contributors": ["Alfardil Alam", "Abid Ali"],
    }
