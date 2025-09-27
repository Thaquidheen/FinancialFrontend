# Document Management Module - Frontend Implementation

## Overview

This document outlines the complete implementation of the Document Management module in the Financial Management System frontend. The module provides secure document upload, organization, and retrieval capabilities integrated with project management and quotation workflows.

## 🚀 Features Implemented

### Core Features
- ✅ **Multi-file Upload** - Support for multiple document types (PDF, images, Excel, Word)
- ✅ **File Validation** - MIME type validation and 10MB size limit
- ✅ **Role-based Access Control** - Three user roles with appropriate permissions
- ✅ **Document Search & Filtering** - Advanced search with category, date, and tag filters
- ✅ **Document Preview** - In-browser preview for images and PDFs
- ✅ **Bulk Operations** - Bulk delete and category update
- ✅ **Document Statistics** - Upload stats and access tracking
- ✅ **Integration Components** - Ready-to-use components for quotations and projects

### Security Features
- ✅ **Permission-based Access** - Users can only access documents they're authorized to view
- ✅ **File Type Validation** - Only allowed file types can be uploaded
- ✅ **Size Limits** - 10MB maximum file size per document
- ✅ **Audit Trail** - Complete logging of document operations

## 📁 File Structure

```
src/
├── components/
│   └── documents/
│       ├── DocumentUpload.tsx          # File upload component
│       ├── DocumentList.tsx            # Document grid/list display
│       ├── DocumentSearch.tsx          # Search and filter interface
│       ├── DocumentPreview.tsx         # Document preview modal
│       ├── QuotationDocuments.tsx      # Integration for quotations
│       ├── ProjectDocuments.tsx        # Integration for projects
│       └── index.ts                    # Component exports
├── pages/
│   └── documents/
│       ├── DocumentsPage.tsx           # Main documents management page
│       └── index.ts                    # Page exports
├── hooks/
│   └── useDocuments.ts                 # React Query hooks for document operations
├── services/
│   └── documentService.ts              # API service layer
├── types/
│   └── document.ts                     # TypeScript type definitions
└── utils/
    ├── documentUtils.ts                # Utility functions
    └── documentPermissions.ts          # Permission checking utilities
```

## 🔧 Components

### DocumentUpload
A comprehensive file upload component with:
- Drag & drop support
- Multiple file selection
- Progress tracking
- Category and tag assignment
- File validation

```tsx
<DocumentUpload
  projectId={123}
  onUploadComplete={(documents) => console.log('Uploaded:', documents)}
  maxFiles={10}
  allowedTypes={['.pdf', '.doc', '.docx', '.jpg', '.png']}
/>
```

### DocumentList
A flexible document display component with:
- Grid and list view modes
- Document selection for bulk operations
- Context menu for actions
- Pagination support
- Permission-based action visibility

```tsx
<DocumentList
  documents={documents}
  loading={isLoading}
  onDocumentClick={(doc) => setPreviewDoc(doc)}
  onDownload={(doc) => handleDownload(doc)}
  showSelection={canPerformBulkOps}
  selectedDocuments={selectedIds}
  onSelectionChange={setSelectedIds}
/>
```

### DocumentSearch
Advanced search and filtering interface:
- Text search across file names and content
- Category filtering
- Date range filtering
- Tag-based filtering
- Project filtering

```tsx
<DocumentSearch
  searchParams={searchParams}
  onSearchChange={handleSearchChange}
  onReset={handleReset}
  showAdvancedFilters={true}
/>
```

### DocumentPreview
In-browser document preview with:
- Image and PDF preview support
- Zoom controls
- Rotation controls
- Download functionality
- Fullscreen mode

```tsx
<DocumentPreview
  document={selectedDocument}
  open={!!selectedDocument}
  onClose={() => setSelectedDocument(null)}
  onDownload={handleDownload}
/>
```

## 🔌 Integration Components

### QuotationDocuments
Ready-to-use component for quotation document management:

```tsx
<QuotationDocuments
  quotationId={quotationId}
  onDocumentUpload={() => refetchQuotation()}
  showUpload={true}
/>
```

### ProjectDocuments
Ready-to-use component for project document management:

```tsx
<ProjectDocuments
  projectId={projectId}
  onDocumentUpload={() => refetchProject()}
  showUpload={true}
  showTabs={true}
/>
```

## 🎣 React Hooks

### useDocuments
Main hook for document operations:

```tsx
const { data, isLoading, error } = useDocuments({
  searchTerm: 'invoice',
  category: DocumentCategory.INVOICE,
  page: 0,
  size: 10
});
```

### useDocumentUpload
Hook for uploading documents:

```tsx
const uploadMutation = useDocumentUpload();

const handleUpload = async (files: File[]) => {
  await uploadMutation.mutateAsync({
    files,
    projectId: 123,
    category: DocumentCategory.INVOICE,
    tags: ['urgent', 'payment']
  });
};
```

### useDocumentDelete
Hook for deleting documents:

```tsx
const deleteMutation = useDocumentDelete();

const handleDelete = async (documentId: number) => {
  await deleteMutation.mutateAsync(documentId);
};
```

## 🔐 Permission System

### Role-based Access Control

The module implements comprehensive permission checking:

