import apiClient from './api';
import { 
  Document, 
  DocumentUploadRequest, 
  DocumentSearchParams, 
  DocumentSearchResponse,
  DocumentStats,
  DocumentPreviewData
} from '../types/document';
import { ApiResponse } from '../types/api';

class DocumentService {
  private baseURL = '/documents';

  /**
   * Upload multiple documents
   */
  async uploadDocuments(
    request: DocumentUploadRequest,
    onProgress?: (progress: number) => void
  ): Promise<Document[]> {
    const formData = new FormData();
    
    // Add files
    request.files.forEach(file => {
      formData.append('files', file);
    });
    
    // Add metadata
    if (request.projectId) {
      formData.append('projectId', request.projectId.toString());
    }
    
    formData.append('category', request.category);
    
    if (request.tags?.length) {
      request.tags.forEach(tag => formData.append('tags', tag));
    }
    
    if (request.description) {
      formData.append('description', request.description);
    }

    const response = await apiClient.upload<Document[]>(`${this.baseURL}/upload`, formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    
    return response.data;
  }

  /**
   * Download a document
   */
  async downloadDocument(id: number, filename?: string): Promise<void> {
    await apiClient.download(`${this.baseURL}/${id}`, filename);
  }

  /**
   * Get document by ID
   */
  async getDocument(id: number): Promise<Document> {
    const response = await apiClient.get<Document>(`${this.baseURL}/${id}`);
    return response.data;
  }

  /**
   * Get documents for a specific quotation
   */
  async getQuotationDocuments(quotationId: number): Promise<Document[]> {
    const response = await apiClient.get<Document[]>(`${this.baseURL}/quotation/${quotationId}`);
    return response.data;
  }

  /**
   * Get documents for a specific project
   */
  async getProjectDocuments(projectId: number): Promise<Document[]> {
    const response = await apiClient.get<Document[]>(`${this.baseURL}/project/${projectId}`);
    return response.data;
  }

  /**
   * Search documents with filters and pagination
   */
  async searchDocuments(params: DocumentSearchParams): Promise<DocumentSearchResponse> {
    const response = await apiClient.get<DocumentSearchResponse>(`${this.baseURL}/search`, {
      params: {
        ...params,
        // Convert arrays to comma-separated strings for API
        tags: params.tags?.join(','),
      }
    });
    return response.data;
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: number): Promise<void> {
    await apiClient.delete(`${this.baseURL}/${id}`);
  }

  /**
   * Update document metadata
   */
  async updateDocumentMetadata(
    id: number, 
    updates: {
      category?: string;
      tags?: string[];
      description?: string;
    }
  ): Promise<Document> {
    const response = await apiClient.put<Document>(`${this.baseURL}/${id}/metadata`, updates);
    return response.data;
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(): Promise<DocumentStats> {
    const response = await apiClient.get<DocumentStats>(`${this.baseURL}/stats`);
    return response.data;
  }

  /**
   * Get document preview data
   */
  async getDocumentPreview(id: number): Promise<DocumentPreviewData> {
    const response = await apiClient.get<DocumentPreviewData>(`${this.baseURL}/${id}/preview`);
    return response.data;
  }

  /**
   * Get document thumbnail
   */
  async getDocumentThumbnail(id: number): Promise<string> {
    const response = await apiClient.get(`${this.baseURL}/${id}/thumbnail`, {
      responseType: 'blob'
    });
    return URL.createObjectURL(response.data);
  }

  /**
   * Bulk delete documents
   */
  async bulkDeleteDocuments(ids: number[]): Promise<void> {
    await apiClient.post(`${this.baseURL}/bulk-delete`, { ids });
  }

  /**
   * Bulk update document categories
   */
  async bulkUpdateCategories(
    ids: number[], 
    category: string
  ): Promise<void> {
    await apiClient.post(`${this.baseURL}/bulk-update-category`, { ids, category });
  }

  /**
   * Get all available document categories
   */
  async getDocumentCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.baseURL}/categories`);
    return response.data;
  }

  /**
   * Get all available document tags
   */
  async getDocumentTags(): Promise<Array<{ id: number; name: string; color?: string }>> {
    const response = await apiClient.get<Array<{ id: number; name: string; color?: string }>>(`${this.baseURL}/tags`);
    return response.data;
  }

  /**
   * Create a new document tag
   */
  async createDocumentTag(name: string, color?: string): Promise<{ id: number; name: string; color?: string }> {
    const response = await apiClient.post<{ id: number; name: string; color?: string }>(`${this.baseURL}/tags`, {
      name,
      color
    });
    return response.data;
  }

  /**
   * Get recent documents
   */
  async getRecentDocuments(limit: number = 10): Promise<Document[]> {
    const response = await apiClient.get<Document[]>(`${this.baseURL}/recent`, {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Get most accessed documents
   */
  async getMostAccessedDocuments(limit: number = 10): Promise<Document[]> {
    const response = await apiClient.get<Document[]>(`${this.baseURL}/most-accessed`, {
      params: { limit }
    });
    return response.data;
  }
}

// Create and export the singleton instance
export const documentService = new DocumentService();
export default documentService;
