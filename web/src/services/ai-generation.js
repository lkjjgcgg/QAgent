import api from './api';

// 获取AI生成仪表盘统计数据
export const getAIGenerationDashboardStats = async () => {
  try {
    const response = await api.get('/requirement-analysis/dashboard-stats/');
    return response;
  } catch (error) {
    console.error('Failed to get AI generation dashboard stats:', error);
    throw error;
  }
};

// 测试用例生成任务相关
export const getTestCaseGenerationTasks = async (params = {}) => {
  try {
    const response = await api.get('/requirement-analysis/testcase-generation/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get test case generation tasks:', error);
    throw error;
  }
};

export const deleteTestCaseGenerationTask = async (taskId) => {
  try {
    const response = await api.delete(`/requirement-analysis/testcase-generation/${taskId}/`);
    return response;
  } catch (error) {
    console.error('Failed to delete test case generation task:', error);
    throw error;
  }
};

export const batchAdoptTestCases = async (taskId) => {
  try {
    const response = await api.post(`/requirement-analysis/testcase-generation/${taskId}/batch_adopt/`);
    return response;
  } catch (error) {
    console.error('Failed to batch adopt test cases:', error);
    throw error;
  }
};

export const batchDiscardTestCases = async (taskId) => {
  try {
    const response = await api.post(`/requirement-analysis/testcase-generation/${taskId}/batch_discard/`);
    return response;
  } catch (error) {
    console.error('Failed to batch discard test cases:', error);
    throw error;
  }
};

export const getProjects = async (params = {}) => {
  try {
    const response = await api.get('/projects/list/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get projects:', error);
    throw error;
  }
};

export const getVersions = async (params = {}) => {
  try {
    const response = await api.get('/versions/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get versions:', error);
    throw error;
  }
};

export const getProjectVersions = async (projectId) => {
  try {
    const response = await api.get(`/versions/projects/${projectId}/versions/`);
    return response;
  } catch (error) {
    console.error('Failed to get project versions:', error);
    throw error;
  }
};

export const createTestCase = async (data) => {
  try {
    const response = await api.post('/testcases/', data);
    return response;
  } catch (error) {
    console.error('Failed to create test case:', error);
    throw error;
  }
};

// AI模型配置
export const getAIModelConfigs = async (params = {}) => {
  try {
    const response = await api.get('/requirement-analysis/ai-models/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get AI model configs:', error);
    throw error;
  }
};

export const createAIModelConfig = async (data) => {
  try {
    const response = await api.post('/requirement-analysis/ai-models/', data);
    return response;
  } catch (error) {
    console.error('Failed to create AI model config:', error);
    throw error;
  }
};

export const updateAIModelConfig = async (id, data) => {
  try {
    const response = await api.put(`/requirement-analysis/ai-models/${id}/`, data);
    return response;
  } catch (error) {
    console.error('Failed to update AI model config:', error);
    throw error;
  }
};

export const deleteAIModelConfig = async (id) => {
  try {
    const response = await api.delete(`/requirement-analysis/ai-models/${id}/`);
    return response;
  } catch (error) {
    console.error('Failed to delete AI model config:', error);
    throw error;
  }
};

export const testAIModelConnection = async (id) => {
  try {
    const response = await api.post(`/requirement-analysis/ai-models/${id}/test_connection/`);
    return response;
  } catch (error) {
    console.error('Failed to test AI model connection:', error);
    throw error;
  }
};

export const loadDefaultPrompts = async () => {
  try {
    const response = await api.get('/requirement-analysis/prompts/load_defaults/');
    return response;
  } catch (error) {
    console.error('Failed to load default prompts:', error);
    throw error;
  }
};

// AI用例编写配置
export const getWriterConfigs = async (params = {}) => {
  const response = await api.get('/requirement-analysis/writer-config/', { params });
  return response;
};

export const createWriterConfig = async (data) => {
  const response = await api.post('/requirement-analysis/writer-config/', data);
  return response;
};

export const updateWriterConfig = async (id, data) => {
  const response = await api.patch(`/requirement-analysis/writer-config/${id}/`, data);
  return response;
};

export const enableWriterConfig = async (id) => {
  const response = await api.post(`/requirement-analysis/writer-config/${id}/enable/`);
  return response;
};

// AI用例评审配置
export const getReviewerConfigs = async (params = {}) => {
  const response = await api.get('/requirement-analysis/reviewer-config/', { params });
  return response;
};

export const createReviewerConfig = async (data) => {
  const response = await api.post('/requirement-analysis/reviewer-config/', data);
  return response;
};

export const updateReviewerConfig = async (id, data) => {
  const response = await api.patch(`/requirement-analysis/reviewer-config/${id}/`, data);
  return response;
};

export const enableReviewerConfig = async (id) => {
  const response = await api.post(`/requirement-analysis/reviewer-config/${id}/enable/`);
  return response;
};

export const simulateReviewer = async (id, formData) => {
  const response = await api.post(
    `/requirement-analysis/reviewer-config/${id}/simulate_review/`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response;
};
