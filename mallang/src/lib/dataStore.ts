// This file acts as a simple in-memory data store for demonstration purposes.
// In a real application, you would connect to a database here.

export interface User {
  nickname: string;
  password: string; // In a real app, this would be hashed
}

export interface Schedule {
  id: string;
  bossName: string;
  scheduleTitle: string;
  days: string[];
  startTime: string;
  endTime: string;
  completed: boolean;
}

export const users: User[] = [];
export const schedules: Schedule[] = []; 