/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { NotificationProvider } from './context/NotificationContext';
import { Sidebar, ActivePage } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { CreateTaskModal } from './components/tasks/CreateTaskModal';
import { TaskDetailModal } from './components/tasks/TaskDetailModal';
import { Task } from './types';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { KanbanPage } from './pages/KanbanPage';
import { CalendarPage } from './pages/CalendarPage';
import { TeamPage } from './pages/TeamPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { tasks, selectedTaskId, setSelectedTaskId, setFilters } = useTasks();
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  const handleOpenCreateTask = () => {
    setTaskToEdit(null);
    setIsCreateTaskOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsCreateTaskOpen(true);
  };

  // Navigation callbacks from dashboard / components
  const handleNavigateToTasks = (statusFilter?: string) => {
    if (statusFilter && statusFilter !== 'ALL') {
      setFilters((f) => ({ ...f, status: statusFilter as any }));
    } else {
      setFilters((f) => ({ ...f, status: undefined }));
    }
    setActivePage('tasks');
  };

  const handleFilterByUser = (userId: string) => {
    setFilters((f) => ({ ...f, userId }));
    setActivePage('tasks');
  };

  const handleFilterByProject = (projectId: string) => {
    setFilters((f) => ({ ...f, projectId }));
    setActivePage('tasks');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-amber-500 selection:text-white">
      {/* Toast Notification Layer */}
      <ToastContainer />

      {/* Responsive Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenCreateTask={handleOpenCreateTask}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          activePage={activePage}
        />

        {/* Page Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activePage === 'dashboard' && (
            <DashboardPage
              onNavigateToTasks={handleNavigateToTasks}
              onNavigateToTeam={() => setActivePage('team')}
              onOpenCreateTask={handleOpenCreateTask}
            />
          )}

          {activePage === 'tasks' && (
            <TasksPage
              onOpenCreateTask={handleOpenCreateTask}
              onEditTask={handleOpenEditTask}
            />
          )}

          {activePage === 'my-tasks' && (
            <TasksPage
              myTasksOnly
              onOpenCreateTask={handleOpenCreateTask}
              onEditTask={handleOpenEditTask}
            />
          )}

          {activePage === 'kanban' && (
            <KanbanPage onOpenCreateTask={handleOpenCreateTask} />
          )}

          {activePage === 'calendar' && <CalendarPage />}

          {activePage === 'team' && (
            <TeamPage onFilterByUser={handleFilterByUser} />
          )}

          {activePage === 'projects' && (
            <ProjectsPage onFilterByProject={handleFilterByProject} />
          )}

          {activePage === 'reports' && <ReportsPage />}

          {activePage === 'notifications' && <NotificationsPage />}

          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Create / Edit Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => {
          setIsCreateTaskOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />

      {/* Detailed Task Lifecycle Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={Boolean(selectedTaskId && selectedTask)}
        onClose={() => setSelectedTaskId(null)}
        onEditTask={handleOpenEditTask}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <TaskProvider>
          <AppContent />
        </TaskProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
