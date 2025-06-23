// User Management Types
// Interface definitions for User Management functionality

// User role enum
export enum UserRole {
    SALE = 'SALE',
    EDITOR = 'EDITOR'
}

// User interface for display
export interface User {
    username: string;
    email: string;
    fullName: string;
    role: UserRole | null;
}

// Request interface for creating new user
export interface CreateUserRequest {
    username: string;
    fullname: string;
    role: UserRole;
}

// API Response interface
export interface ApiResponse<T> {
    status: 'success' | 'error';
    message: string;
    data: T | null;
}

// Users list response
export type UsersResponse = ApiResponse<User[]>;

// Create user response
export type CreateUserResponse = ApiResponse<null>;