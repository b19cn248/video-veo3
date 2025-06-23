// UserManagement Component
// Main container for user management functionality
// Only accessible by super admin (realm admin)

import React, { useState, useEffect } from 'react';
import { useIsRealmAdmin } from '../../../contexts/AuthContext';
import { User } from '../../../types/user.types';
import { UserService } from '../../../services/userService';
import UserList from '../UserList/UserList';
import CreateUserModal from '../CreateUserModal/CreateUserModal';

const UserManagement: React.FC = () => {
    const isRealmAdmin = useIsRealmAdmin();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const usersData = await UserService.getAllUsers();
            setUsers(usersData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isRealmAdmin) {
            fetchUsers();
        }
    }, [isRealmAdmin]);

    // Redirect non-super admin users
    if (!isRealmAdmin) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                backgroundColor: '#f9fafb'
            }}>
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    maxWidth: '400px'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                    <h2 style={{ 
                        color: '#1f2937', 
                        marginBottom: '8px',
                        fontSize: '24px' 
                    }}>
                        Access Denied
                    </h2>
                    <p style={{ 
                        color: '#6b7280', 
                        margin: 0,
                        fontSize: '16px' 
                    }}>
                        Only super administrators can access user management.
                    </p>
                </div>
            </div>
        );
    }

    const handleCreateUser = () => {
        setIsCreateModalOpen(true);
    };

    const handleModalClose = () => {
        setIsCreateModalOpen(false);
    };

    const handleUserCreated = () => {
        fetchUsers(); // Refresh the users list
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: '0 0 8px 0'
                        }}>
                            👥 User Management
                        </h1>
                        <p style={{
                            color: '#6b7280',
                            margin: 0,
                            fontSize: '16px'
                        }}>
                            Manage system users and their roles
                        </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                            onClick={fetchUsers}
                            disabled={loading}
                            style={{
                                padding: '10px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                backgroundColor: 'white',
                                color: '#374151',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            {loading ? '⏳' : '🔄'} Refresh
                        </button>
                        
                        <button
                            onClick={handleCreateUser}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '6px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            ➕ Create New User
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                            {users.length}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            Total Users
                        </div>
                    </div>
                    
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
                            {users.filter(u => u.role === 'SALE').length}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            Sales Users
                        </div>
                    </div>
                    
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#166534' }}>
                            {users.filter(u => u.role === 'EDITOR').length}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            Editor Users
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <UserList
                    users={users}
                    loading={loading}
                    error={error}
                    onRefresh={fetchUsers}
                />

                {/* Create User Modal */}
                <CreateUserModal
                    isOpen={isCreateModalOpen}
                    onClose={handleModalClose}
                    onUserCreated={handleUserCreated}
                />
            </div>
        </div>
    );
};

export default UserManagement;