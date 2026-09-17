import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Task } from '../types';
import { dbService } from '../services/db';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  switchUser: (userId: string) => void;
  refreshUsers: () => void;
  addUser: (userData: Omit<User, 'id'>) => User;
  deleteUser: (userId: string) => void;
  isManager: boolean;
  isDesigner: boolean;
  isContentCreator: boolean;
  canEditTask: (task?: Task) => boolean;
  canSubmitWork: (task: Task) => boolean;
  canReviewTask: (task: Task) => boolean;
  canReassignTask: () => boolean;
  canApproveTask: () => boolean;
  canRequestRevision: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const users = dbService.getUsers();
    return users[0]; // Default: Andi Triyanto (Manager)
  });

  const refreshUsers = () => {
    const users = dbService.getUsers();
    setAllUsers(users);
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const switchUser = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const created = dbService.createUser(userData, currentUser);
    refreshUsers();
    return created;
  };

  const deleteUser = (userId: string) => {
    dbService.deleteUser(userId);
    refreshUsers();
  };

  const isManager = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';
  const isDesigner = currentUser.role === 'DESIGNER';
  const isContentCreator = currentUser.role === 'CONTENT_CREATOR';

  // Permission checkers
  const canEditTask = (task?: Task) => {
    if (isManager) return true;
    if (!task) return false;
    return task.assignedUserId === currentUser.id;
  };

  const canSubmitWork = (task: Task) => {
    if (isManager) return true; // Manager can submit on behalf if needed
    return task.assignedUserId === currentUser.id;
  };

  const canReviewTask = (task: Task) => {
    return isManager;
  };

  const canReassignTask = () => {
    return isManager;
  };

  const canApproveTask = () => {
    return isManager;
  };

  const canRequestRevision = () => {
    return isManager;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUser,
        refreshUsers,
        addUser,
        deleteUser,
        isManager,
        isDesigner,
        isContentCreator,
        canEditTask,
        canSubmitWork,
        canReviewTask,
        canReassignTask,
        canApproveTask,
        canRequestRevision,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
