import { Document, DocumentCategory, DocumentPermissions } from '../types/document';
import { User, USER_ROLES } from '../types/auth';

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Get file icon based on MIME type
 */
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType === 'application/pdf') return 'PictureAsPdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Description';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'TableChart';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'Slideshow';
  if (mimeType.includes('text/')) return 'TextSnippet';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'Archive';
  return 'InsertDriveFile';
};

/**
 * Get category color for UI display
 */
export const getCategoryColor = (category: DocumentCategory): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const colors = {
    [DocumentCategory.INVOICE]: 'error',
    [DocumentCategory.BILL]: 'error',
    [DocumentCategory.RECEIPT]: 'success',
    [DocumentCategory.CONTRACT]: 'warning',
    [DocumentCategory.PHOTO]: 'info',
    [DocumentCategory.DELIVERY_NOTE]: 'primary',
    [DocumentCategory.SPECIFICATION]: 'secondary',
    [DocumentCategory.OTHER]: 'default'
  } as const;
  
  return colors[category] || 'default';
};

/**
 * Get category display name
 */
export const getCategoryDisplayName = (category: DocumentCategory): string => {
  return category.replace(/_/g, ' ').toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Check if file type is supported for preview
 */
export const canPreviewFile = (mimeType: string): boolean => {
  const previewableTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/html',
    'text/css',
    'text/javascript',
    'application/json',
    'application/xml',
    'text/xml'
  ];
  
  return previewableTypes.includes(mimeType);
};

/**
 * Check if file type is an image
 */
export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

/**
 * Check if file type is a PDF
 */
export const isPdfFile = (mimeType: string): boolean => {
  return mimeType === 'application/pdf';
};

/**
 * Generate thumbnail URL for image files
 */
export const getThumbnailUrl = (document: Document): string | null => {
  if (isImageFile(document.mimeType)) {
    return `/api/documents/${document.id}/thumbnail`;
  }
  return null;
};

/**
 * Generate preview URL for documents
 */
export const getPreviewUrl = (document: Document): string | null => {
  if (canPreviewFile(document.mimeType)) {
    return `/api/documents/${document.id}/preview`;
  }
  return null;
};

/**
 * Validate file before upload
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/json',
    'application/xml',
    'text/xml'
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported' };
  }

  return { valid: true };
};

/**
 * Validate multiple files before upload
 */
export const validateFiles = (files: File[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const maxFiles = 10;

  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
  }

  files.forEach((file, index) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      errors.push(`File ${index + 1} (${file.name}): ${validation.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Generate unique file ID for tracking uploads
 */
export const generateFileId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check document permissions based on user role and document ownership
 */
export const getDocumentPermissions = (user: User, document: Document): DocumentPermissions => {
  const isSuperAdmin = user.roles.includes(USER_ROLES.SUPER_ADMIN);
  const isAccountManager = user.roles.includes(USER_ROLES.ACCOUNT_MANAGER);
  const isProjectManager = user.roles.includes(USER_ROLES.PROJECT_MANAGER);
  const isOwner = document.uploadedBy.id === user.id;

  return {
    canView: isSuperAdmin || isAccountManager || isProjectManager || isOwner,
    canDownload: isSuperAdmin || isAccountManager || isProjectManager || isOwner,
    canDelete: isSuperAdmin || isOwner,
    canEdit: isSuperAdmin || isOwner
  };
};

/**
 * Filter documents based on user permissions
 */
export const filterDocumentsByPermissions = (documents: Document[], user: User): Document[] => {
  return documents.filter(doc => {
    const permissions = getDocumentPermissions(user, doc);
    return permissions.canView;
  });
};

/**
 * Sort documents by various criteria
 */
export const sortDocuments = (
  documents: Document[], 
  sortBy: 'name' | 'size' | 'date' | 'category' | 'accessCount',
  sortDir: 'asc' | 'desc' = 'asc'
): Document[] => {
  return [...documents].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.fileName.localeCompare(b.fileName);
        break;
      case 'size':
        comparison = a.fileSize - b.fileSize;
        break;
      case 'date':
        comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'accessCount':
        comparison = a.accessCount - b.accessCount;
        break;
      default:
        return 0;
    }

    return sortDir === 'asc' ? comparison : -comparison;
  });
};

/**
 * Search documents by text content
 */
export const searchDocuments = (documents: Document[], searchTerm: string): Document[] => {
  if (!searchTerm.trim()) return documents;

  const term = searchTerm.toLowerCase();
  
  return documents.filter(doc => 
    doc.fileName.toLowerCase().includes(term) ||
    doc.description?.toLowerCase().includes(term) ||
    doc.category.toLowerCase().includes(term) ||
    doc.tags.some(tag => tag.name.toLowerCase().includes(term)) ||
    doc.uploadedBy.username.toLowerCase().includes(term)
  );
};

/**
 * Group documents by category
 */
export const groupDocumentsByCategory = (documents: Document[]): Record<DocumentCategory, Document[]> => {
  const grouped = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<DocumentCategory, Document[]>);

  // Ensure all categories are present
  Object.values(DocumentCategory).forEach(category => {
    if (!grouped[category]) {
      grouped[category] = [];
    }
  });

  return grouped;
};

/**
 * Calculate total size of documents
 */
export const calculateTotalSize = (documents: Document[]): number => {
  return documents.reduce((total, doc) => total + doc.fileSize, 0);
};

/**
 * Get document statistics
 */
export const getDocumentStats = (documents: Document[]) => {
  const totalSize = calculateTotalSize(documents);
  const categoryCounts = groupDocumentsByCategory(documents);
  
  return {
    totalDocuments: documents.length,
    totalSize,
    totalSizeFormatted: formatFileSize(totalSize),
    categoryCounts: Object.entries(categoryCounts).reduce((acc, [category, docs]) => {
      acc[category] = docs.length;
      return acc;
    }, {} as Record<string, number>)
  };
};

/**
 * Generate download filename with timestamp
 */
export const generateDownloadFilename = (originalName: string, addTimestamp: boolean = false): string => {
  if (!addTimestamp) return originalName;
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const extension = getFileExtension(originalName);
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  
  return `${nameWithoutExt}_${timestamp}.${extension}`;
};

/**
 * Check if document is recently uploaded (within last 7 days)
 */
export const isRecentlyUploaded = (document: Document): boolean => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return new Date(document.uploadDate) > sevenDaysAgo;
};

/**
 * Get relative time string for document upload date
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};
