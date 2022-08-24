from rest_framework import serializers
from .models import StudioState


class StudioStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudioState
        fields = ('state', 'duration')
