"""
HaaS Platform - Authentication API Tests
Test suite for all 5 auth endpoints: login, refresh, logout, register, profile
"""
import pytest
from datetime import datetime, timedelta
from jose import jwt
from fastapi import status


# ==================== Test Login Endpoint ====================

@pytest.mark.auth
@pytest.mark.unit
class TestLogin:
    """Test POST /auth/login endpoint."""

    def test_login_success(self, client, test_user_hashed, mock_redis):
        """Test successful login with valid credentials."""
        response = client.post(
            "/auth/login",
            data={
                "username": test_user_hashed["email"],
                "password": "testpass123"
            }
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Verify response structure
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

        # Verify tokens are valid JWTs
        assert len(data["access_token"]) > 0
        assert len(data["refresh_token"]) > 0

    def test_login_invalid_email(self, client, mock_redis):
        """Test login with non-existent email."""
        response = client.post(
            "/auth/login",
            data={
                "username": "nonexistent@haas.com",
                "password": "anypassword"
            }
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_invalid_password(
        self,
        client,
        test_user_hashed,
        mock_redis
    ):
        """Test login with wrong password."""
        response = client.post(
            "/auth/login",
            data={
                "username": test_user_hashed["email"],
                "password": "wrongpassword"
            }
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_missing_credentials(self, client):
        """Test login without credentials."""
        response = client.post("/auth/login", data={})

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


# ==================== Test Refresh Token Endpoint ====================

@pytest.mark.auth
@pytest.mark.unit
class TestRefreshToken:
    """Test POST /auth/refresh endpoint."""

    def test_refresh_token_success(
        self,
        client,
        refresh_token,
        mock_redis
    ):
        """Test successful token refresh."""
        response = client.post(
            "/auth/refresh",
            json={"refresh_token": refresh_token}
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Verify new tokens returned
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

        # Verify old token is blacklisted
        assert mock_redis.exists(f"blacklist:{refresh_token}") > 0

    def test_refresh_with_access_token_fails(
        self,
        client,
        access_token,
        mock_redis
    ):
        """Test refresh fails when using access token instead of refresh."""
        response = client.post(
            "/auth/refresh",
            json={"refresh_token": access_token}
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_with_invalid_token(self, client, mock_redis):
        """Test refresh with invalid token."""
        response = client.post(
            "/auth/refresh",
            json={"refresh_token": "invalid.token.here"}
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_with_expired_token(self, client, mock_redis):
        """Test refresh with expired token."""
        # Create expired refresh token
        from app.config import settings

        payload = {
            "sub": "test@haas.com",
            "exp": datetime.utcnow() - timedelta(days=1),
            "type": "refresh"
        }
        expired_token = jwt.encode(
            payload,
            settings.SECRET_KEY,
            settings.ALGORITHM
        )

        response = client.post(
            "/auth/refresh",
            json={"refresh_token": expired_token}
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_with_blacklisted_token(
        self,
        client,
        refresh_token,
        mock_redis
    ):
        """Test refresh fails with already blacklisted token."""
        # Blacklist the token
        mock_redis.setex(f"blacklist:{refresh_token}", 604800, "revoked")

        response = client.post(
            "/auth/refresh",
            json={"refresh_token": refresh_token}
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ==================== Test Logout Endpoint ====================

@pytest.mark.auth
@pytest.mark.unit
class TestLogout:
    """Test POST /auth/logout endpoint."""

    def test_logout_success(self, client, access_token, mock_redis):
        """Test successful logout."""
        response = client.post(
            "/auth/logout",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Verify response structure
        assert "message" in data
        assert "logged_out_at" in data
        assert "logged out successfully" in data["message"]

        # Verify token is blacklisted
        assert mock_redis.exists(f"blacklist:{access_token}") > 0

    def test_logout_without_token(self, client):
        """Test logout without providing token."""
        response = client.post("/auth/logout")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_with_invalid_token(self, client, mock_redis):
        """Test logout with malformed token."""
        response = client.post(
            "/auth/logout",
            headers={"Authorization": "Bearer invalid.token"}
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_with_refresh_token_fails(
        self,
        client,
        refresh_token,
        mock_redis
    ):
        """Test logout fails when using refresh token."""
        response = client.post(
            "/auth/logout",
            headers={"Authorization": f"Bearer {refresh_token}"}
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_with_expired_token(self, client, expired_token):
        """Test logout with expired token."""
        response = client.post(
            "/auth/logout",
            headers={"Authorization": f"Bearer {expired_token}"}
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ==================== Test Profile Endpoint ====================

@pytest.mark.auth
@pytest.mark.unit
class TestProfile:
    """Test GET /auth/me endpoint."""

    def test_get_profile_success(
        self,
        client,
        auth_headers,
        test_user_data
    ):
        """Test get current user profile."""
        response = client.get("/auth/me", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Verify user data
        assert data["email"] == test_user_data["email"]
        assert data["full_name"] == test_user_data["full_name"]
        assert data["role"] == test_user_data["role"]
        assert data["is_active"] is True

        # Verify password not returned
        assert "password" not in data
        assert "hashed_password" not in data

    def test_get_profile_without_auth(self, client):
        """Test profile endpoint without authentication."""
        response = client.get("/auth/me")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_profile_with_invalid_token(self, client):
        """Test profile with invalid token."""
        response = client.get(
            "/auth/me",
            headers={"Authorization": "Bearer invalid.token"}
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_profile_with_expired_token(self, client, expired_token):
        """Test profile with expired token."""
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {expired_token}"}
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ==================== Test Register Endpoint ====================

@pytest.mark.auth
@pytest.mark.unit
class TestRegister:
    """Test POST /auth/register endpoint."""

    def test_register_placeholder(self, client):
        """Test register endpoint placeholder response."""
        response = client.post(
            "/auth/register",
            json={
                "email": "newuser@haas.com",
                "password": "newpass123",
                "full_name": "New User"
            }
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "Coming soon" in data["message"]

    # TODO: Implement real registration tests when feature is complete


# ==================== Integration Tests ====================

@pytest.mark.auth
@pytest.mark.integration
class TestAuthFlowIntegration:
    """Test complete authentication flows."""

    def test_complete_auth_flow(self, client, mock_redis):
        """Test login → use token → refresh → logout flow."""
        # Step 1: Login
        login_response = client.post(
            "/auth/login",
            data={
                "username": "distributor@haas.com",
                "password": "pass123"
            }
        )
        assert login_response.status_code == status.HTTP_200_OK
        tokens = login_response.json()

        # Step 2: Access protected resource
        profile_response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {tokens['access_token']}"}
        )
        assert profile_response.status_code == status.HTTP_200_OK

        # Step 3: Refresh token
        refresh_response = client.post(
            "/auth/refresh",
            json={"refresh_token": tokens["refresh_token"]}
        )
        assert refresh_response.status_code == status.HTTP_200_OK
        new_tokens = refresh_response.json()

        # Step 4: Use new access token
        profile_response2 = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {new_tokens['access_token']}"}
        )
        assert profile_response2.status_code == status.HTTP_200_OK

        # Step 5: Logout
        logout_response = client.post(
            "/auth/logout",
            headers={"Authorization": f"Bearer {new_tokens['access_token']}"}
        )
        assert logout_response.status_code == status.HTTP_200_OK

        # Step 6: Verify token is blacklisted
        profile_response3 = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {new_tokens['access_token']}"}
        )
        assert profile_response3.status_code == status.HTTP_401_UNAUTHORIZED

    def test_concurrent_refresh_attempts(self, client, mock_redis):
        """Test multiple refresh attempts with same token."""
        # Login to get refresh token
        login_response = client.post(
            "/auth/login",
            data={
                "username": "distributor@haas.com",
                "password": "pass123"
            }
        )
        refresh_token = login_response.json()["refresh_token"]

        # First refresh succeeds
        refresh1 = client.post(
            "/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        assert refresh1.status_code == status.HTTP_200_OK

        # Second refresh with same token fails (token blacklisted)
        refresh2 = client.post(
            "/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        assert refresh2.status_code == status.HTTP_401_UNAUTHORIZED
