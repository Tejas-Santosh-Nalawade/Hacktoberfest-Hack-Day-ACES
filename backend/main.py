import json

from dotenv import load_dotenv

load_dotenv()

from fastapi import APIRouter, FastAPI, File, HTTPException, UploadFile  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from extract import extract_text  # noqa: E402
from llm import chat, model_ids, normalize_review, parse_json, provider_label, reference_limit, targets  # noqa: E402
from prompts import DIARY_SYSTEM, REVIEW_SYSTEM, build_review_user  # noqa: E402
from schemas import (  # noqa: E402
    ExtractResponse,
    HealthResponse,
    ReportRequest,
    ReportResponse,
    ReviewRequest,
    ReviewResponse,
)

app = FastAPI(title="Recap Buddy API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/api")


@router.get("/health", response_model=HealthResponse)
def health():
    primary, fallback = model_ids()
    return {
        "status": "ok",
        "model": primary,
        "fallback_model": fallback,
        "provider": targets()[0][0],
        "provider_label": provider_label(),
    }


@router.post("/extract", response_model=ExtractResponse)
async def extract(file: UploadFile = File(...)):
    data = await file.read()
    return extract_text(file.filename or "", data)


@router.post("/review", response_model=ReviewResponse)
def review(req: ReviewRequest):
    if len(req.transcript.split()) < 15:
        raise HTTPException(400, "Explain a bit more — at least 15 words.")
    reference = req.reference
    limit = reference_limit()
    if reference and limit and len(reference) > limit:
        reference = reference[:limit]  # keep within a local model's context window
    user = build_review_user(req.topic, req.transcript, reference)
    data, model = chat(REVIEW_SYSTEM, user, parse=parse_json)
    result = normalize_review(data, req.topic)
    result["grounded"] = bool(req.reference and req.reference.strip())
    result["model"] = model
    return result


@router.post("/report", response_model=ReportResponse)
def report(req: ReportRequest):
    if not req.reviews:
        raise HTTPException(400, "No reviews to summarise yet.")
    payload = json.dumps(
        {"date": req.date, "reviews": [r.model_dump() for r in req.reviews]},
        ensure_ascii=False,
    )
    markdown, model = chat(DIARY_SYSTEM, payload)
    markdown = markdown.strip()
    if markdown.startswith("```"):
        markdown = markdown.strip("`").removeprefix("markdown").strip()
    return {"markdown": markdown, "model": model}


app.include_router(router)
