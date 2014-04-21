from django.db import models


class Todo(models.Model):
    name = models.CharField(max_length=200)
