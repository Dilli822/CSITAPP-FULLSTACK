
from rest_framework import serializers, status
from django.contrib.auth.models import User
from .models import Blog
from rest_framework import serializers
from django.urls import reverse
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Check if username already exists
        if User.objects.filter(username=validated_data['username']).exists():
            raise serializers.ValidationError({"username": "Username already taken"})
        elif User.objects.filter(email=validated_data['email']).exists():
            raise serializers.ValidationError({"email": "Email is already registered!"})
        
        user = User(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined')

class BlogSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(max_length=None, use_url=True, allow_null=True, required=False)

    class Meta:
        model = Blog
        fields = ['id', 'author', 'author_id', 'title', 'content', 'author', 'authorName', 'created_at', 'updated_at', 'image', 'likes', 'liked_state', 'liked_by_current_user','liked_by','url', 'video']
        read_only_fields = ['id','author']
        extra_kwargs = {
            'author': {'required': False},
            'id': {'required': False},
            'image': {'required': False},
            'likes': {'required': False},
            'liked_by': {'required': False},
            'video': {'required': False},
            
        }
        
class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined')


class BlogLikesSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    author_id = serializers.ReadOnlyField(source='author.id')
    blog_name = serializers.ReadOnlyField(source='title')
    likes = serializers.IntegerField(required=False)
    liked_state = serializers.SerializerMethodField()
    liked_by_current_user = serializers.SerializerMethodField()

    class Meta:
        model = Blog
        fields = ('id','author_id', 'blog_name', 'likes', 'liked_state', 'liked_by_current_user', 'liked_by',  'updated_at', 'created_at', 'image', 'url', 'video')

    def get_liked_state(self, obj):
        user = self.context['request'].user
        return user in obj.liked_by.all()

    def get_liked_by_current_user(self, obj):
        user = self.context['request'].user
        return user.id in obj.liked_by.values_list('id', flat=True)


class BlogLinkSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Blog
        fields = ['id', 'title', 'author', 'created_at', 'updated_at',  'url']

    def get_url(self, obj):
        request = self.context.get('request')
        if request is not None:
            return reverse('blog-detail', kwargs={'pk': obj.pk})
        return None

class ShareUrlSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(read_only=True)

    class Meta:
        model = Blog
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'

from rest_framework import serializers
from .models import PastQuestionDocument, DocumentFile, ImageFile

class DocumentFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentFile
        fields = ['document_file']

class ImageFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageFile
        fields = ['image_file']

class PastQuestionDocumentSerializer(serializers.ModelSerializer):
    document_files = DocumentFileSerializer(many=True)
    image_files = ImageFileSerializer(many=True)

    class Meta:
        model = PastQuestionDocument
        fields = ['id', 'title', 'year_inserted', 'regular_field', 'back_field', 'document_files', 'image_files', 'author_id']

    def create(self, validated_data):
        document_files_data = validated_data.pop('document_files', [])
        image_files_data = validated_data.pop('image_files', [])
        past_question = PastQuestionDocument.objects.create(**validated_data)

        for doc_file_data in document_files_data:
            DocumentFile.objects.create(past_question=past_question, **doc_file_data)

        for img_file_data in image_files_data:
            ImageFile.objects.create(past_question=past_question, **img_file_data)

        return past_question

    def update(self, instance, validated_data):
        document_files_data = validated_data.pop('document_files', [])
        image_files_data = validated_data.pop('image_files', [])

        instance.title = validated_data.get('title', instance.title)
        instance.year_inserted = validated_data.get('year_inserted', instance.year_inserted)
        instance.regular_field = validated_data.get('regular_field', instance.regular_field)
        instance.back_field = validated_data.get('back_field', instance.back_field)
        instance.author_id = validated_data.get('author_id', instance.author_id)
        instance.save()

        # Update DocumentFiles
        document_files = instance.document_files.all()
        document_files_ids = [item.id for item in document_files]

        for doc_file_data in document_files_data:
            if 'id' in doc_file_data:
                doc_file_id = doc_file_data['id']
                doc_file = DocumentFile.objects.get(id=doc_file_id, past_question=instance)
                doc_file.document_file = doc_file_data.get('document_file', doc_file.document_file)
                doc_file.save()
            else:
                DocumentFile.objects.create(past_question=instance, **doc_file_data)

        for doc_file_id in document_files_ids:
            if doc_file_id not in [item.get('id') for item in document_files_data]:
                DocumentFile.objects.get(id=doc_file_id).delete()

        # Update ImageFiles
        image_files = instance.image_files.all()
        image_files_ids = [item.id for item in image_files]

        for img_file_data in image_files_data:
            if 'id' in img_file_data:
                img_file_id = img_file_data['id']
                img_file = ImageFile.objects.get(id=img_file_id, past_question=instance)
                img_file.image_file = img_file_data.get('image_file', img_file.image_file)
                img_file.save()
            else:
                ImageFile.objects.create(past_question=instance, **img_file_data)

        for img_file_id in image_files_ids:
            if img_file_id not in [item.get('id') for item in image_files_data]:
                ImageFile.objects.get(id=img_file_id).delete()

        return instance
