import api from './http';
import { unwrapApiData } from './helpers';
import { Category, ResearchPaper, WorkflowEntry } from '../types/domain';

interface ResearchDetailPayload {
  paper: ResearchPaper;
  workflowHistory: WorkflowEntry[];
}

interface ResearchFilePayload {
  fileUrl: string;
  isSigned?: boolean;
  source?: string;
  storagePath?: string;
}

export const researchApi = {
  getMyPapers: async () => {
    const response = await api.get('/research/my/papers');
    const payload = unwrapApiData<{ papers: ResearchPaper[] }>(response);
    return payload.papers || [];
  },

  getPublishedPapers: async (params?: {
    category?: string;
    search?: string;
    year?: string;
    author?: string;
  }) => {
    const response = await api.get('/research/published', { params });
    const payload = unwrapApiData<{ papers: ResearchPaper[] }>(response);
    return payload.papers || [];
  },

  getCategories: async () => {
    const response = await api.get('/research/categories');
    const payload = unwrapApiData<{ categories: Category[] }>(response);
    return payload.categories || [];
  },

  getResearchById: async (paperId: string) => {
    const response = await api.get(`/research/${paperId}`);
    return unwrapApiData<ResearchDetailPayload>(response);
  },

  getResearchFile: async (paperId: string) => {
    const response = await api.get(`/research/${paperId}/file`);
    return unwrapApiData<ResearchFilePayload>(response);
  },

  trackView: async (paperId: string) => {
    await api.post(`/research/${paperId}/view`);
  },

  trackDownload: async (paperId: string) => {
    await api.post(`/research/${paperId}/download`);
  },

  getProfileData: async (params?: {
    title?: string;
    details?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => {
    const response = await api.get('/research/profile/data', { params });
    return unwrapApiData<{
      profile: { userId: string; role: string };
      stats: {
        totalRecords: number;
        uploadedCount: number;
        publishedCount: number;
      };
      records: any[];
    }>(response);
  },
};
