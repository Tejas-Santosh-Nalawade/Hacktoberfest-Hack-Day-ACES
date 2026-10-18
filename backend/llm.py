import json
import logging
import os
import re
from typing import Callable

from fastapi import HTTPException
from openai import OpenAI

log = logging.getLogger("recap.llm")

BASE_URL = "https://inference.do-ai.run/v1/"

_client: OpenAI | None = None


def model_ids() -> tuple[str, str]:
    return (
        os.getenv("MODEL_ID", "gemma-4-31B-it"),
        os.getenv("FALLBACK_MODEL_ID", "openai-gpt-oss-120b"),
    )


def client() -> OpenAI:
    global _client
    if _client is None:
        key = os.getenv("MODEL_ACCESS_KEY")
        if not key:
            raise HTTPException(502, "Server is missing MODEL_ACCESS_KEY")
        _client = OpenAI(base_url=BASE_URL, api_key=key)
    return _client


def parse_json(text: str) -> dict:
    text = re.sub(r"```(?:json)?", "", text).strip()
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end <= start:
        raise ValueError("no JSON object in model output")
    return json.loads(text[start : end + 1])


def chat(system: str, user: str, parse: Callable[[str], object] | None = None):
    """Call the primary model, retrying once on the fallback.

    Returns (result, model_used); result is parse(text) if parse is given.
    """
    for model in model_ids():
        try:
            resp = client().chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                temperature=0.2,
                max_tokens=3000,
            )
            text = resp.choices[0].message.content or ""
            if not text.strip():
                raise ValueError("empty model output")
            return (parse(text) if parse else text), model
        except HTTPException:
            raise
        except Exception as e:  # network, API or parse error -> try fallback
            log.warning("model %s failed: %s", model, type(e).__name__)
    raise HTTPException(502, "AI is busy, please retry")


def _items(value, keys: tuple[str, ...]) -> list[dict]:
    if not isinstance(value, list):
        return []
    out = []
    for item in value:
        if isinstance(item, dict):
            out.append({k: str(item.get(k, "") or "") for k in keys})
        elif isinstance(item, str):
            out.append({k: (item if k == "concept" else "") for k in keys})
    return out


def normalize_review(d: dict, topic: str) -> dict:
    try:
        score = int(round(float(d.get("score", 0))))
    except (TypeError, ValueError):
        score = 0
    return {
        "topic": str(d.get("topic") or topic),
        "score": max(0, min(100, score)),
        "summary": str(d.get("summary") or ""),
        "correct": _items(d.get("correct"), ("concept", "note")),
        "partial": _items(d.get("partial"), ("concept", "what_was_said", "fix")),
        "wrong": _items(d.get("wrong"), ("concept", "what_was_said", "correct_version")),
        "missed": _items(d.get("missed"), ("concept", "why_it_matters"))[:5],
        "next_step": str(d.get("next_step") or ""),
    }
