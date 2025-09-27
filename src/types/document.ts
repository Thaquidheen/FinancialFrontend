import { User } from './auth';

export interface Document {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  projectId?: number;
  uploadedBy: User;
  category: DocumentCategory;
  tags: DocumentTag[];
  uploadDate: string;
  lastAccessedDate?: string;
  accessCount: number;
  description?: string;
  version: number;
  filePath?: string;
  checksum?: string;
  extractedText?: string;
}

export enum DocumentCategory {
  INVOICE = 'INVOICE',
  BILL = 'BILL',
  RECEIPT = 'RECEIPT',
  CONTRACT = 'CONTRACT',
  PHOTO = 'PHOTO',
  DELIVERY_NOTE = 'DELIVERY_NOTE',
  SPECIFICATION = 'SPECIFICATION',
  OTHER = 'OTHER'
}

export interface DocumentTag {
  id: number;
  name: string;
  color?: string;
}

export interface DocumentUploadRequest {
  files: File[];
  projectId?: number;
  category: DocumentCategory;
  tags?: string[];
  description?: string;
}

export interface DocumentSearchParams {
  searchTerm?: string;
  projectId?: number;
  category?: DocumentCategory;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface DocumentSearchResponse {
  content: Document[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface DocumentUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface DocumentMetadata {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  category: DocumentCategory;
  tags: DocumentTag[];
  description?: string;
  version: number;
}

// Document permissions
export interface DocumentPermissions {
  canView: boolean;
  canDownload: boolean;
  canDelete: boolean;
  canEdit: boolean;
}

// Document preview types
export interface DocumentPreviewData {
  id: number;
  fileName: string;
  mimeType: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  canPreview: boolean;
}

// Document statistics
export interface DocumentStats {
  totalDocuments: number;
  totalSize: number;
  documentsByCategory: Record<DocumentCategory, number>;
  recentUploads: Document[];
  mostAccessed: Document[];
}
