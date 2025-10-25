# ==========================================
# Ollama Resource — Local LLM Fallback
# OSS alternative to OpenAI (Qwen 2.5 20B)
# ==========================================

import os
import requests
from typing import List, Dict, Any, Optional
from dagster import ConfigurableResource
import json


class OllamaResource(ConfigurableResource):
    """
    Ollama resource for local LLM inference (embeddings + chat)
    
    Supports:
    - qwen2.5:20b (chat/completions)
    - nomic-embed-text (embeddings, 768 dims)
    - llama3.1:8b (fallback lightweight)
    
    Usage in assets:
        @asset
        def my_asset(ollama: OllamaResource):
            embeddings = ollama.embed(["text1", "text2"])
            response = ollama.chat("Explain solar panels")
    """
    
    host: str = "http://localhost:11434"
    model_chat: str = "qwen2.5:20b"
    model_embeddings: str = "nomic-embed-text"
    timeout: int = 60
    
    def _post(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Helper to POST to Ollama API"""
        try:
            response = requests.post(
                f"{self.host}{endpoint}",
                json=payload,
                timeout=self.timeout,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Ollama API error: {e}")
    
    def embed(
        self,
        texts: List[str],
        model: Optional[str] = None
    ) -> List[List[float]]:
        """
        Generate embeddings for texts
        
        Args:
            texts: List of strings to embed
            model: Override default embeddings model
        
        Returns:
            List of embedding vectors (768 dims for nomic-embed-text)
        """
        model = model or self.model_embeddings
        embeddings = []
        
        for text in texts:
            payload = {
                "model": model,
                "prompt": text
            }
            result = self._post("/api/embeddings", payload)
            embeddings.append(result.get("embedding", []))
        
        return embeddings
    
    def chat(
        self,
        prompt: str,
        system: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """
        Chat completion with local LLM
        
        Args:
            prompt: User message
            system: System prompt (optional)
            model: Override default chat model
            temperature: Sampling temperature (0-1)
            max_tokens: Max response tokens
        
        Returns:
            Generated text response
        """
        model = model or self.model_chat
        
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }
        
        result = self._post("/api/chat", payload)
        return result.get("message", {}).get("content", "")
    
    def chat_stream(
        self,
        prompt: str,
        system: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7
    ):
        """
        Streaming chat completion
        
        Yields response chunks as they are generated
        """
        model = model or self.model_chat
        
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
            "options": {
                "temperature": temperature
            }
        }
        
        try:
            response = requests.post(
                f"{self.host}/api/chat",
                json=payload,
                stream=True,
                timeout=self.timeout,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            
            for line in response.iter_lines():
                if line:
                    chunk = json.loads(line)
                    if "message" in chunk:
                        yield chunk["message"].get("content", "")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Ollama streaming error: {e}")
    
    def pull_model(self, model: str) -> Dict[str, Any]:
        """
        Pull/download model from Ollama registry
        
        Args:
            model: Model name (e.g., "qwen2.5:20b")
        
        Returns:
            Status dict
        """
        payload = {"name": model}
        return self._post("/api/pull", payload)
    
    def list_models(self) -> List[Dict[str, Any]]:
        """List all locally available models"""
        try:
            response = requests.get(
                f"{self.host}/api/tags",
                timeout=10
            )
            response.raise_for_status()
            return response.json().get("models", [])
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to list models: {e}")
    
    def health_check(self) -> bool:
        """Check if Ollama is running"""
        try:
            response = requests.get(
                f"{self.host}/api/tags",
                timeout=5
            )
            return response.status_code == 200
        except:
            return False


class HybridLLMResource(ConfigurableResource):
    """
    Hybrid LLM resource with automatic fallback
    
    Tries OpenAI first, falls back to Ollama on:
    - Rate limit errors (429)
    - Network timeouts
    - API key missing/invalid
    - Cost optimization (configurable threshold)
    
    Usage:
        @asset
        def my_asset(llm: HybridLLMResource):
            # Automatically uses OpenAI or Ollama
            embeddings = llm.embed(["text"])
            response = llm.chat("Hello")
    """
    
    openai_api_key: Optional[str] = None
    ollama_host: str = "http://localhost:11434"
    prefer_local: bool = False  # Force Ollama for cost savings
    openai_model: str = "gpt-4o"
    openai_embedding_model: str = "text-embedding-3-large"
    ollama_chat_model: str = "qwen2.5:20b"
    ollama_embedding_model: str = "nomic-embed-text"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._openai_available = bool(self.openai_api_key)
        self._ollama = OllamaResource(
            host=self.ollama_host,
            model_chat=self.ollama_chat_model,
            model_embeddings=self.ollama_embedding_model
        )
    
    def embed(
        self,
        texts: List[str],
        force_local: bool = False
    ) -> List[List[float]]:
        """
        Generate embeddings with fallback
        
        OpenAI: 3072 dims (text-embedding-3-large)
        Ollama: 768 dims (nomic-embed-text)
        
        Note: Dimension mismatch requires separate Qdrant collections
        """
        use_local = force_local or self.prefer_local or not self._openai_available
        
        if use_local:
            return self._ollama.embed(texts)
        
        # Try OpenAI
        try:
            import openai
            client = openai.OpenAI(api_key=self.openai_api_key)
            response = client.embeddings.create(
                model=self.openai_embedding_model,
                input=texts
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            # Fallback to Ollama
            if self._ollama.health_check():
                return self._ollama.embed(texts)
            raise Exception(f"Both OpenAI and Ollama failed: {e}")
    
    def chat(
        self,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        force_local: bool = False
    ) -> str:
        """
        Chat completion with fallback
        """
        use_local = force_local or self.prefer_local or not self._openai_available
        
        if use_local:
            return self._ollama.chat(
                prompt=prompt,
                system=system,
                temperature=temperature,
                max_tokens=max_tokens
            )
        
        # Try OpenAI
        try:
            import openai
            client = openai.OpenAI(api_key=self.openai_api_key)
            
            messages = []
            if system:
                messages.append({"role": "system", "content": system})
            messages.append({"role": "user", "content": prompt})
            
            response = client.chat.completions.create(
                model=self.openai_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            # Fallback to Ollama
            if self._ollama.health_check():
                return self._ollama.chat(
                    prompt=prompt,
                    system=system,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
            raise Exception(f"Both OpenAI and Ollama failed: {e}")
    
    def get_active_provider(self) -> str:
        """Return which provider is currently active"""
        if self.prefer_local or not self._openai_available:
            return "ollama"
        return "openai"
