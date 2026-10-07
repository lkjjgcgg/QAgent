from rest_framework import serializers
from .models import TestPlan, TestRun, TestRunCase, TestRunCaseHistory
from apps.users.serializers import UserSerializer
from apps.projects.serializers import ProjectSimpleSerializer
from apps.versions.serializers import VersionSimpleSerializer


class TestPlanSimpleSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class TestRunSimpleSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class TestPlanSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    assignees = UserSerializer(many=True, read_only=True)
    projects = ProjectSimpleSerializer(many=True, read_only=True)
    version = VersionSimpleSerializer(read_only=True)
    
    class Meta:
        model = TestPlan
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'creator']


class TestPlanDetailSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    assignees = UserSerializer(many=True, read_only=True)
    projects = ProjectSimpleSerializer(many=True, read_only=True)
    version = VersionSimpleSerializer(read_only=True)
    test_runs = serializers.SerializerMethodField()
    
    class Meta:
        model = TestPlan
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'creator']
    
    def get_test_runs(self, obj):
        from .serializers import TestRunSimpleSerializer
        return TestRunSimpleSerializer(obj.test_runs.all(), many=True).data


class TestRunSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    assignee = UserSerializer(read_only=True)
    project = ProjectSimpleSerializer(read_only=True)
    version = VersionSimpleSerializer(read_only=True)
    test_plan = TestPlanSimpleSerializer(read_only=True)
    progress_stats = serializers.SerializerMethodField()
    
    class Meta:
        model = TestRun
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'creator']
    
    def get_progress_stats(self, obj):
        return obj.progress_stats


class TestRunCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestRunCase
        fields = '__all__'


class TestRunCaseDetailSerializer(serializers.ModelSerializer):
    testcase = serializers.SerializerMethodField()
    executed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = TestRunCase
        fields = '__all__'
    
    def get_testcase(self, obj):
        return {
            'id': obj.testcase.id,
            'title': obj.testcase.title
        }


class TestRunCaseHistorySerializer(serializers.ModelSerializer):
    executed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = TestRunCaseHistory
        fields = '__all__'
