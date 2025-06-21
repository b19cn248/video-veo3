import React, { useState, useEffect } from 'react';

interface BillImageUrlEditorProps {
    billImageUrl?: string;
    isUpdating: boolean;
    onUpdate: (url: string) => void;
    onView: () => void;
}

// Hàm validate URL (tương tự VideoUrlEditor)
const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty URL is allowed
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};


const BillImageUrlEditor: React.FC<BillImageUrlEditorProps> = ({
    billImageUrl,
    isUpdating,
    onUpdate,
    onView
}) => {
    const [editingBillImageUrl, setEditingBillImageUrl] = useState(false);
    const [tempBillImageUrl, setTempBillImageUrl] = useState(billImageUrl || '');
    const [urlError, setUrlError] = useState('');
    const [showTooltip, setShowTooltip] = useState(false);

    // Update temp URL when prop changes
    useEffect(() => {
        setTempBillImageUrl(billImageUrl || '');
    }, [billImageUrl]);

    // Hàm xử lý khi bắt đầu edit bill image URL
    const handleBillImageUrlEditStart = () => {
        setEditingBillImageUrl(true);
        setTempBillImageUrl(billImageUrl || '');
        setUrlError('');
    };

    // Hàm xử lý khi hủy edit bill image URL
    const handleBillImageUrlEditCancel = () => {
        setEditingBillImageUrl(false);
        setTempBillImageUrl(billImageUrl || '');
        setUrlError('');
    };

    // Hàm xử lý khi thay đổi bill image URL
    const handleBillImageUrlChange = (newUrl: string) => {
        setTempBillImageUrl(newUrl);

        // Validate URL realtime
        if (newUrl.trim() && !isValidUrl(newUrl)) {
            setUrlError('URL không hợp lệ');
        } else {
            setUrlError('');
        }
    };

    // Hàm xử lý cập nhật bill image URL
    const handleBillImageUrlUpdate = () => {
        const trimmedUrl = tempBillImageUrl.trim();

        // Validate URL
        if (trimmedUrl && !isValidUrl(trimmedUrl)) {
            setUrlError('URL không hợp lệ');
            return;
        }

        // Nếu URL không thay đổi
        if (trimmedUrl === (billImageUrl || '')) {
            setEditingBillImageUrl(false);
            return;
        }

        onUpdate(trimmedUrl);
        setEditingBillImageUrl(false);
    };

    // Hàm xử lý key press trong input bill image URL
    const handleBillImageUrlKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBillImageUrlUpdate();
        } else if (e.key === 'Escape') {
            handleBillImageUrlEditCancel();
        }
    };

    // Hàm mở ảnh trong tab mới
    const handleOpenImage = () => {
        if (billImageUrl) {
            window.open(billImageUrl, '_blank', 'noopener,noreferrer');
        }
    };

    // Icon button style
    const iconButtonStyle = {
        background: 'transparent',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        color: '#374151',
        padding: '0',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        transition: 'all 0.2s',
        position: 'relative' as const
    };

    // Tooltip style
    const tooltipStyle = {
        position: 'absolute' as const,
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '8px 12px',
        fontSize: '12px',
        borderRadius: '6px',
        whiteSpace: 'nowrap' as const,
        marginBottom: '8px',
        zIndex: 1000,
        maxWidth: '400px',
        wordBreak: 'break-all' as const,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    };

    return (
        <div style={{ position: 'relative' }}>
            {editingBillImageUrl ? (
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={tempBillImageUrl}
                        onChange={(e) => handleBillImageUrlChange(e.target.value)}
                        onBlur={handleBillImageUrlUpdate}
                        onKeyDown={handleBillImageUrlKeyPress}
                        disabled={isUpdating}
                        placeholder="Nhập link hình ảnh hóa đơn..."
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '4px 8px',
                            fontSize: '12px',
                            border: urlError ? '1px solid #ef4444' : '1px solid #3b82f6',
                            borderRadius: '4px',
                            outline: 'none'
                        }}
                    />
                    {urlError && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '0',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            padding: '2px 6px',
                            fontSize: '10px',
                            borderRadius: '3px',
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            zIndex: 10
                        }}>
                            {urlError}
                        </div>
                    )}
                    {isUpdating && (
                        <div style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '10px'
                        }}>
                            ⏳
                        </div>
                    )}
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: 'center'
                }}>
                    {billImageUrl ? (
                        <>
                            {/* View button */}
                            <button
                                onClick={handleOpenImage}
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                                style={{
                                    ...iconButtonStyle,
                                    backgroundColor: '#fef3c7',
                                    borderColor: '#fcd34d',
                                    color: '#d97706'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fde68a';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fef3c7';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                                title="Xem ảnh hóa đơn"
                            >
                                🖼️
                                {showTooltip && (
                                    <div style={tooltipStyle}>
                                        {billImageUrl}
                                    </div>
                                )}
                            </button>

                            {/* Edit button */}
                            <button
                                onClick={handleBillImageUrlEditStart}
                                style={{
                                    ...iconButtonStyle,
                                    backgroundColor: '#eff6ff',
                                    borderColor: '#93c5fd',
                                    color: '#2563eb'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#dbeafe';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#eff6ff';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                                title="Sửa link"
                            >
                                ✏️
                            </button>
                        </>
                    ) : (
                        /* Add button when no URL */
                        <button
                            onClick={handleBillImageUrlEditStart}
                            style={{
                                ...iconButtonStyle,
                                backgroundColor: '#f3f4f6',
                                borderColor: '#d1d5db',
                                color: '#6b7280',
                                width: 'auto',
                                padding: '0 12px',
                                gap: '4px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e5e7eb';
                                e.currentTarget.style.borderColor = '#9ca3af';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                                e.currentTarget.style.borderColor = '#d1d5db';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                            title="Thêm ảnh hóa đơn"
                        >
                            <span style={{ fontSize: '16px' }}>+</span>
                            <span style={{ fontSize: '12px' }}>Thêm</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default React.memo(BillImageUrlEditor);