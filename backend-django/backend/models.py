from django.db import models

class User(models.Model):
    user_id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True, null=False)
    image_url = models.CharField(max_length=200, unique=True, null=False)
    profile_description = models.CharField(max_length=500, unique=True, null=False)

    class Meta:
        db_table = 'users'
