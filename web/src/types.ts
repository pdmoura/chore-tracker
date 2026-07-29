export type Role = 'PARENT' | 'CHILD';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  assignedToId: string;
  createdById: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: User;
  createdBy: User;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}