```tsx
// Check if user can view a document
const canView = canUserViewDocument(user, document);

// Check if user can delete a document
const canDelete = canUserDeleteDocument(user, document);

// Get comprehensive permissions
const permissions = getDocumentPermissions(user, document);
```

### User Roles

- **SUPER_ADMIN**: Full access to all documents
- **ACCOUNT_MANAGER**: Access to all documents, can perform bulk operations
- **PROJECT_MANAGER**: Access to project documents and own documents
- **EMPLOYEE**: Access to own documents only

## 🛠️ API Integration

### Document Service

The `documentService` provides a complete API interface:

```tsx
// Upload documents
const documents = await documentService.uploadDocuments(request);

// Search documents
const results = await documentService.searchDocuments(params);

// Download document
await documentService.downloadDocument(id, filename);

// Get document statistics
const stats = await documentService.getDocumentStats();
```

### Supported Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload documents |
| GET | `/api/documents/{id}` | Download document |
| GET | `/api/documents/search` | Search documents |
| GET | `/api/documents/quotation/{id}` | Get quotation documents |
| GET | `/api/documents/project/{id}` | Get project documents |
| DELETE | `/api/documents/{id}` | Delete document |
| GET | `/api/documents/stats` | Get document statistics |

## 📊 Document Categories

The system supports the following document categories:

- **INVOICE** - Invoices and billing documents
- **BILL** - Bills and payment requests
- **RECEIPT** - Payment receipts and confirmations
- **CONTRACT** - Contracts and agreements
- **PHOTO** - Project photos and images
- **DELIVERY_NOTE** - Delivery notes and shipping documents
- **SPECIFICATION** - Technical specifications
- **OTHER** - Miscellaneous documents

## 🏷️ Tagging System

Documents can be tagged for better organization:

```tsx
// Add tags during upload
const request = {
  files: [file1, file2],
  tags: ['urgent', 'payment', 'contract']
};

// Search by tags
const results = await documentService.searchDocuments({
  tags: ['urgent', 'payment']
});
```

## 📱 Responsive Design

All components are fully responsive and work on:
- Desktop computers
- Tablets
- Mobile phones

The interface adapts to different screen sizes with:
- Responsive grid layouts
- Collapsible search filters
- Mobile-friendly touch interactions
- Optimized file upload experience

## 🚀 Getting Started

### 1. Import Components

```tsx
import { 
  DocumentUpload, 
  DocumentList, 
  DocumentSearch, 
  DocumentPreview,
  QuotationDocuments,
  ProjectDocuments 
} from '@/components/documents';
```

### 2. Use in Your Pages

```tsx
function MyPage() {
  const [documents, setDocuments] = useState([]);
  const [searchParams, setSearchParams] = useState({});

  return (
    <div>
      <DocumentSearch 
        searchParams={searchParams}
        onSearchChange={setSearchParams}
      />
      <DocumentList 
        documents={documents}
        onDocumentClick={handleDocumentClick}
      />
    </div>
  );
}
```

### 3. Add to Navigation

The documents page is already integrated into the main navigation and accessible to all user roles.

## 🔧 Configuration

### File Upload Limits

```tsx
// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
```

### Pagination Settings

```tsx
const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [6, 12, 24, 48],
  MAX_PAGE_SIZE: 100
};
```

## 🧪 Testing

The module includes comprehensive error handling and validation:

- File type validation
- File size validation
- Permission checking
- Network error handling
- User feedback for all operations

## 🔄 State Management

The module uses React Query for efficient state management:

- Automatic caching
- Background refetching
- Optimistic updates
- Error handling
- Loading states

## 📈 Performance Optimizations

- Lazy loading of document previews
- Image thumbnails for faster loading
- Pagination to limit data transfer
- Efficient search with debouncing
- Memoized components to prevent unnecessary re-renders

## 🎨 UI/UX Features

- Modern Material-UI design
- Intuitive drag-and-drop upload
- Visual file type indicators
- Progress indicators for uploads
- Context menus for quick actions
- Keyboard shortcuts support
- Accessibility compliance

## 🔮 Future Enhancements

Potential future improvements:

- Document versioning
- Collaborative editing
- Advanced search with full-text indexing
- Document templates
- Automated categorization with AI
- Integration with cloud storage providers
- Document workflow automation

## 📝 Usage Examples

### Basic Document Upload

```tsx
function DocumentUploadExample() {
  const handleUpload = (documents) => {
    console.log('Uploaded documents:', documents);
  };

  return (
    <DocumentUpload
      onUploadComplete={handleUpload}
      maxFiles={5}
      defaultCategory={DocumentCategory.INVOICE}
    />
  );
}
```

### Document Search and Display

```tsx
function DocumentSearchExample() {
  const [searchParams, setSearchParams] = useState({});
  const { data, isLoading } = useDocuments(searchParams);

  return (
    <div>
      <DocumentSearch
        searchParams={searchParams}
        onSearchChange={setSearchParams}
      />
      <DocumentList
        documents={data?.content || []}
        loading={isLoading}
      />
    </div>
  );
}
```

### Integration with Quotations

```tsx
function QuotationPage({ quotationId }) {
  return (
    <div>
      {/* Other quotation content */}
      <QuotationDocuments 
        quotationId={quotationId}
        showUpload={true}
      />
    </div>
  );
}
```

This implementation provides a complete, production-ready document management system that integrates seamlessly with your existing Financial Management System.
