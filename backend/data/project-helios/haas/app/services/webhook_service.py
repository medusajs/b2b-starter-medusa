import asyncio
import hmac
import hashlib
import json
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import aiohttp
from app.models.webhooks import (
    WebhookEvent, WebhookConfig, WebhookDelivery, WebhookPayload
)
from app.models.distributors import Distributor
from app.services.distributor_service import get_distributor_by_id


# Mock webhook configurations - replace with database in production
webhook_configs: Dict[str, WebhookConfig] = {
    "default": WebhookConfig(
        url="https://webhook.site/test",  # Replace with actual webhook URL
        secret="haas-webhook-secret",
        events=[
            "connection_submitted",
            "connection_approved",
            "connection_rejected"
        ]
    )
}


class WebhookService:
    def __init__(self):
        self.max_retries = 3
        self.retry_delay = 60  # seconds
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    def get_webhook_config(
        self, config_id: str = "default"
    ) -> Optional[WebhookConfig]:
        """Get webhook configuration by ID."""
        return webhook_configs.get(config_id)

    def create_webhook_payload(
        self,
        event: WebhookEvent,
        distributor: Distributor,
        connection_request: Optional[Dict[str, Any]] = None,
        status_change: Optional[Dict[str, Any]] = None
    ) -> WebhookPayload:
        """Create standardized webhook payload."""
        payload = WebhookPayload(
            event_type=event.event_type,
            request_id=event.request_id,
            distributor={
                "id": distributor.id,
                "name": distributor.name,
                "code": distributor.code,
                "region": distributor.region
            },
            connection_request=connection_request,
            status_change=status_change,
            timestamp=event.timestamp
        )

        # Add signature for verification
        payload.signature = self._generate_signature(payload.dict())

        return payload

    def _generate_signature(self, payload_dict: Dict[str, Any]) -> str:
        """Generate HMAC signature for webhook verification."""
        config = self.get_webhook_config()
        if not config or not config.secret:
            return ""

        # Remove signature from payload for signing
        payload_copy = payload_dict.copy()
        payload_copy.pop('signature', None)

        # Create signature
        message = json.dumps(payload_copy, sort_keys=True, default=str)
        signature = hmac.new(
            config.secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()

        return signature

    async def send_webhook(
        self,
        event: WebhookEvent,
        distributor: Distributor,
        connection_request: Optional[Dict[str, Any]] = None,
        status_change: Optional[Dict[str, Any]] = None
    ) -> WebhookDelivery:
        """Send webhook notification asynchronously."""
        if not self.session:
            raise RuntimeError(
                "WebhookService must be used as async context manager"
            )

        config = self.get_webhook_config()
        if not config:
            raise ValueError("Webhook configuration not found")

        # Check if event type is enabled
        if event.event_type not in config.events:
            return WebhookDelivery(
                webhook_id=f"{event.request_id}_{event.event_type}",
                event=event,
                status="skipped",
                error_message="Event type not enabled"
            )

        payload = self.create_webhook_payload(
            event, distributor, connection_request, status_change
        )

        timestamp = int(datetime.utcnow().timestamp())
        webhook_id = f"{event.request_id}_{event.event_type}_{timestamp}"

        delivery = WebhookDelivery(
            webhook_id=webhook_id,
            event=event,
            status="pending"
        )

        # Send webhook with retry logic
        for attempt in range(self.max_retries):
            try:
                delivery.attempts = attempt + 1
                delivery.last_attempt = datetime.utcnow()

                headers = {
                    "Content-Type": "application/json",
                    "User-Agent": "HaaS-Platform/1.0",
                    "X-Webhook-ID": webhook_id,
                    "X-Event-Type": event.event_type
                }

                # Add custom headers if configured
                if config.headers:
                    headers.update(config.headers)

                timeout = aiohttp.ClientTimeout(total=30)
                async with self.session.post(
                    config.url,
                    json=payload.dict(),
                    headers=headers,
                    timeout=timeout
                ) as response:
                    delivery.response_status = response.status

                    if response.status == 200:
                        delivery.status = "delivered"
                        break
                    else:
                        delivery.status = "failed"
                        delivery.error_message = f"HTTP {response.status}"

            except Exception as e:
                delivery.status = "failed"
                delivery.error_message = str(e)

            # Schedule next retry if not successful
            if (delivery.status != "delivered" and
                    attempt < self.max_retries - 1):
                delay = timedelta(seconds=self.retry_delay)
                delivery.next_attempt = datetime.utcnow() + delay
                await asyncio.sleep(self.retry_delay)

        return delivery

    async def trigger_connection_event(
        self,
        event_type: str,
        request_id: str,
        distributor_id: int,
        connection_request: Optional[Dict[str, Any]] = None,
        status_change: Optional[Dict[str, Any]] = None
    ) -> Optional[WebhookDelivery]:
        """Trigger webhook for connection-related events."""
        distributor = get_distributor_by_id(distributor_id)
        if not distributor:
            return None

        event = WebhookEvent(
            event_type=event_type,
            request_id=request_id,
            distributor_id=distributor_id,
            distributor_code=distributor.code,
            data={
                "connection_request": connection_request,
                "status_change": status_change
            },
            timestamp=datetime.utcnow()
        )

        async with self as webhook_service:
            delivery = await webhook_service.send_webhook(
                event, distributor, connection_request, status_change
            )

        return delivery


# Global webhook service instance
webhook_service = WebhookService()


async def trigger_webhook_event(
    event_type: str,
    request_id: str,
    distributor_id: int,
    connection_request: Optional[Dict[str, Any]] = None,
    status_change: Optional[Dict[str, Any]] = None
) -> Optional[WebhookDelivery]:
    """Convenience function to trigger webhook events."""
    return await webhook_service.trigger_connection_event(
        event_type, request_id, distributor_id,
        connection_request, status_change
    )

