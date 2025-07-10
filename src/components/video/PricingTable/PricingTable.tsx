import React, { useState } from 'react';
import { VideoPricingResponseDto, PricingTableTheme } from '../../../types/video.types';
import { formatCurrency } from '../../../utils/formatters';

interface PricingTableProps {
    pricingData: VideoPricingResponseDto[];
    loading?: boolean;
    error?: string;
    onThemeChange?: (theme: string) => void;
}

// Định nghĩa 5 themes cao cấp với màu sắc và effects nâng cao
const themes: PricingTableTheme[] = [
    {
        name: 'ocean',
        displayName: '🌊 Biển xanh',
        colors: {
            primary: '#0891b2',
            secondary: '#0e7490',
            background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 50%, #a5f3fc 100%)',
            text: '#164e63',
            accent: 'linear-gradient(135deg, #a5f3fc 0%, #67e8f9 100%)',
            border: '#22d3ee',
            hover: 'linear-gradient(135deg, #67e8f9 0%, #06b6d4 100%)'
        }
    },
    {
        name: 'sunset',
        displayName: '🌅 Hoàng hôn',
        colors: {
            primary: '#ea580c',
            secondary: '#c2410c',
            background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fdba74 100%)',
            text: '#9a3412',
            accent: 'linear-gradient(135deg, #fed7aa 0%, #fb923c 100%)',
            border: '#f97316',
            hover: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)'
        }
    },
    {
        name: 'emerald',
        displayName: '💚 Ngọc lục',
        colors: {
            primary: '#059669',
            secondary: '#047857',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
            text: '#065f46',
            accent: 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)',
            border: '#10b981',
            hover: 'linear-gradient(135deg, #6ee7b7 0%, #059669 100%)'
        }
    },
    {
        name: 'royal',
        displayName: '👑 Hoàng gia',
        colors: {
            primary: '#7c3aed',
            secondary: '#6d28d9',
            background: 'linear-gradient(135deg, #faf5ff 0%, #e9d5ff 50%, #d8b4fe 100%)',
            text: '#581c87',
            accent: 'linear-gradient(135deg, #d8b4fe 0%, #c084fc 100%)',
            border: '#a855f7',
            hover: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)'
        }
    },
    {
        name: 'rose',
        displayName: '🌹 Hồng đỏ',
        colors: {
            primary: '#e11d48',
            secondary: '#be123c',
            background: 'linear-gradient(135deg, #fff1f2 0%, #fecdd3 50%, #fda4af 100%)',
            text: '#881337',
            accent: 'linear-gradient(135deg, #fda4af 0%, #fb7185 100%)',
            border: '#f43f5e',
            hover: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)'
        }
    }
];

// Helper function để lấy ghi chú theo duration
const getNotesForDuration = (duration: number): string => {
    if (duration === 8) {
        return "💳 Chuyển khoản trước • Không hỗ trợ kịch bản";
    } else if (duration >= 16) {
        return "📝 Hỗ trợ kịch bản • Nhận video ➜ Thanh toán";
    }
    return "";
};

// Helper function để lấy icon theo duration
const getIconForDuration = (duration: number): string => {
    if (duration === 8) return "⚡";
    if (duration <= 30) return "🎬";
    if (duration <= 60) return "📹";
    if (duration <= 90) return "🎭";
    return "🎪";
};

