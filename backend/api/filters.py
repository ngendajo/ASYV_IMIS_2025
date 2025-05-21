from django_filters import rest_framework as filters
from .models import *

class KidFilter(filters.FilterSet):
    min_points = filters.NumberFilter(field_name="points_in_national_exam", lookup_expr='gte')
    max_points = filters.NumberFilter(field_name="points_in_national_exam", lookup_expr='lte')
    created_after = filters.DateTimeFilter(field_name="created_at", lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name="created_at", lookup_expr='lte')
    leap = filters.ModelMultipleChoiceFilter(
        field_name='leaps',
        queryset=Leap.objects.all(),
        to_field_name='id'
    )
    
    class Meta:
        model = Kid
        fields = {
            'graduation_status': ['exact'],
            'family': ['exact'],
            'has_children': ['exact'],
            'marital_status': ['exact', 'icontains'],
            'life_status': ['exact'],
            'origin_district': ['exact', 'icontains'],
            'current_district_or_city': ['exact', 'icontains'],
        }