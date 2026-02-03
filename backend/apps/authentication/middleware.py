from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()


class JwtAuthMiddleware:
    """
    Custom middleware to authenticate WebSocket connections using JWT token
    passed in the query string.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Parse query string
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)

        # Get token from 'token' query parameter
        token_key = query_params.get("token", [None])[0]

        if token_key:
            try:
                # Validate the token
                access_token = AccessToken(token_key)
                user_id = access_token["user_id"]
                # Get the user
                scope["user"] = await get_user(user_id)
            except (InvalidToken, TokenError):
                # If token is invalid, set as AnonymousUser
                scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)
