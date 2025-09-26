import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import AppLayout from '@components/layout/AppLayout';
import LoginPage from '@pages/auth/LoginPage';
import DashboardPage from '@pages/dashboard/DashboardPage';
import UserListPage from '@pages/users/UserListPage';
import CreateUserPage from '@pages/users/CreateUserPage';
import EditUserPage from '@pages/users/EditUserPage';
import ProjectListPage from '@pages/projects/ProjectListPage';
import { CreateProjectPage } from '@pages/projects/CreateProjectPage';
import { ProjectDetailsPage } from '@pages/projects/ProjectDetailsPage';
import QuotationListPage from '@pages/quotations/QuotationListPage';
import CreateQuotationPage from '@pages/quotations/CreateQuotationPage';
import ApprovalQueuePage from '@pages/approvals/ApprovalQueuePage';
import ApprovalDashboardPage from '@pages/approvals/ApprovalDashboardPage';
import PaymentDashboardPage from '@pages/payments/PaymentDashboardPage';
import { lightTheme } from '@themes/theme';
import { ROUTES } from '@constants/app';
import { USER_ROLES } from './types/auth';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

// Placeholder components for routes that will be implemented in later phases
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: '20px' }}>
    <h2>{title}</h2>
    <p>This page will be implemented in the next phases of development.</p>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={lightTheme}>
          <CssBaseline />
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />

              {/* Protected Routes - Wrapped in AppLayout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Routes>
                        {/* Dashboard */}
                        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

                        {/* User Management - Super Admin Only */}
                        <Route
                          path={ROUTES.USERS}
                          element={
                            <ProtectedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN]}>
                              <UserListPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path={ROUTES.USER_CREATE}
                          element={
                            <ProtectedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN]}>
                              <CreateUserPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path={ROUTES.USER_DETAIL}
                          element={
                            <ProtectedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN]}>
                              <PlaceholderPage title="User Details" />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path={ROUTES.USER_EDIT}
                          element={
                            <ProtectedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN]}>
                              <EditUserPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Project Management */}
                        <Route
                          path={ROUTES.PROJECTS}
                          element={
                            <ProtectedRoute
                              requiredRoles={[
                                USER_ROLES.SUPER_ADMIN,
                                USER_ROLES.ACCOUNT_MANAGER,
                                USER_ROLES.PROJECT_MANAGER,
                              ]}
                            >
                              <ProjectListPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path={ROUTES.PROJECT_CREATE}
                          element={
                            <ProtectedRoute
                              requiredRoles={[
                                USER_ROLES.SUPER_ADMIN,
                                USER_ROLES.ACCOUNT_MANAGER,
                                USER_ROLES.PROJECT_MANAGER,
                              ]}
                            >
                              <CreateProjectPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path={ROUTES.PROJECT_DETAIL}
                          element={
                            <ProtectedRoute
                              requiredRoles={[
                                USER_ROLES.SUPER_ADMIN,
                                USER_ROLES.ACCOUNT_MANAGER,
                                USER_ROLES.PROJECT_MANAGER,
                              ]}
                            >
                              <ProjectDetailsPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Quotations */}
                        <Route 
                          path={ROUTES.QUOTATIONS} 
                          element={
                            <ProtectedRoute
                              requiredRoles={[
                                USER_ROLES.SUPER_ADMIN,
                                USER_ROLES.ACCOUNT_MANAGER,
                                USER_ROLES.PROJECT_MANAGER,
                              ]}
                            >
                              <QuotationListPage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path={ROUTES.QUOTATION_CREATE} 
                          element={
                            <ProtectedRoute
                              requiredRoles={[
                                USER_ROLES.SUPER_ADMIN,
                                USER_ROLES.PROJECT_MANAGER,
                              ]}
                            >
                              <CreateQuotationPage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route path={ROUTES.QUOTATION_DETAIL} element={<PlaceholderPage title="Quotation Details" />} />

                        {/* Approvals - Account Manager */}
                        <Route
                          path={ROUTES.APPROVALS}
                          element={
                            <ProtectedRoute
                              requiredRoles={[
                                USER_ROLES.SUPER_ADMIN,
                                USER_ROLES.ACCOUNT_MANAGER,
                              ]}
                            >
                              <ApprovalQueuePage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/approvals/dashboard"
                          element={
                            <ProtectedRoute
                              requiredRoles={[
                                USER_ROLES.SUPER_ADMIN,
                                USER_ROLES.ACCOUNT_MANAGER,
                              ]}
                            >
                              <ApprovalDashboardPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Payments - Account Manager */
                        }
                        <Route
                          path={ROUTES.PAYMENTS}
                          element={
                            <ProtectedRoute
                              requiredRoles={[
                                USER_ROLES.SUPER_ADMIN,
                                USER_ROLES.ACCOUNT_MANAGER,
                              ]}
                            >
                              <PaymentDashboardPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path={ROUTES.PAYMENT_PROCESSING}
                          element={
                            <ProtectedRoute
                              requiredRoles={[
                                USER_ROLES.SUPER_ADMIN,
                                USER_ROLES.ACCOUNT_MANAGER,
                              ]}
                            >
                              <PlaceholderPage title="Payment Processing" />
                            </ProtectedRoute>
                          }
                        />

                        {/* Reports */}
                        <Route
                          path={ROUTES.REPORTS}
                          element={
                            <ProtectedRoute
                              requiredRoles={[
                                USER_ROLES.SUPER_ADMIN,
                                USER_ROLES.ACCOUNT_MANAGER,
                                USER_ROLES.PROJECT_MANAGER,
                              ]}
                            >
                              <PlaceholderPage title="Reports" />
                            </ProtectedRoute>
                          }
                        />

                        {/* Documents */}
                        <Route path={ROUTES.DOCUMENTS} element={<PlaceholderPage title="Documents" />} />

                        {/* Notifications */}
                        <Route path={ROUTES.NOTIFICATIONS} element={<PlaceholderPage title="Notifications" />} />

                        {/* Profile & Settings */}
                        <Route path={ROUTES.PROFILE} element={<PlaceholderPage title="Profile" />} />
                        <Route
                          path={ROUTES.SETTINGS}
                          element={
                            <ProtectedRoute requiredRoles={[USER_ROLES.SUPER_ADMIN]}>
                              <PlaceholderPage title="Settings" />
                            </ProtectedRoute>
                          }
                        />

                        {/* Default redirect to dashboard */}
                        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                        
                        {/* Catch all - redirect to dashboard */}
                        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;