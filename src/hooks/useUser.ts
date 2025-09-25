import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@contexts/AuthContext';
import userService from '@services/userService';
import {
  User,
  UserSearchParams,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRolesRequest,
  UpdateBankDetailsRequest,
  ChangePasswordRequest,
  BulkUserOperation,
  UserExportOptions,
} from '@types/user';
import { USER_ROLES } from '@constants/app';

// Query keys
const QUERY_KEYS = {
  users: ['users'],
  usersList: (params?: UserSearchParams) => ['users', 'list', params],
  user: (userId: string) => ['users', userId],
  userStats: ['users', 'stats'],
  roles: ['users', 'roles'],
  departments: ['users', 'departments'],
  managers: ['users', 'managers'],
  usersByRole: (role: string) => ['users', 'by-role', role],
  userActivity: (userId: string) => ['users', userId, 'activity'],
  subordinates: (userId: string) => ['users', userId, 'subordinates'],
} as const;

/**
 * Hook to get paginated users list with search and filtering
 */
export const useUsers = (params?: UserSearchParams, enabled = true) => {
  const { user } = useAuth();
  
  const hasAccess = user?.roles?.includes(USER_ROLES.SUPER_ADMIN);

  return useQuery({
    queryKey: QUERY_KEYS.usersList(params),
    queryFn: () => userService.getUsers(params),
    enabled: enabled && hasAccess,
    staleTime: 2 * 60 * 1000, // 2 minutes
    keepPreviousData: true, // Keep previous page data while loading new page
  });
};

/**
 * Hook to get single user by ID
 */
export const useUser = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.user(userId),
    queryFn: () => userService.getUserById(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get user statistics
 */
export const useUserStats = () => {
  const { user } = useAuth();
  
  const hasAccess = user?.roles?.includes(USER_ROLES.SUPER_ADMIN);

  return useQuery({
    queryKey: QUERY_KEYS.userStats,
    queryFn: () => userService.getUserStats(),
    enabled: hasAccess,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

/**
 * Hook to get available roles
 */
export const useRoles = () => {
  return useQuery({
    queryKey: QUERY_KEYS.roles,
    queryFn: () => userService.getRoles(),
    staleTime: 30 * 60 * 1000, // 30 minutes (roles don't change often)
  });
};

/**
 * Hook to get departments
 */
export const useDepartments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.departments,
    queryFn: () => userService.getDepartments(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to get managers list
 */
export const useManagers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.managers,
    queryFn: () => userService.getManagers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get users by role
 */
export const useUsersByRole = (role: string, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.usersByRole(role),
    queryFn: () => userService.getUsersByRole(role),
    enabled: enabled && !!role,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get user activity history
 */
export const useUserActivity = (userId: string, params?: any, enabled = true) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.userActivity(userId), params],
    queryFn: () => userService.getUserActivity(userId, params),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get user's subordinates
 */
export const useUserSubordinates = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.subordinates(userId),
    queryFn: () => userService.getUserSubordinates(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to create new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => userService.createUser(userData),
    onSuccess: (newUser) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      // Update user stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
      // Add the new user to the cache
      queryClient.setQueryData(QUERY_KEYS.user(newUser.id), newUser);
    },
  });
};

/**
 * Hook to update user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: UpdateUserRequest }) =>
      userService.updateUser(userId, userData),
    onSuccess: (updatedUser, { userId }) => {
      // Update specific user in cache
      queryClient.setQueryData(QUERY_KEYS.user(userId), updatedUser);
      // Invalidate users list to refresh
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });
};

/**
 * Hook to update user roles
 */
export const useUpdateUserRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roles }: { userId: string; roles: UpdateUserRolesRequest }) =>
      userService.updateUserRoles(userId, roles),
    onSuccess: (updatedUser, { userId }) => {
      // Update specific user in cache
      queryClient.setQueryData(QUERY_KEYS.user(userId), updatedUser);
      // Invalidate users list to refresh
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      // Invalidate user stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
    },
  });
};

/**
 * Hook to update bank details
 */
export const useUpdateBankDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, bankDetails }: { userId: string; bankDetails: UpdateBankDetailsRequest }) =>
      userService.updateBankDetails(userId, bankDetails),
    onSuccess: (updatedUser, { userId }) => {
      // Update specific user in cache
      queryClient.setQueryData(QUERY_KEYS.user(userId), updatedUser);
      // Invalidate users list to refresh
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });
};

/**
 * Hook to activate user
 */
export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.activateUser(userId),
    onSuccess: (updatedUser, userId) => {
      // Update specific user in cache
      queryClient.setQueryData(QUERY_KEYS.user(userId), updatedUser);
      // Invalidate users list to refresh
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      // Update user stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
    },
  });
};

/**
 * Hook to deactivate user
 */
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.deactivateUser(userId),
    onSuccess: (updatedUser, userId) => {
      // Update specific user in cache
      queryClient.setQueryData(QUERY_KEYS.user(userId), updatedUser);
      // Invalidate users list to refresh
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      // Update user stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
    },
  });
};

/**
 * Hook to delete user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: (_, userId) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.user(userId) });
      // Invalidate users list to refresh
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      // Update user stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
    },
  });
};

/**
 * Hook to change password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ userId, passwordData }: { userId: string; passwordData: ChangePasswordRequest }) =>
      userService.changePassword(userId, passwordData),
  });
};

/**
 * Hook to reset password (admin only)
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (userId: string) => userService.resetPassword(userId),
  });
};

/**
 * Hook for bulk operations
 */
export const useBulkUserOperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (operation: BulkUserOperation) => userService.performBulkOperation(operation),
    onSuccess: () => {
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
    },
  });
};

/**
 * Hook to export users
 */
export const useExportUsers = () => {
  return useMutation({
    mutationFn: (options: UserExportOptions) => userService.exportUsers(options),
  });
};

/**
 * Hook to import users
 */
export const useImportUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => userService.importUsers(file),
    onSuccess: () => {
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
    },
  });
};

/**
 * Hook to upload profile image
 */
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      userService.uploadProfileImage(userId, file),
    onSuccess: (result, { userId }) => {
      // Update user data with new image URL
      queryClient.setQueryData(QUERY_KEYS.user(userId), (oldData: User | undefined) => {
        if (oldData) {
          return { ...oldData, profileImage: result.imageUrl };
        }
        return oldData;
      });
    },
  });
};

/**
 * Hook for username availability check with debouncing
 */
export const useCheckUsernameAvailability = (username: string, excludeUserId?: string) => {
  return useQuery({
    queryKey: ['username-availability', username, excludeUserId],
    queryFn: () => userService.checkUsernameAvailability(username, excludeUserId),
    enabled: !!username && username.length >= 3,
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
  });
};

/**
 * Hook for email availability check with debouncing
 */
export const useCheckEmailAvailability = (email: string, excludeUserId?: string) => {
  return useQuery({
    queryKey: ['email-availability', email, excludeUserId],
    queryFn: () => userService.checkEmailAvailability(email, excludeUserId),
    enabled: !!email && email.includes('@'),
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
  });
};

/**
 * Hook to refresh all user-related data
 */
export const useRefreshUsers = () => {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.departments });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.managers });
  };

  const refreshUsersList = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
  };

  const refreshUser = (userId: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(userId) });
  };

  const refreshUserStats = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
  };

  return {
    refreshAll,
    refreshUsersList,
    refreshUser,
    refreshUserStats,
  };
};