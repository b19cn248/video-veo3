// User Management Service
// API calls for user management functionality

import { User, CreateUserRequest, UsersResponse, CreateUserResponse } from '../types/user.types';
import { AuthService } from './authService';

// API base URL configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

export class UserService {
    
    // Get all users from the system
    static async getAllUsers(): Promise<User[]> {
        try {
            const token = await AuthService.ensureTokenValid();
            if (!token) {
                throw new Error('No valid token available');
            }

            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: UsersResponse = await response.json();
            
            if (data.status === 'error') {
                throw new Error(data.message);
            }

            return data.data || [];
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    // Create a new user
    static async createUser(userData: CreateUserRequest): Promise<void> {
        try {
            const token = await AuthService.ensureTokenValid();
            if (!token) {
                throw new Error('No valid token available');
            }

            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data: CreateUserResponse = await response.json();
            
            if (data.status === 'error') {
                throw new Error(data.message);
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Validate username format
    static validateUsername(username: string): string | null {
        if (!username || username.trim().length === 0) {
            return 'Username is required';
        }
        
        if (username.includes(' ')) {
            return 'Username cannot contain spaces';
        }
        
        if (username.length < 3) {
            return 'Username must be at least 3 characters';
        }
        
        return null;
    }

    // Validate full name format
    static validateFullname(fullname: string): string | null {
        if (!fullname || fullname.trim().length === 0) {
            return 'Full name is required';
        }
        
        const words = fullname.trim().split(/\s+/);
        if (words.length < 2) {
            return 'Full name must contain at least 2 words';
        }
        
        return null;
    }
}