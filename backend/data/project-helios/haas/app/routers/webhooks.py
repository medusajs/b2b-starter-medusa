from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.webhooks import WebhookConfig
from app.models.auth import User
from app.auth.dependencies import get_current_admin_user

router = APIRouter()


@router.get("/configs", response_model=List[WebhookConfig])
async def list_webhook_configs(
    current_user: User = Depends(get_current_admin_user)
):
    """List all webhook configurations (admin only)."""
    # Mock implementation - replace with database query
    from app.services.webhook_service import webhook_configs
    return list(webhook_configs.values())


@router.post("/configs", response_model=WebhookConfig)
async def create_webhook_config(
    config: WebhookConfig,
    current_user: User = Depends(get_current_admin_user)
):
    """Create new webhook configuration (admin only)."""
    # Mock implementation - replace with database storage
    from app.services.webhook_service import webhook_configs
    config_id = f"config_{len(webhook_configs) + 1}"
    webhook_configs[config_id] = config
    return config


@router.get("/configs/{config_id}", response_model=WebhookConfig)
async def get_webhook_config(
    config_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Get webhook configuration by ID (admin only)."""
    from app.services.webhook_service import webhook_configs
    config = webhook_configs.get(config_id)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook configuration not found"
        )
    return config


@router.put("/configs/{config_id}", response_model=WebhookConfig)
async def update_webhook_config(
    config_id: str,
    config: WebhookConfig,
    current_user: User = Depends(get_current_admin_user)
):
    """Update webhook configuration (admin only)."""
    from app.services.webhook_service import webhook_configs
    if config_id not in webhook_configs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook configuration not found"
        )
    webhook_configs[config_id] = config
    return config


@router.delete("/configs/{config_id}")
async def delete_webhook_config(
    config_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Delete webhook configuration (admin only)."""
    from app.services.webhook_service import webhook_configs
    if config_id not in webhook_configs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook configuration not found"
        )
    del webhook_configs[config_id]
    return {"message": "Webhook configuration deleted"}


@router.post("/test/{config_id}")
async def test_webhook_config(
    config_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Test webhook configuration by sending a test event."""
    from app.services.webhook_service import webhook_service
    from app.models.webhooks import WebhookEvent
    from app.models.distributors import Distributor
    from datetime import datetime

    config = webhook_service.get_webhook_config(config_id)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook configuration not found"
        )

    # Create test distributor
    test_distributor = Distributor(
        id=999,
        name="Test Distributor",
        code="TEST",
        region="Test Region",
        status="active",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    # Create test event
    test_event = WebhookEvent(
        event_type="test",
        request_id="test_123",
        distributor_id=999,
        distributor_code="TEST",
        data={"message": "Test webhook event"},
        timestamp=datetime.utcnow()
    )

    # Send test webhook
    try:
        delivery = await webhook_service.send_webhook(
            test_event, test_distributor
        )
        return {
            "message": "Test webhook sent",
            "status": delivery.status,
            "response_status": delivery.response_status,
            "error_message": delivery.error_message
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test webhook: {str(e)}"
        )

