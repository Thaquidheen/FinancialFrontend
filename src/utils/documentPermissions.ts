import { User, USER_ROLES } from '../types/auth';
import { Document, DocumentPermissions } from '../types/document';

/**
 * Check if user can view a specific document
 */
export const canUserViewDocument = (user: User, document: Document): boolean => {
  // Super admin can view all documents
  if (user.roles.includes(USER_ROLES.SUPER_ADMIN)) {
    return true;
  }

  // Account managers can view all documents
  if (user.roles.includes(USER_ROLES.ACCOUNT_MANAGER)) {
    return true;
  }

  // Project managers can view documents for their assigned projects
  if (user.roles.includes(USER_ROLES.PROJECT_MANAGER)) {
    // If document is associated with a project, check if user manages that project
    if (document.projectId) {
      // This would need to be checked against user's assigned projects
      // For now, we'll allow project managers to view all project documents
      return true;
    }
    // Project managers can also view documents they uploaded
    return document.uploadedBy.id === user.id;
  }

  // Users can view their own uploaded documents
  return document.uploadedBy.id === user.id;
};

/**
 * Check if user can download a specific document
 */
export const canUserDownloadDocument = (user: User, document: Document): boolean => {
  // Same permissions as viewing
  return canUserViewDocument(user, document);
};

/**
 * Check if user can delete a specific document
 */
export const canUserDeleteDocument = (user: User, document: Document): boolean => {
  // Super admin can delete all documents
  if (user.roles.includes(USER_ROLES.SUPER_ADMIN)) {
    return true;
  }

  // Account managers can delete all documents
  if (user.roles.includes(USER_ROLES.ACCOUNT_MANAGER)) {
    return true;
  }

  // Users can delete their own documents
  return document.uploadedBy.id === user.id;
};

/**
 * Check if user can edit a specific document's metadata
 */
export const canUserEditDocument = (user: User, document: Document): boolean => {
  // Super admin can edit all documents
  if (user.roles.includes(USER_ROLES.SUPER_ADMIN)) {
    return true;
  }

  // Account managers can edit all documents
  if (user.roles.includes(USER_ROLES.ACCOUNT_MANAGER)) {
    return true;
  }

  // Users can edit their own documents
  return document.uploadedBy.id === user.id;
};

/**
 * Check if user can upload documents to a specific project
 */
export const canUserUploadToProject = (user: User, projectId?: number): boolean => {
  // Super admin can upload to any project
  if (user.roles.includes(USER_ROLES.SUPER_ADMIN)) {
    return true;
  }

  // Account managers can upload to any project
  if (user.roles.includes(USER_ROLES.ACCOUNT_MANAGER)) {
    return true;
  }

  // Project managers can upload to projects they manage
  if (user.roles.includes(USER_ROLES.PROJECT_MANAGER)) {
    if (!projectId) return true; // Can upload without project association
    // This would need to be checked against user's assigned projects
    // For now, we'll allow project managers to upload to any project
    return true;
  }

  // Regular users can upload documents (they'll be associated with their own projects)
  return true;
};

/**
 * Check if user can access document management features
 */
export const canUserAccessDocuments = (user: User): boolean => {
  // All authenticated users can access documents
  return user.roles.length > 0;
};

/**
 * Check if user can manage document categories and tags
 */
export const canUserManageDocumentMetadata = (user: User): boolean => {
  // Only super admin and account managers can manage categories and tags
  return user.roles.includes(USER_ROLES.SUPER_ADMIN) || 
         user.roles.includes(USER_ROLES.ACCOUNT_MANAGER);
};

/**
 * Check if user can view document statistics
 */
export const canUserViewDocumentStats = (user: User): boolean => {
  // Super admin and account managers can view all stats
  if (user.roles.includes(USER_ROLES.SUPER_ADMIN) || 
      user.roles.includes(USER_ROLES.ACCOUNT_MANAGER)) {
    return true;
  }

  // Project managers can view stats for their projects
  if (user.roles.includes(USER_ROLES.PROJECT_MANAGER)) {
    return true;
  }

  // Regular users can view basic stats
  return true;
};

/**
 * Check if user can perform bulk operations on documents
 */
export const canUserPerformBulkOperations = (user: User): boolean => {
  // Only super admin and account managers can perform bulk operations
  return user.roles.includes(USER_ROLES.SUPER_ADMIN) || 
         user.roles.includes(USER_ROLES.ACCOUNT_MANAGER);
};

/**
 * Get comprehensive document permissions for a user and document
 */
export const getDocumentPermissions = (user: User, document: Document): DocumentPermissions => {
  return {
    canView: canUserViewDocument(user, document),
    canDownload: canUserDownloadDocument(user, document),
    canDelete: canUserDeleteDocument(user, document),
    canEdit: canUserEditDocument(user, document)
  };
};

/**
 * Filter documents based on user permissions
 */
export const filterDocumentsByPermissions = (documents: Document[], user: User): Document[] => {
  return documents.filter(doc => canUserViewDocument(user, doc));
};

/**
 * Check if user can access documents for a specific quotation
 */
export const canUserAccessQuotationDocuments = (user: User, quotationId: number): boolean => {
  // Super admin and account managers can access all quotation documents
  if (user.roles.includes(USER_ROLES.SUPER_ADMIN) || 
      user.roles.includes(USER_ROLES.ACCOUNT_MANAGER)) {
    return true;
  }

  // Project managers can access quotation documents
  if (user.roles.includes(USER_ROLES.PROJECT_MANAGER)) {
    return true;
  }

  // Regular users can access quotation documents they're involved with
  // This would need to be checked against quotation ownership/participation
  return true;
};

/**
 * Check if user can access documents for a specific project
 */
export const canUserAccessProjectDocuments = (user: User, projectId: number): boolean => {
  // Super admin and account managers can access all project documents
  if (user.roles.includes(USER_ROLES.SUPER_ADMIN) || 
      user.roles.includes(USER_ROLES.ACCOUNT_MANAGER)) {
    return true;
  }

  // Project managers can access project documents
  if (user.roles.includes(USER_ROLES.PROJECT_MANAGER)) {
    return true;
  }

  // Regular users can access project documents they're involved with
  // This would need to be checked against project participation
  return true;
};

/**
 * Get user's document access level
 */
export const getUserDocumentAccessLevel = (user: User): 'full' | 'project' | 'own' => {
  if (user.roles.includes(USER_ROLES.SUPER_ADMIN) || 
      user.roles.includes(USER_ROLES.ACCOUNT_MANAGER)) {
    return 'full';
  }

  if (user.roles.includes(USER_ROLES.PROJECT_MANAGER)) {
    return 'project';
  }

  return 'own';
};

/**
 * Check if user can see document upload statistics
 */
export const canUserSeeUploadStats = (user: User): boolean => {
  return user.roles.includes(USER_ROLES.SUPER_ADMIN) || 
         user.roles.includes(USER_ROLES.ACCOUNT_MANAGER) ||
         user.roles.includes(USER_ROLES.PROJECT_MANAGER);
};

/**
 * Check if user can export document data
 */
export const canUserExportDocuments = (user: User): boolean => {
  return user.roles.includes(USER_ROLES.SUPER_ADMIN) || 
         user.roles.includes(USER_ROLES.ACCOUNT_MANAGER);
};
