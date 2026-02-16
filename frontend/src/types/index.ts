// TypeScript types for the application

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: 'learner' | 'trainer' | 'leadership' | 'admin';
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  trainer_id: number;
  thumbnail_url?: string;
  is_published: boolean;
  created_at: string;
}

export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  content_type: string;
  content_url: string;
  duration_minutes: number;
  order: number;
}

export interface Progress {
  user_id: number;
  lesson_id: number;
  completed: boolean;
  last_position: number;
  completed_at?: string;
}
