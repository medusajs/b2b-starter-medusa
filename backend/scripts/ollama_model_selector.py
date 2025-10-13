#!/usr/bin/env python3
"""
Utility helpers to detect and pick the best Ollama model for image
and text tasks.

Usage:
    from ollama_model_selector import pick_image_model, pick_text_model

The selector honors the environment variables OLLAMA_IMAGE_MODEL and
OLLAMA_TEXT_MODEL when set. Otherwise it selects the first installed model
that matches a sensible preference order (LLaVA -> Gemma -> others).
"""
from typing import List, Optional
import os

try:
    import ollama
    OLLAMA_AVAILABLE = True
except Exception:
    # Ensure symbol exists so static analyzers don't complain.
    ollama = None  # type: ignore
    OLLAMA_AVAILABLE = False


def installed_model_names() -> List[str]:
    """Return a list of model names currently installed in Ollama.

    If Ollama is not available or an error occurs, returns an empty list.
    """
    if not OLLAMA_AVAILABLE:
        return []

    try:
        models = ollama.list().get('models', [])
        names = []
        for m in models:
            name = m.get('name') or m.get('model')
            if name:
                names.append(str(name))
        return names
    except Exception:
        return []


def _pick_model(
    preferences: Optional[List[str]] = None,
    env_var: Optional[str] = None,
) -> Optional[str]:
    """Internal helper: pick a model by preference list or heuristics.

    - If env_var is set and the environment contains a name, prefer it.
    - Try to match any preference substring against installed names.
    - Fall back to a simple keyword heuristic.
    """
    # 1) env override
    if env_var:
        env_name = os.environ.get(env_var)
        if env_name:
            names = installed_model_names()
            # Exact installed model requested
            if env_name in names:
                return env_name

            # Substring match to an installed model
            env_low = env_name.lower()
            for n in names:
                if env_low in n.lower():
                    return n

            # Requested model isn't installed; return raw name so caller
            # can decide whether to pull it or report a warning.
            return env_name

    names = installed_model_names()
    if not names:
        return None

    # 2) exact or substring preferences
    if preferences:
        for pref in preferences:
            pref_low = pref.lower()
            for name in names:
                name_low = name.lower()
                if pref_low == name_low:
                    return name
                if pref_low in name_low:
                    return name
                if name_low in pref_low:
                    return name

    # 3) heuristic keywords
    heuristics = [
        'gpt-oss',     # Installed model
        'gpt',
        'gemma3',      # Prefer Gemma 3 over older Gemma
        'gemma',
        'llava',
        'cogvlm',
        'blip',
        'qwen',
        'bakllava',
        'bakl',
    ]

    for kw in heuristics:
        for name in names:
            if kw in name.lower():
                return name

    # 4) fallback to first installed model
    return names[0]


def pick_image_model() -> Optional[str]:
    """Pick the best available image-capable model.

    Preference order (by default): Llama 3.2 Vision (90B/11B), GPT-OSS,
    LLaVA variants, Gemma 3 family.

    The environment variable OLLAMA_IMAGE_MODEL can override the
    selection.
    """
    preferences = [
        'llama3.2-vision:90b',  # Meta's latest - best quality
        'llama3.2-vision:11b',  # Meta's latest - good balance
        'llama3.2-vision',      # Any Llama 3.2 Vision
        'gpt-oss:20b',          # Installed - strong multimodal
        'llava:34b',
        'llava:13b',
        'llava:7b',
        'bakllava',
        'gemma3:12b',           # Gemma 3 multimodal
        'gemma3:4b',            # Installed - multimodal
        'gemma:4b',
    ]
    return _pick_model(preferences=preferences, env_var='OLLAMA_IMAGE_MODEL')


def pick_text_model() -> Optional[str]:
    """Pick a text-first model (for non-vision tasks).

    Environment variable OLLAMA_TEXT_MODEL overrides selection.
    """
    preferences = [
        'gemma3:4b',       # Installed - excellent for text analysis
        'gpt-oss:20b',     # Installed - can handle text too
        'gemma3:8b',
        'llama3',
        'llama',
    ]
    return _pick_model(preferences=preferences, env_var='OLLAMA_TEXT_MODEL')


def list_models() -> List[str]:
    """Return list of installed models (helper for scripts)."""
    return installed_model_names()
