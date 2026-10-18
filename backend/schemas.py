from typing import Optional

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    model: str
    fallback_model: str


class ExtractResponse(BaseModel):
    filename: str
    pages: Optional[int] = None
    chars: int
    text: str
    truncated: bool


class ReviewRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=120)
    transcript: str
    reference: Optional[str] = None


class CorrectItem(BaseModel):
    concept: str = ""
    note: str = ""


class PartialItem(BaseModel):
    concept: str = ""
    what_was_said: str = ""
    fix: str = ""


class WrongItem(BaseModel):
    concept: str = ""
    what_was_said: str = ""
    correct_version: str = ""


class MissedItem(BaseModel):
    concept: str = ""
    why_it_matters: str = ""


class ReviewResponse(BaseModel):
    topic: str
    score: int = Field(ge=0, le=100)
    summary: str = ""
    correct: list[CorrectItem] = []
    partial: list[PartialItem] = []
    wrong: list[WrongItem] = []
    missed: list[MissedItem] = []
    next_step: str = ""
    grounded: bool = False
    model: str = ""


class ReportRequest(BaseModel):
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    reviews: list[ReviewResponse]


class ReportResponse(BaseModel):
    markdown: str
    model: str
