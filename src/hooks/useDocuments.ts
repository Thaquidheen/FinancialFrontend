import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/documentService';
import { 
  DocumentSearchParams, 
  DocumentUploadRequest, 
  DocumentStats,
  DocumentPreviewData 
} from '../types/document';

// Query keys
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (params: DocumentSearchParams) => [...documentKeys.lists(), params] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: number) => [...documentKeys.details(), id] as const,
  quotation: (quotationId: number) => [...documentKeys.all, 'quotation', quotationId] as const,
  project: (projectId: number) => [...documentKeys.all, 'project', projectId] as const,
  stats: () => [...documentKeys.all, 'stats'] as const,
  recent: (limit: number) => [...documentKeys.all, 'recent', limit] as const,
  mostAccessed: (limit: number) => [...documentKeys.all, 'mostAccessed', limit] as const,
  categories: () => [...documentKeys.all, 'categories'] as const,
  tags: () => [...documentKeys.all, 'tags'] as const,
};

/**
 * Hook to search documents with filters and pagination
 */
export const useDocuments = (searchParams: DocumentSearchParams) => {
  return useQuery({
    queryKey: documentKeys.list(searchParams),
    queryFn: () => documentService.searchDocuments(searchParams),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get a single document by ID
 */
export const useDocument = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentService.getDocument(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to get documents for a specific quotation
 */
export const useQuotationDocuments = (quotationId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: documentKeys.quotation(quotationId),
    queryFn: () => documentService.getQuotationDocuments(quotationId),
    enabled: enabled && !!quotationId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to get documents for a specific project
 */
export const useProjectDocuments = (projectId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: documentKeys.project(projectId),
    queryFn: () => documentService.getProjectDocuments(projectId),
    enabled: enabled && !!projectId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to get document statistics
 */
export const useDocumentStats = () => {
  return useQuery({
    queryKey: documentKeys.stats(),
    queryFn: () => documentService.getDocumentStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to get recent documents
 */
export const useRecentDocuments = (limit: number = 10) => {
  return useQuery({
    queryKey: documentKeys.recent(limit),
    queryFn: () => documentService.getRecentDocuments(limit),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to get most accessed documents
 */
export const useMostAccessedDocuments = (limit: number = 10) => {
  return useQuery({
    queryKey: documentKeys.mostAccessed(limit),
    queryFn: () => documentService.getMostAccessedDocuments(limit),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to get document categories
 */
export const useDocumentCategories = () => {
  return useQuery({
    queryKey: documentKeys.categories(),
    queryFn: () => documentService.getDocumentCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook to get document tags
 */
export const useDocumentTags = () => {
  return useQuery({
    queryKey: documentKeys.tags(),
    queryFn: () => documentService.getDocumentTags(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook to upload documents
 */
export const useDocumentUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DocumentUploadRequest) => 
      documentService.uploadDocuments(request),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      
      // If uploaded to a project, invalidate project documents
      if (variables.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: documentKeys.project(variables.projectId) 
        });
      }
      
      // Invalidate stats and recent documents
      queryClient.invalidateQueries({ queryKey: documentKeys.stats() });
      queryClient.invalidateQueries({ queryKey: documentKeys.recent() });
    },
  });
};

/**
 * Hook to delete a document
 */
export const useDocumentDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => documentService.deleteDocument(id),
    onSuccess: (_, id) => {
      // Invalidate all document queries
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      
      // Remove the specific document from cache
      queryClient.removeQueries({ queryKey: documentKeys.detail(id) });
    },
  });
};

/**
 * Hook to update document metadata
 */
export const useDocumentUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      updates 
    }: { 
      id: number; 
      updates: { category?: string; tags?: string[]; description?: string } 
    }) => documentService.updateDocumentMetadata(id, updates),
    onSuccess: (data, variables) => {
      // Update the document in cache
      queryClient.setQueryData(documentKeys.detail(variables.id), data);
      
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
};

/**
 * Hook to bulk delete documents
 */
export const useBulkDocumentDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => documentService.bulkDeleteDocuments(ids),
    onSuccess: (_, ids) => {
      // Invalidate all document queries
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      
      // Remove specific documents from cache
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: documentKeys.detail(id) });
      });
    },
  });
};

/**
 * Hook to bulk update document categories
 */
export const useBulkDocumentCategoryUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      ids, 
      category 
    }: { 
      ids: number[]; 
      category: string 
    }) => documentService.bulkUpdateCategories(ids, category),
    onSuccess: () => {
      // Invalidate all document queries
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
};

/**
 * Hook to create a new document tag
 */
export const useDocumentTagCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, color }: { name: string; color?: string }) => 
      documentService.createDocumentTag(name, color),
    onSuccess: () => {
      // Invalidate tags query
      queryClient.invalidateQueries({ queryKey: documentKeys.tags() });
    },
  });
};

/**
 * Hook to download a document
 */
export const useDocumentDownload = () => {
  return useMutation({
    mutationFn: ({ id, filename }: { id: number; filename?: string }) => 
      documentService.downloadDocument(id, filename),
  });
};

/**
 * Hook to get document preview
 */
export const useDocumentPreview = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...documentKeys.detail(id), 'preview'],
    queryFn: () => documentService.getDocumentPreview(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};