const PricingTable: React.FC<PricingTableProps> = ({ 
    pricingData, 
    loading = false, 
    error, 
    onThemeChange 
}) => {
    const [selectedTheme, setSelectedTheme] = useState<string>('ocean');
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    
    const currentTheme = themes.find(theme => theme.name === selectedTheme) || themes[0];
    
    const handleThemeChange = (themeName: string) => {
        setSelectedTheme(themeName);
        onThemeChange?.(themeName);
    };

    // CSS animations và styles cao cấp
    const styles = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
        @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            50% { box-shadow: 0 0 30px rgba(0,0,0,0.2), 0 0 40px currentColor; }
        }
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
        }
        .pricing-card {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            animation: fadeInUp 0.6s ease-out;
            position: relative;
            overflow: hidden;
        }
        .pricing-card:hover {
            transform: translateY(-12px) scale(1.03);
            box-shadow: 0 25px 50px rgba(0,0,0,0.2);
            z-index: 10;
        }
        .pricing-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
        }
        .pricing-card:hover::before {
            left: 100%;
        }
        .theme-selector {
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(15px);
            border: 2px solid rgba(255,255,255,0.3);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .theme-selector:hover {
            background: rgba(255,255,255,1);
            transform: scale(1.02) translateY(-2px);
            box-shadow: 0 12px 35px rgba(0,0,0,0.15);
        }
        .duration-badge {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        .duration-badge:hover {
            animation: pulse 1.5s infinite;
        }
        .price-text {
            background: linear-gradient(45deg, currentColor, currentColor);
            background-clip: text;
            -webkit-background-clip: text;
            transition: all 0.3s ease;
        }
        .notes-badge {
            animation: slideDown 0.5s ease-out;
            transition: all 0.3s ease;
        }
        .notes-badge:hover {
            transform: scale(1.05);
        }
        .header-title {
            animation: float 3s ease-in-out infinite;
        }
        .loading-container {
            animation: pulse 2s ease-in-out infinite;
        }
    `;

    if (loading) {
        return (
            <div 
                className="loading-container"
                style={{
                    background: currentTheme.colors.background,
                    padding: '60px 40px',
                    borderRadius: '24px',
                    textAlign: 'center',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
                    border: `2px solid ${currentTheme.colors.border}`
                }}
            >
                <style>{styles}</style>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <div style={{
                        position: 'relative',
                        display: 'inline-block'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            border: `4px solid ${currentTheme.colors.accent}`,
                            borderTop: `4px solid ${currentTheme.colors.primary}`,
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '20px'
                        }}>
                            💎
                        </div>
                    </div>
                    <div>
                        <p style={{
                            margin: 0,
                            color: currentTheme.colors.text,
                            fontSize: '18px',
                            fontWeight: '700',
                            marginBottom: '8px'
                        }}>
                            ✨ Đang tải bảng giá premium...
                        </p>
                        <p style={{
                            margin: 0,
                            color: currentTheme.colors.secondary,
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>
                            Chuẩn bị trải nghiệm tuyệt vời cho bạn 🚀
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                padding: '30px',
                borderRadius: '20px',
                textAlign: 'center',
                border: '2px solid #f87171',
                boxShadow: '0 10px 30px rgba(248, 113, 113, 0.3)'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>😢</div>
                <p style={{ 
                    color: '#dc2626', 
                    fontSize: '16px', 
                    margin: 0,
                    fontWeight: '500'
                }}>
                    Oops! {error}
                </p>
            </div>
        );
    }

    return (
        <div style={{
            background: currentTheme.colors.background,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            border: `2px solid ${currentTheme.colors.border}`,
            position: 'relative'
        }}>
            <style>{styles}</style>
            
            {/* Header với Theme Selector nâng cao */}
            <div style={{
                padding: '30px',
                background: currentTheme.colors.accent,
                borderBottom: `2px solid ${currentTheme.colors.border}`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    backgroundImage: `radial-gradient(circle at 20% 20%, ${currentTheme.colors.primary} 0%, transparent 20%), radial-gradient(circle at 80% 80%, ${currentTheme.colors.secondary} 0%, transparent 20%)`
                }}></div>
                
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div>
                        <h3 
                            className="header-title"
                            style={{
                                margin: 0,
                                fontSize: '32px',
                                fontWeight: '800',
                                color: currentTheme.colors.text,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '10px',
                                textShadow: `0 2px 4px ${currentTheme.colors.primary}20`
                            }}
                        >
                            💎 Bảng Giá Video Premium
                            <span style={{
                                background: currentTheme.colors.primary,
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '700',
                                padding: '6px 14px',
                                borderRadius: '25px',
                                boxShadow: `0 6px 20px ${currentTheme.colors.primary}40`,
                                animation: 'pulse 2s ease-in-out infinite'
                            }}>
                                {pricingData.length} mức giá
                            </span>
                        </h3>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            flexWrap: 'wrap'
                        }}>
                            <p style={{
                                margin: 0,
                                fontSize: '16px',
                                color: currentTheme.colors.secondary,
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                🎬 Chuyên nghiệp • 🚀 Nhanh chóng • ✨ Chất lượng cao
                            </p>
                        </div>
                        <div style={{
                            marginTop: '8px',
                            fontSize: '14px',
                            color: currentTheme.colors.secondary,
                            fontWeight: '500',
                            opacity: 0.8
                        }}>
                            📐 Từ 8-120 giây • 💰 Giá cả hợp lý • 🎯 Phù hợp mọi nhu cầu
                        </div>
                    </div>
                    
                    {/* Theme Selector nâng cao */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <span style={{
                            fontSize: '16px',
                            color: currentTheme.colors.text,
                            fontWeight: '600'
                        }}>
                            🎨 Chủ đề:
                        </span>
                        <select
                            value={selectedTheme}
                            onChange={(e) => handleThemeChange(e.target.value)}
                            className="theme-selector"
                            style={{
                                padding: '12px 16px',
                                borderRadius: '15px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: currentTheme.colors.text,
                                cursor: 'pointer',
                                outline: 'none',
                                minWidth: '150px'
                            }}
                        >
                            {themes.map(theme => (
                                <option key={theme.name} value={theme.name}>
                                    {theme.displayName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid Layout 3x5 với responsive */}
            <div style={{
                padding: '30px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                minHeight: '400px'
            }} 
            className="pricing-grid"
            >
                <style>{`
                    @media (min-width: 1200px) {
                        .pricing-grid {
                            grid-template-columns: repeat(5, 1fr) !important;
                            grid-template-rows: repeat(3, 1fr) !important;
                        }
                    }
                    @media (max-width: 1199px) and (min-width: 768px) {
                        .pricing-grid {
                            grid-template-columns: repeat(3, 1fr) !important;
                        }
                    }
                    @media (max-width: 767px) {
                        .pricing-grid {
                            grid-template-columns: repeat(2, 1fr) !important;
                            padding: 20px !important;
                            gap: 15px !important;
                        }
                    }
                    @media (max-width: 480px) {
                        .pricing-grid {
                            grid-template-columns: 1fr !important;
                            padding: 15px !important;
                        }
                    }
                `}</style>
                {pricingData.slice(0, 15).map((item, index) => (
                    <div
                        key={index}
                        className="pricing-card"
                        style={{
                            background: hoveredCard === index 
                                ? currentTheme.colors.hover 
                                : 'rgba(255,255,255,0.9)',
                            borderRadius: '16px',
                            padding: '20px',
                            textAlign: 'center',
                            border: `2px solid ${hoveredCard === index ? currentTheme.colors.primary : currentTheme.colors.border}`,
                            cursor: 'pointer',
                            backdropFilter: 'blur(10px)',
                            animationDelay: `${index * 0.1}s`,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={() => setHoveredCard(index)}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        {/* Background pattern cho từng card */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: hoveredCard === index ? 0.1 : 0.05,
                            background: `radial-gradient(circle at center, ${currentTheme.colors.primary} 0%, transparent 70%)`,
                            transition: 'opacity 0.3s ease'
                        }}></div>
                        
                        {/* Duration Badge với icon động */}
                        <div 
                            className="duration-badge"
                            style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                background: currentTheme.colors.accent,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                border: `3px solid ${currentTheme.colors.primary}`,
                                position: 'relative',
                                zIndex: 1,
                                boxShadow: hoveredCard === index 
                                    ? `0 8px 25px ${currentTheme.colors.primary}40` 
                                    : '0 4px 15px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{
                                fontSize: '18px',
                                marginBottom: '2px'
                            }}>
                                {getIconForDuration(item.duration)}
                            </div>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '700',
                                color: currentTheme.colors.primary
                            }}>
                                {item.duration}s
                            </span>
                        </div>

                        {/* Duration Label với icon */}
                        <div style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: currentTheme.colors.text,
                            marginBottom: '12px',
                            position: 'relative',
                            zIndex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}>
                            ⏱️ {item.duration} giây
                        </div>

                        {/* Price với gradient effect */}
                        <div 
                            className="price-text"
                            style={{
                                fontSize: '22px',
                                fontWeight: '800',
                                color: currentTheme.colors.primary,
                                marginBottom: '12px',
                                position: 'relative',
                                zIndex: 1,
                                textShadow: hoveredCard === index 
                                    ? `0 2px 8px ${currentTheme.colors.primary}30` 
                                    : 'none'
                            }}
                        >
                            {formatCurrency(item.roundedPrice)}
                        </div>

                        {/* Notes Badge thay thế price increase */}
                        {getNotesForDuration(item.duration) && (
                            <div 
                                className="notes-badge"
                                style={{
                                    background: item.duration === 8 
                                        ? 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)'
                                        : currentTheme.colors.accent,
                                    color: item.duration === 8 
                                        ? '#92400e' 
                                        : currentTheme.colors.text,
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    position: 'relative',
                                    zIndex: 1,
                                    textAlign: 'center',
                                    lineHeight: '1.3',
                                    border: `1px solid ${item.duration === 8 ? '#f59e0b' : currentTheme.colors.border}`,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            >
                                {getNotesForDuration(item.duration)}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer cao cấp với gradient */}
            <div style={{
                padding: '30px',
                background: currentTheme.colors.accent,
                borderTop: `2px solid ${currentTheme.colors.border}`,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background decoration */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.05,
                    backgroundImage: `radial-gradient(circle at 30% 30%, ${currentTheme.colors.primary} 0%, transparent 30%), radial-gradient(circle at 70% 70%, ${currentTheme.colors.secondary} 0%, transparent 30%)`
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '20px',
                        marginBottom: '12px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            color: currentTheme.colors.text,
                            fontWeight: '600'
                        }}>
                            ⚡ Giao hàng nhanh
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            color: currentTheme.colors.text,
                            fontWeight: '600'
                        }}>
                            🎯 Chất lượng cao
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            color: currentTheme.colors.text,
                            fontWeight: '600'
                        }}>
                            💰 Giá cả hợp lý
                        </div>
                    </div>
                    
                    <div style={{
                        padding: '12px 20px',
                        background: `linear-gradient(135deg, ${currentTheme.colors.primary}15, ${currentTheme.colors.secondary}15)`,
                        borderRadius: '15px',
                        border: `1px solid ${currentTheme.colors.border}`,
                        display: 'inline-block'
                    }}>
                        <div style={{
                            fontSize: '16px',
                            color: currentTheme.colors.text,
                            fontWeight: '700',
                            marginBottom: '4px'
                        }}>
                            🎬 Liên hệ ngay để được tư vấn!
                        </div>
                        <div style={{
                            fontSize: '13px',
                            color: currentTheme.colors.secondary,
                            fontWeight: '500'
                        }}>
                            Chúng tôi sẽ giúp bạn chọn gói phù hợp nhất
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingTable;