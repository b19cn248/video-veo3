// UserList Component
// Displays list of users in a table format

import React from 'react';
import { User } from '../../../types/user.types';
import Loading from '../../common/Loading/Loading';

interface UserListProps {
    users: User[];
    loading: boolean;
    error: string | null;
    onRefresh: () => void;
}

const UserList: React.FC<UserListProps> = ({ users, loading, error, onRefresh }) => {
    
    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                backgroundColor: '#fefefe',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
            }}>
                <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '16px' }}>
                    ❌ {error}
                </div>
                <button
                    onClick={onRefresh}
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    🔄 Retry
                </button>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                backgroundColor: '#fefefe',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
            }}>
                <div style={{ color: '#6b7280', fontSize: '16px' }}>
                    👥 No users found
                </div>
            </div>
        );
    }

    const getRoleBadgeStyle = (role: string | null) => {
        const baseStyle = {
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'uppercase' as const
        };

        switch (role) {
            case 'SALE':
                return {
                    ...baseStyle,
                    backgroundColor: '#dbeafe',
                    color: '#1e40af'
                };
            case 'EDITOR':
                return {
                    ...baseStyle,
                    backgroundColor: '#dcfce7',
                    color: '#166534'
                };
            default:
                return {
                    ...baseStyle,
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280'
                };
        }
    };

    return (
        <div style={{ 
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
        }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ 
                                padding: '12px 16px',
                                textAlign: 'left',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                Username
                            </th>
                            <th style={{ 
                                padding: '12px 16px',
                                textAlign: 'left',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                Email
                            </th>
                            <th style={{ 
                                padding: '12px 16px',
                                textAlign: 'left',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                Full Name
                            </th>
                            <th style={{ 
                                padding: '12px 16px',
                                textAlign: 'center',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                Role
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr 
                                key={user.username}
                                style={{ 
                                    borderBottom: index < users.length - 1 ? '1px solid #f3f4f6' : 'none',
                                    backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                                }}
                            >
                                <td style={{ 
                                    padding: '12px 16px',
                                    fontWeight: '500',
                                    color: '#1f2937'
                                }}>
                                    {user.username}
                                </td>
                                <td style={{ 
                                    padding: '12px 16px',
                                    color: '#6b7280'
                                }}>
                                    {user.email}
                                </td>
                                <td style={{ 
                                    padding: '12px 16px',
                                    color: '#1f2937'
                                }}>
                                    {user.fullName}
                                </td>
                                <td style={{ 
                                    padding: '12px 16px',
                                    textAlign: 'center'
                                }}>
                                    <span style={getRoleBadgeStyle(user.role)}>
                                        {user.role || 'N/A'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserList;