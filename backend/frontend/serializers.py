from rest_framework import serializers
from .models import Number, Setting

class NumberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Number
        fields = ['id', 'value', 'flag']

class SettingSerializer(serializers.ModelSerializer):
    numbers = NumberSerializer(many=True)

    class Meta:
        model = Setting
        fields = ['id', 'numbers']
