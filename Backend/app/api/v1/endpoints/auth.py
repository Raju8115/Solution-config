from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from typing import Dict
import logging
from authlib.integrations.base_client.errors import MismatchingStateError, OAuthError
from app.bluegroups_auth import is_user_in_group
from app.config import settings
from app.auth.dependencies import get_current_active_user, get_current_user
from app.auth.permissions import get_user_roles

router = APIRouter()
logger = logging.getLogger(__name__)


def clear_oauth_state(session) -> None:
    """Clear all OAuth-related state from session to prevent state mismatch"""
    keys_to_remove = []
    for key in list(session.keys()):
        # Authlib stores state with underscore prefix or containing 'state'
        if key.startswith('_') or 'state' in key.lower() or 'appid' in key.lower():
            keys_to_remove.append(key)
    
    for key in keys_to_remove:
        try:
            del session[key]
            logger.debug(f"Cleared session key: {key}")
        except KeyError:
            pass


@router.get("/login")
async def login(request: Request):
    '''Start the OAuth/OIDC authorization code flow'''
    try:
        # CRITICAL: Clear any existing OAuth state before new login
        clear_oauth_state(request.session)
        
        redirect_uri = str(request.url_for('auth_callback'))
        logger.info(f"Starting login flow with redirect_uri: {redirect_uri}")
        logger.debug(f"Session keys after clearing: {list(request.session.keys())}")

        from app.main import oauth
        return await oauth.appid.authorize_redirect(request, redirect_uri)
    except Exception as e:
        logger.error(f"Login error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@router.get("/callback")  # Changed from "/auth/callback" - the prefix is already "/auth"
async def auth_callback(request: Request):
    '''OAuth callback endpoint - Exchanges authorization code for tokens'''
    try:
        logger.info("Processing auth callback")
        logger.debug(f"Request URL: {request.url}")
        logger.debug(f"Session keys: {list(request.session.keys())}")
        
        from app.main import oauth
        
        # Try to exchange authorization code for tokens
        try:
            token = await oauth.appid.authorize_access_token(request)
        except MismatchingStateError as e:
            logger.warning(f"State mismatch detected: {e}")
            # Clear session and redirect to login for fresh start
            request.session.clear()
            return RedirectResponse(url="/auth/login", status_code=302)
        except OAuthError as e:
            logger.error(f"OAuth error during token exchange: {e}")
            request.session.clear()
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/login?error=oauth_error",
                status_code=302
            )
        except Exception as e:
            if "mismatching_state" in str(e).lower():
                logger.warning(f"State mismatch in exception: {e}")
                request.session.clear()
                return RedirectResponse(url="/auth/login", status_code=302)
            raise
        
        logger.info("Token exchange successful")
        
        # Get user info from ID token or userinfo endpoint
        user = None
        roles = []
        
        try:
            user = await oauth.appid.parse_id_token(request, token)
            logger.info("ID token parsed successfully")
        except Exception as e:
            logger.warning(f"Failed to parse ID token: {e}")
            try:
                user = await oauth.appid.userinfo(token=token)
            except Exception as ue:
                logger.error(f"Failed to get userinfo: {ue}")
                request.session.clear()
                return RedirectResponse(
                    url=f"{settings.FRONTEND_URL}/login?error=userinfo_failed",
                    status_code=302
                )
        
        if not user:
            logger.error("No user info retrieved")
            request.session.clear()
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/login?error=no_user",
                status_code=302
            )
        
        # Get user roles from BlueGroups
        email = user.get("email")
        if email:
            try:
                if is_user_in_group(email, "Solution_Architect"):
                    roles.append("Solution_Architect")
                if is_user_in_group(email, "Administration"):
                    roles.append("Administration")
            except Exception as e:
                logger.warning(f"Failed to check BlueGroups: {e}")
        
        # Clear OAuth state keys before storing user data
        clear_oauth_state(request.session)
        
        # Store user info in session
        request.session['user'] = {
            'sub': user.get('sub'),
            'name': user.get('name') or f"{user.get('given_name', '')} {user.get('family_name', '')}".strip(),
            'email': email,
            'given_name': user.get('given_name'),
            'family_name': user.get('family_name'),
            'identities': user.get('identities'),
            'roles': roles,
        }
        
        # Store token for API calls
        request.session['token'] = {
            'access_token': token.get('access_token'),
            'token_type': token.get('token_type'),
            'expires_at': token.get('expires_at'),
        }
        
        logger.info(f"✅ User logged in: {email}")
        logger.info(f"✅ Roles: {roles}")
        logger.debug(f"Session keys after login: {list(request.session.keys())}")
        
        # Redirect to catalog page
        redirect_url = f"{settings.FRONTEND_URL}/catalog"
        logger.info(f"Redirecting to: {redirect_url}")
        
        return RedirectResponse(url=redirect_url, status_code=302)
        
    except MismatchingStateError:
        logger.warning("State mismatch caught at outer level")
        request.session.clear()
        return RedirectResponse(url="/auth/login", status_code=302)
    except Exception as e:
        logger.error(f"Auth callback error: {e}", exc_info=True)
        request.session.clear()
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=auth_failed",
            status_code=302
        )


