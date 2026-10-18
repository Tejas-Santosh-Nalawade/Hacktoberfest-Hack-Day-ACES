import json
import logging
import os
import re
from typing import Callable

from fastapi import HTTPException
from openai import OpenAI

log = logging.getLogger("recap.llm")

# Every provider speaks the OpenAI chat-completions API, so one client type covers all three.
PROVIDERS = {
    "digitalocean": {
        "label": "DigitalOcean",
        "base_url": "https://inference.do-ai.run/v1/",
        "key_env": "MODEL_ACCESS_KEY",
        "model": "gemma-4-31B-it",
        "fallback_model": "openai-gpt-oss-120b",
        "max_tokens": 3000,
    },
    "gemini": {
        "label": "Google AI Studio",
        "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/",
        "key_env": "GEMINI_API_KEY",
        "model": "gemma-4-26b-a4b-it",
        "fallback_model": "gemma-4-31b-it",
        # Gemma 4 always thinks first; its thoughts count towards the output budget.
        "max_tokens": 8192,
    },
    "lmstudio": {
        "label": "LM Studio",
        "base_url": None,  # LMSTUDIO_BASE_URL, default http://localhost:1234/v1/
        "key_env": None,
        "model": "google/gemma-4-e4b",
        "fallback_model": "google/gemma-4-e4b",
        # Thinking + answer must fit the loaded context (16K by default), next to the prompt.
        "max_tokens": 4096,
        "max_reference_chars": 36_000,
        "timeout": 400,
    },
    "ollama": {
        "label": "Ollama",
        "base_url": None,  # OLLAMA_BASE_URL, default http://localhost:11434/v1/
        "key_env": None,
        "model": "gemma4",
        "fallback_model": "gemma4",
        "max_tokens": 4096,
        "max_reference_chars": 36_000,
        "timeout": 400,
    },
}

LOCAL = {
    "lmstudio": ("LMSTUDIO_BASE_URL", "http://localhost:1234/v1/", "lm-studio"),
    "ollama": ("OLLAMA_BASE_URL", "http://localhost:11434/v1/", "ollama"),
}

_clients: dict[str, OpenAI] = {}


def _provider(name: str) -> dict:
    if name not in PROVIDERS:
        raise HTTPException(500, f"Unknown LLM provider '{name}'. Use one of: {', '.join(PROVIDERS)}")
    return PROVIDERS[name]


def targets() -> list[tuple[str, str]]:
    """Ordered (provider, model) pairs to try: primary, then fallback."""
    primary = os.getenv("LLM_PROVIDER", "digitalocean").strip().lower()
    fallback = os.getenv("FALLBACK_PROVIDER", primary).strip().lower()
    p, f = _provider(primary), _provider(fallback)
    out = [
        (primary, os.getenv("MODEL_ID") or p["model"]),
        (fallback, os.getenv("FALLBACK_MODEL_ID") or (f["fallback_model"] if fallback == primary else f["model"])),
    ]
    return list(dict.fromkeys(out))  # drop the duplicate if primary == fallback


def model_ids() -> tuple[str, str]:
    t = targets()
    return t[0][1], t[-1][1]


def provider_label() -> str:
    return _provider(targets()[0][0])["label"]


def reference_limit() -> int | None:
    """Max characters of notes the primary provider can take (local models have small contexts)."""
    return _provider(targets()[0][0]).get("max_reference_chars")


def client(provider: str) -> OpenAI:
    if provider not in _clients:
        cfg = _provider(provider)
        if provider in LOCAL:
            env, default_url, key = LOCAL[provider]  # local servers ignore the key; the SDK needs one
            base_url = os.getenv(env, default_url)
        else:
            base_url = cfg["base_url"]
            key = os.getenv(cfg["key_env"])
            if not key:
                raise HTTPException(502, f"Server is missing {cfg['key_env']}")
        timeout = float(os.getenv("LLM_TIMEOUT") or cfg.get("timeout", 150))
        _clients[provider] = OpenAI(base_url=base_url, api_key=key, timeout=timeout, max_retries=0)
    return _clients[provider]


_THOUGHTS = re.compile(r"<(thought|think|thinking)>.*?</\1>", re.S | re.I)


def strip_thoughts(text: str) -> str:
    """Remove reasoning blocks some open models (Gemma 4, gpt-oss, Qwen) emit before the answer."""
    text = _THOUGHTS.sub("", text)
    if re.search(r"<(thought|think|thinking)>", text, re.I):
        raise ValueError("model output was cut off while thinking")
    return text.strip()


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
    missing_key, real_failures = None, 0
    for provider, model in targets():
        try:
            resp = client(provider).chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                temperature=0.2,
                max_tokens=_provider(provider)["max_tokens"],
            )
            text = strip_thoughts(resp.choices[0].message.content or "")
            if not text:
                raise ValueError("empty model output")
            return (parse(text) if parse else text), model
        except HTTPException as e:
            missing_key = e  # this provider isn't configured; try the next one
            log.warning("provider %s skipped: %s", provider, e.detail)
        except Exception as e:  # network, API or parse error -> try fallback
            real_failures += 1
            log.warning("model %s/%s failed: %s: %s", provider, model, type(e).__name__, str(e)[:200])
    if missing_key and not real_failures:
        raise missing_key
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
