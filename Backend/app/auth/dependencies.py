from fastapi import Request, HTTPException, status
from typing import Dict, Optional


def get_current_user(request: Request) -> Dict:
    """
    Dependency to get current authenticated user from session
    """
    user = request.session.get('user')
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    return user

from fastapi import Request, HTTPException, Depends

def get_current_active_user(request: Request):
    """
    Extracts the currently active user from session.
    This replaces old JWT token-based `get_current_active_user`.
    """
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user



def get_current_user_optional(request: Request) -> Optional[Dict]:
    """
    Dependency to get current user if authenticated, None otherwise
    """
    return request.session.get('user')