// Component hiển thị trạng thái tìm kiếm theo tên khách hàng
// Chỉ hiển thị khi admin đang search theo customer name
// NEW: Component riêng để tái sử dụng và maintain dễ dàng

import React from 'react';

interface CustomerSearchStatusProps {
    customerName: string;
    totalResults: number;
    isSearching: boolean;
    onClearSearch: () => void;
}

const CustomerSearchStatus: React.FC<CustomerSearchStatusProps> = ({
    customerName,
    totalResults,
    isSearching,
    onClearSearch
}) => {
    if (!customerName.trim()) {
        return null;
    }

    return (
        <div style={{
            background: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span style={{
                    fontSize: '16px'
                }}>
                    🔍
                </span>
                <div>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0369a1'
                    }}>
                        Kết quả tìm kiếm cho khách hàng: "{customerName}"
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: '#0284c7',
                        marginTop: '2px'
                    }}>
                        {isSearching ? (
                            <span>⏳ Đang tìm kiếm...</span>
                        ) : (
                            <span>
                                {totalResults > 0 
                                    ? `Tìm thấy ${totalResults} video phù hợp`
                                    : 'Không tìm thấy video nào phù hợp'
                                }
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            <button
                onClick={onClearSearch}
                style={{
                    background: '#0ea5e9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0284c7';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0ea5e9';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
                title="Xóa tìm kiếm và quay lại danh sách đầy đủ"
            >
                ✖️ Xóa tìm kiếm
            </button>
        </div>
    );
};

export default CustomerSearchStatus;