from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from app.models.auth import (
    UserLogin,
    Token,
    User,
    RefreshTokenRequest,
    LogoutResponse
)
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    verify_token,
    add_token_to_blacklist,
    get_user
)
from app.auth.dependencies import get_current_active_user

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate user and return JWT tokens (access + refresh)."""
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_request: RefreshTokenRequest):
    """
    Refresh JWT access token using refresh token.

    Implements token rotation: returns new access_token + new refresh_token.
    Old refresh token is blacklisted after use.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Verify refresh token
    token_data = verify_token(
        refresh_request.refresh_token,
        credentials_exception,
        expected_type="refresh"
    )

    # Get user
    user = get_user(token_data.email)
    if not user:
        raise credentials_exception

    # Create new tokens
    new_access_token = create_access_token(data={"sub": user.email})
    new_refresh_token = create_refresh_token(data={"sub": user.email})

    # Blacklist old refresh token (7 days TTL)
    add_token_to_blacklist(refresh_request.refresh_token, expires_in=604800)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.post("/logout", response_model=LogoutResponse)
async def logout(token: str = Depends(oauth2_scheme)):
    """
    Logout user and invalidate access token.

    Adds token to Redis blacklist with TTL matching token expiration.
    Client should discard both access_token and refresh_token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Verify token is valid
    token_data = verify_token(
        token,
        credentials_exception,
        expected_type="access"
    )

    # Add to blacklist (1 hour TTL - matches access token expiration)
    success = add_token_to_blacklist(token, expires_in=3600)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed - Redis unavailable"
        )

    return LogoutResponse(
        message=f"User {token_data.email} logged out successfully",
        logged_out_at=datetime.utcnow().isoformat()
    )


@router.post("/register")
async def register(user_data: UserLogin):
    """Register new user - placeholder for future implementation."""
    return {"message": "User registration - Coming soon"}

