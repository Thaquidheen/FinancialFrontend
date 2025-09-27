import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@services/userService';
import {
  User,
  UserSearchParams,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRolesRequest,
  UpdateBankDetailsRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ActivitySearchParams,
} from '../types/user';

// Query Keys
export const USER_QUERY_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_QUERY_KEYS.all, 'list'] as const,
  list: (params: UserSearchParams) => [...USER_QUERY_KEYS.lists(), params] as const,
  details: () => [...USER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.details(), id] as const,
  statistics: () => [...USER_QUERY_KEYS.all, 'statistics'] as const,
  activities: (userId: string) => [...USER_QUERY_KEYS.all, 'activities', userId] as const,
  activity: (userId: string, params: ActivitySearchParams) => 
    [...USER_QUERY_KEYS.activities(userId), params] as const,
};

// Fetch Users List
export const useUsers = (params: UserSearchParams = {}) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.list(params),
    queryFn: () => userService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
};

// Fetch Single User
export const useUser = (id: string) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(id),
    queryFn: () => userService.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch User Statistics
export const useUserStatistics = () => ({ data: undefined } as any);

// Fetch User Activities
export const useUserActivities = (_userId: string, _params: Omit<ActivitySearchParams, 'userId'> = {}) => ({ data: undefined } as any);

// Create User Mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => userService.createUser(userData),
    onSuccess: (newUser) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      // statistics unsupported
      
      // Add to cache
      queryClient.setQueryData(USER_QUERY_KEYS.detail(newUser.id), newUser);
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
};

// Update User Mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: UpdateUserRequest }) =>
      userService.updateUser(userId, userData),
    onSuccess: (updatedUser, { userId }) => {
      // Update specific user in cache
      queryClient.setQueryData(USER_QUERY_KEYS.detail(userId), updatedUser);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      // statistics unsupported
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });
};

// Update User Roles Mutation
export const useUpdateUserRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, rolesData }: { userId: string; rolesData: UpdateUserRolesRequest }) =>
      userService.updateUserRoles(userId, rolesData),
    onSuccess: (updatedUser, { userId }) => {
      // Update specific user in cache
      queryClient.setQueryData(USER_QUERY_KEYS.detail(userId), updatedUser);
      
      // Invalidate lists and statistics
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.statistics() });
    },
    onError: (error) => {
      console.error('Failed to update user roles:', error);
    },
  });
};

// Update Bank Details Mutation
export const useUpdateBankDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, bankData }: { userId: string; bankData: UpdateBankDetailsRequest }) =>
      userService.updateBankDetails(userId, bankData),
    onSuccess: (updatedUser, { userId }) => {
      // Update specific user in cache
      queryClient.setQueryData(USER_QUERY_KEYS.detail(userId), updatedUser);
      
      // Invalidate lists to show updated bank status
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.statistics() });
    },
    onError: (error) => {
      console.error('Failed to update bank details:', error);
    },
  });
};

// Change Password Mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (passwordData: ChangePasswordRequest) =>
      userService.changePassword(passwordData),
    onError: (error) => {
      console.error('Failed to change password:', error);
    },
  });
};

// Reset Password Mutation (Admin only)
export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resetData: ResetPasswordRequest) =>
      userService.resetPassword(resetData),
    onSuccess: (_, { userId }) => {
      if (userId) {
        // Invalidate user details to refresh password status
        queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.detail(userId) });
        
        // Log activity
        queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.activities(userId) });
      }
    },
    onError: (error) => {
      console.error('Failed to reset password:', error);
    },
  });
};

// Activate User Mutation
export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.activateUser(userId),
    onSuccess: (updatedUser, userId) => {
      // Update specific user in cache
      queryClient.setQueryData(USER_QUERY_KEYS.detail(userId), updatedUser);
      
      // Invalidate lists and statistics
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.statistics() });
      
      // Log activity
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.activities(userId) });
    },
    onError: (error) => {
      console.error('Failed to activate user:', error);
    },
  });
};

// Deactivate User Mutation
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.deactivateUser(userId),
    onSuccess: (updatedUser, userId) => {
      // Update specific user in cache
      queryClient.setQueryData(USER_QUERY_KEYS.detail(userId), updatedUser);
      
      // Invalidate lists and statistics
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.statistics() });
      
      // Log activity
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.activities(userId) });
    },
    onError: (error) => {
      console.error('Failed to deactivate user:', error);
    },
  });
};

