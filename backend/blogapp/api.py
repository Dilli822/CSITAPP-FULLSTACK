from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User  # Import the User model
from .models import Blog, Comment
from .serializers import BlogSerializer, CommentSerializer

class BlogCommentAPIView(APIView):
    def get(self, request):
        blogs = Blog.objects.all()
        blog_serializer = BlogSerializer(blogs, many=True)

        comments = Comment.objects.all()
        comment_serializer = CommentSerializer(comments, many=True)

        blog_data = blog_serializer.data
        for blog in blog_data:
            blog_id = blog['id']
            blog['total_comments'] = Comment.objects.filter(blog_id=blog_id).count()
            author_id = blog['author']
            author = User.objects.get(pk=author_id)  # Fetch the user object
            blog['author_details'] = {
                'first_name': author.first_name,
                'last_name': author.last_name
            }

        data = {
            'blogs': blog_data,
            'comments': comment_serializer.data
        }

        return Response(data)
