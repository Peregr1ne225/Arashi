import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User


class CommentConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time blog comments.
    
    Connects to a post-specific channel group to broadcast new comments.
    """
    
    async def connect(self):
        self.post_id = self.scope["url_route"]["kwargs"]["post_id"]
        self.room_group_name = f"blog_comments_{self.post_id}"
        
        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave the room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """
        Receive a new comment from WebSocket.
        Requires authentication via JWT token in the message.
        """
        data = json.loads(text_data)
        
        # Check if user is authenticated
        user = self.scope.get("user")
        if not user or not user.is_authenticated:
            await self.send(text_data=json.dumps({
                "error": "Authentication required"
            }))
            return
        
        content = data.get("content", "").strip()
        if not content:
            await self.send(text_data=json.dumps({
                "error": "Content is required"
            }))
            return
        
        # Create the comment in the database
        comment_data = await self.create_comment(user, content)
        
        if comment_data:
            # Broadcast the comment to the room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "comment_message",
                    "comment": comment_data
                }
            )
    
    async def comment_message(self, event):
        """Handle broadcast of new comment to all connected clients"""
        comment = event["comment"]
        await self.send(text_data=json.dumps({
            "type": "new_comment",
            "comment": comment
        }))
    
    @database_sync_to_async
    def create_comment(self, user, content):
        """Create a comment in the database"""
        from .models import Post, Comment
        
        try:
            post = Post.objects.get(id=self.post_id, is_published=True)
            comment = Comment.objects.create(
                post=post,
                author=user,
                content=content
            )
            return {
                "id": comment.id,
                "author_pseudonym": comment.author_pseudonym,
                "content": comment.content,
                "created_at": comment.created_at.isoformat(),
                "is_active": comment.is_active,
                "author_username": comment.author.username,
                "post_author_username": post.author.username
            }
        except Post.DoesNotExist:
            return None