// Delete User Mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: (_, userId) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: USER_QUERY_KEYS.detail(userId) });
      queryClient.removeQueries({ queryKey: USER_QUERY_KEYS.activities(userId) });
      
      // Invalidate lists and statistics
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.statistics() });
    },
    onError: (error) => {
      console.error('Failed to delete user:', error);
    },
  });
};

// Bulk Operations
export const useBulkUpdateUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, operation }: { userIds: string[]; operation: 'activate' | 'deactivate' }) =>
      userService.bulkUpdateUsers(userIds, operation),
    onSuccess: () => {
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
    },
    onError: (error) => {
      console.error('Failed to perform bulk operation:', error);
    },
  });
};

// Custom hooks for specific use cases
export const useActiveUsers = (params: Omit<UserSearchParams, 'active'> = {}) => {
  return useUsers({ ...params, active: true });
};

export const useUserStats = () => {
  return useUserStatistics();
};

export const useInactiveUsers = (params: Omit<UserSearchParams, 'active'> = {}) => {
  return useUsers({ ...params, active: false });
};

export const useProjectManagers = (params: Omit<UserSearchParams, 'roles'> = {}) => {
  return useUsers({ ...params, roles: ['PROJECT_MANAGER'] });
};

export const useAccountManagers = (params: Omit<UserSearchParams, 'roles'> = {}) => {
  return useUsers({ ...params, roles: ['ACCOUNT_MANAGER'] });
};

export const useUsersWithoutBankDetails = () => ({ data: [] } as any);

// Prefetch utilities
export const usePrefetchUser = () => {
  const queryClient = useQueryClient();

  return (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: USER_QUERY_KEYS.detail(userId),
      queryFn: () => userService.getUser(userId),
      staleTime: 5 * 60 * 1000,
    });
  };
};

export const usePrefetchUserActivities = () => () => undefined;

// Optimistic Updates
export const useOptimisticUserUpdate = () => {
  const queryClient = useQueryClient();

  return {
    updateUserOptimistically: (userId: string, updates: Partial<User>) => {
      queryClient.setQueryData(USER_QUERY_KEYS.detail(userId), (oldUser: User | undefined) => {
        if (!oldUser) return oldUser;
        return { ...oldUser, ...updates };
      });
    },
    
    rollbackOptimisticUpdate: (userId: string, previousUser: User) => {
      queryClient.setQueryData(USER_QUERY_KEYS.detail(userId), previousUser);
    },
  };
};

export const useExportUsers = () => ({ mutateAsync: async () => new Blob(), isPending: false } as any);
export const useRefreshUsers = () => {
  const queryClient = useQueryClient();

  return {
    refreshAll: () => {
      return queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
    },
    refresh: () => {
      return queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  };
};
// Error Recovery
export const useRetryUserOperation = () => {
  const queryClient = useQueryClient();

  return {
    retryGetUser: (userId: string) => {
      return queryClient.refetchQueries({ queryKey: USER_QUERY_KEYS.detail(userId) });
    },
    
    retryGetUsers: (params: UserSearchParams = {}) => {
      return queryClient.refetchQueries({ queryKey: USER_QUERY_KEYS.list(params) });
    },
    
    retryUserActivities: (userId: string, params: Omit<ActivitySearchParams, 'userId'> = {}) => {
      return queryClient.refetchQueries({ 
        queryKey: USER_QUERY_KEYS.activity(userId, { userId, ...params }) 
      });
    },
  };
};

// Additional hooks for RoleAssignmentPanel and UserForm
export const useRoles = () => {
  return useQuery({
    queryKey: [...USER_QUERY_KEYS.all, 'roles'],
    queryFn: () => userService.getRoles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDepartments = () => ({ data: [] } as any);

export const useManagers = () => ({ data: [] } as any);

export const useCheckUsernameAvailability = (username: string, excludeUserId?: string) => {
  return useQuery({
    queryKey: [...USER_QUERY_KEYS.all, 'username-check', username, excludeUserId],
    queryFn: () => userService.checkUsernameAvailability(username, excludeUserId),
    enabled: !!username && username.length >= 3,
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
  });
};

export const useCheckEmailAvailability = (email: string, excludeUserId?: string) => {
  return useQuery({
    queryKey: [...USER_QUERY_KEYS.all, 'email-check', email, excludeUserId],
    queryFn: () => userService.checkEmailAvailability(email, excludeUserId),
    enabled: !!email && email.includes('@'),
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
  });
};