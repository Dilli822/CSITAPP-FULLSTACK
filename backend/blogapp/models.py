# # blogapp/models.py
# from django.db import models
# from django.contrib.auth.models import User
# from django.utils.text import slugify

# class Blog(models.Model):
#     title = models.CharField(max_length=200)
#     content = models.TextField()
#     author = models.ForeignKey(User, on_delete=models.CASCADE)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     authorName = models.CharField(max_length=100)
#     image = models.ImageField(upload_to='blog_images', null=True, blank=True)
#     likes = models.IntegerField(default=0)
#     liked_by = models.ManyToManyField(User, related_name='liked_blogs', blank=True)
#     liked_state = models.BooleanField(default=False)
#     liked_by_current_user = models.ForeignKey(User, related_name='liked_by_current_user', on_delete=models.CASCADE, null=True, blank=True)
#     slug = models.SlugField(unique=True, null=True, blank=True)
#     url = models.URLField(unique=True, null=True, blank=True)

#     def __str__(self):
#         return str(self.title)

#     def save(self, *args, **kwargs):
#         if not self.slug:
#             self.slug = slugify(self.title)
#         if not self.url:
#             self.url = f'http://localhost:8000/api/blog/{self.slug}'
#         super().save(*args, **kwargs)
        


# # Comments section
# class Comment(models.Model):
#     blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='comments')
#     author = models.ForeignKey(User, on_delete=models.CASCADE)
#     comment_content = models.TextField()
#     comment_created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Comment by {self.author} on {self.blog}"
    

from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

class Blog(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    authorName = models.CharField(max_length=100)
    image = models.ImageField(upload_to='blog_images', null=True, blank=True)
    likes = models.IntegerField(default=0)
    liked_by = models.ManyToManyField(User, related_name='liked_blogs', blank=True)
    liked_state = models.BooleanField(default=False)
    liked_by_current_user = models.ForeignKey(User, related_name='liked_by_current_user', on_delete=models.CASCADE, null=True, blank=True)
    slug = models.SlugField(unique=True, null=True, blank=True)
    url = models.URLField(unique=True, null=True, blank=True)
    total_comments = models.IntegerField(default=0)
    video = models.FileField(upload_to='blog_videos', null=True, blank=True)

    def __str__(self):
        return str(self.title)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if not self.url:
            self.url = f'http://localhost:8000/api/blog/{self.slug}'
        super().save(*args, **kwargs)

    def update_total_comments(self):
        self.total_comments = self.comments.count()
        self.save()


class Comment(models.Model):
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    commenter = models.CharField(max_length=100, default='')
    comment_content = models.TextField()
    comment_created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author} on {self.blog}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.blog.update_total_comments()

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        self.blog.update_total_comments()


class MyModel(models.Model):
    # Fields and definitions of the model

    def some_method(self):
        MyModel.objects.using('second_db').filter(...)

# # for single upload 
# class PastQuestionDocument(models.Model):
#     title = models.CharField(max_length=200, blank=True, null=True)
#     year_inserted = models.IntegerField()
#     regular_field = models.CharField(max_length=100)
#     back_field = models.CharField(max_length=100)
#     document_file = models.FileField(upload_to='docfiles/', null=True, blank=True)
#     image_file = models.ImageField(upload_to='imgfile/', null=True, blank=True)
#     author_id = models.CharField(max_length=100, null=True, blank=True)

#     def __str__(self):
#         return self.title

#     def save(self, *args, **kwargs):
#         # If document_file is not received, set it to None (null)
#         if not self.document_file:
#             self.document_file = None

#         # If image_file is not received, set it to None (null)
#         if not self.image_file:
#             self.image_file = None

#         super().save(*args, **kwargs)

# Assuming you already have the User model provided by Django or a custom User model
#


# class Image(models.Model):
#     image_file = models.ImageField(upload_to='imgfile/')

# class Document(models.Model):
#     document_file = models.FileField(upload_to='docfiles/')


# class PastQuestionUpload(models.Model):
#     title = models.CharField(max_length=200, blank=True, null=True)
#     year_inserted = models.IntegerField()
#     regular_field = models.CharField(max_length=100)
#     back_field = models.CharField(max_length=100)
#     images = models.ManyToManyField(Image, blank=True)
#     documents = models.ManyToManyField(Document, blank=True)
#     author_id = models.CharField(max_length=100, null=True, blank=True)


# from django.db import models

# class PastQuestionDocument(models.Model):
#     title = models.CharField(max_length=200, blank=True, null=True)
#     year_inserted = models.IntegerField()
#     regular_field = models.CharField(max_length=100)
#     back_field = models.CharField(max_length=100)
#     author_id = models.CharField(max_length=100, null=True, blank=True)

# class DocumentFile(models.Model):
#     past_question = models.ForeignKey(PastQuestionDocument, related_name='documents', on_delete=models.CASCADE)
#     document_file = models.FileField(upload_to='docfiles/')

# class ImageFile(models.Model):
#     past_question = models.ForeignKey(PastQuestionDocument, related_name='images', on_delete=models.CASCADE)
#     image_file = models.ImageField(upload_to='imgfile/')


from django.db import models

class PastQuestionDocument(models.Model):
    title = models.CharField(max_length=200, blank=True, null=True)
    year_inserted = models.IntegerField()
    regular_field = models.CharField(max_length=100)
    back_field = models.CharField(max_length=100)
    author_id = models.CharField(max_length=100, null=True, blank=True)
    document_files = models.ManyToManyField('DocumentFile', blank=True)
    image_files = models.ManyToManyField('ImageFile', blank=True)

    def __str__(self):
        return self.title

class DocumentFile(models.Model):
    document_file = models.FileField(upload_to='docfiles/')

    def __str__(self):
        return f"{self.document_file}"

class ImageFile(models.Model):
    image_file = models.ImageField(upload_to='imgfile/')

    def __str__(self):
        return f"{self.image_file}"