@router.get("/user")
async def get_user_profile(request: Request):
    """Get current logged-in user's profile"""
    user = request.session.get('user')
    if not user:
        return JSONResponse(
            status_code=401,
            content={'error': 'Not authenticated'}
        )
    
    # Get fresh roles if needed
    roles = user.get('roles', [])
    
    return {
        'user': {
            'sub': user.get('sub'),
            'name': user.get('name'),
            'email': user.get('email'),
            'given_name': user.get('given_name'),
            'family_name': user.get('family_name'),
            'roles': roles
        }
    }


@router.get("/me")
async def get_current_user_info(
    current_user: dict = Depends(get_current_active_user),
    roles: dict = Depends(get_user_roles)
):
    """Get current user information including BlueGroup-based roles"""
    return {
        "user": current_user,
        "roles": roles
    }


@router.post("/logout")
@router.get("/logout")  # Allow both GET and POST for flexibility
async def logout(request: Request):
    """Logout user by invalidating session and clearing cookies"""
    W3_SLO_URL = "https://preprod.login.w3.ibm.com/idaas/mtfim/sps/idaas/logout"
    
    try:
        # Clear the server-side session completely
        request.session.clear()
        
        response = JSONResponse(
            content={
                "message": "Logged out successfully",
                "logout_url": W3_SLO_URL,
            }
        )
        
        # Delete session cookie properly
        response.delete_cookie(
            key="session",
            path="/",
            domain=None,  # Let browser determine domain
        )
        
        logger.info("✅ User logged out, session cleared.")
        return response
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return JSONResponse(
            status_code=500,
            content={"message": f"Logout failed: {str(e)}"}
        )


@router.get("/validate")
async def validate_session(current_user: Dict = Depends(get_current_user)):
    """Validate if user session is active"""
    return {
        'valid': True,
        'user': {
            'email': current_user.get('email'),
            'name': current_user.get('name'),
            'roles': current_user.get('roles', [])
        }
    }


@router.get("/check")
async def check_auth(request: Request):
    """Check authentication status without requiring login"""
    user = request.session.get('user')
    
    logger.debug(f"Auth check - Session keys: {list(request.session.keys())}")
    logger.debug(f"Auth check - User present: {user is not None}")
    
    if user:
        return {
            'authenticated': True,
            'user': {
                'email': user.get('email'),
                'name': user.get('name'),
                'roles': user.get('roles', [])
            }
        }
    
    return {
        'authenticated': False,
        'user': None
    }


# Debug endpoint - REMOVE IN PRODUCTION
@router.get("/debug/session")
async def debug_session(request: Request):
    """Debug endpoint to check session state"""
    return {
        "session_keys": list(request.session.keys()),
        "has_user": "user" in request.session,
        "has_token": "token" in request.session,
        "cookie_present": "session" in request.cookies,
    }
