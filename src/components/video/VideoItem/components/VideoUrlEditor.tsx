import React, { useState, useEffect } from 'react';

interface VideoUrlEditorProps {
    videoUrl?: string;
    isUpdating: boolean;
    onUpdate: (url: string) => void;
    onCopy: () => void;
}

// Hàm validate URL
const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty URL is allowed
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const VideoUrlEditor: React.FC<VideoUrlEditorProps> = ({
    videoUrl,
    isUpdating,
    onUpdate,
    onCopy
}) => {
    const [editingVideoUrl, setEditingVideoUrl] = useState(false);
    const [tempVideoUrl, setTempVideoUrl] = useState(videoUrl || '');
    const [urlError, setUrlError] = useState('');

    // Update temp URL when prop changes
    useEffect(() => {
        setTempVideoUrl(videoUrl || '');
    }, [videoUrl]);

    // Hàm xử lý khi bắt đầu edit video URL
    const handleVideoUrlEditStart = () => {
        setEditingVideoUrl(true);
        setTempVideoUrl(videoUrl || '');
        setUrlError('');
    };

    // Hàm xử lý khi hủy edit video URL
    const handleVideoUrlEditCancel = () => {
        setEditingVideoUrl(false);
        setTempVideoUrl(videoUrl || '');
        setUrlError('');
    };

    // Hàm xử lý khi thay đổi video URL
    const handleVideoUrlChange = (newUrl: string) => {
        setTempVideoUrl(newUrl);

        // Validate URL realtime
        if (newUrl.trim() && !isValidUrl(newUrl)) {
            setUrlError('URL không hợp lệ');
        } else {
            setUrlError('');
        }
    };

    // Hàm xử lý cập nhật video URL
    const handleVideoUrlUpdate = () => {
        const trimmedUrl = tempVideoUrl.trim();

        // Validate URL
        if (trimmedUrl && !isValidUrl(trimmedUrl)) {
            setUrlError('URL không hợp lệ');
            return;
        }

        // Nếu URL không thay đổi
        if (trimmedUrl === (videoUrl || '')) {
            setEditingVideoUrl(false);
            return;
        }

        onUpdate(trimmedUrl);
        setEditingVideoUrl(false);
    };

    // Hàm xử lý key press trong input video URL
    const handleVideoUrlKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleVideoUrlUpdate();
        } else if (e.key === 'Escape') {
            handleVideoUrlEditCancel();
        }
    };

    return (
        <div style={{ minWidth: '200px' }}>
            {editingVideoUrl ? (
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={tempVideoUrl}
                        onChange={(e) => handleVideoUrlChange(e.target.value)}
                        onBlur={handleVideoUrlUpdate}
                        onKeyDown={handleVideoUrlKeyPress}
                        disabled={isUpdating}
                        placeholder="Nhập link video..."
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
                    gap: '4px'
                }}>
                    {/* Hiển thị URL hoặc placeholder */}
                    <div
                        style={{
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid transparent',
                            transition: 'all 0.2s',
                            fontSize: '12px',
                            minHeight: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: videoUrl ? '#f0fdf4' : '#f9fafb',
                            color: videoUrl ? '#059669' : '#6b7280',
                            flex: 1
                        }}
                        onClick={handleVideoUrlEditStart}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.backgroundColor = videoUrl ? '#ecfdf5' : '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.backgroundColor = videoUrl ? '#f0fdf4' : '#f9fafb';
                        }}
                        title={videoUrl ? `Click để sửa: ${videoUrl}` : 'Click để thêm link video'}
                    >
                        {videoUrl ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                overflow: 'hidden'
                            }}>
                                <span>🎥</span>
                                <span style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '120px'
                                }}>
                                    {videoUrl.length > 20
                                        ? `${videoUrl.substring(0, 20)}...`
                                        : videoUrl
                                    }
                                </span>
                            </div>
                        ) : (
                            <span style={{ fontStyle: 'italic' }}>+ Thêm link</span>
                        )}
                    </div>

                    {/* Copy Button - chỉ hiển thị khi có URL */}
                    {videoUrl && videoUrl.trim() && (
                        <button
                            onClick={onCopy}
                            style={{
                                background: '#3b82f6',
                                border: 'none',
                                borderRadius: '4px',
                                color: 'white',
                                padding: '4px 6px',
                                fontSize: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '24px',
                                height: '24px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#3b82f6';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                            title="Copy link video"
                        >
                            📋
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default React.memo(VideoUrlEditor);