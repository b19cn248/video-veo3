import React from 'react';

interface DurationSelectorProps {
    value: number;                           // Giá trị hiện tại (tính bằng giây)
    onChange: (value: number) => void;       // Callback khi thay đổi giá trị
    disabled?: boolean;                      // Có disable component không
    min?: number;                           // Giá trị tối thiểu (mặc định: 8s)
    max?: number;                           // Giá trị tối đa (mặc định: 120s)
    step?: number;                          // Bước nhảy (mặc định: 8s)
}

const DurationSelector: React.FC<DurationSelectorProps> = ({
    value,
    onChange,
    disabled = false,
    min = 8,
    max = 120,
    step = 8
}) => {
    // Hàm xử lý tăng thời lượng
    const handleIncrement = () => {
        if (!disabled && value < max) {
            const newValue = Math.min(value + step, max);
            onChange(newValue);
        }
    };

    // Hàm xử lý giảm thời lượng
    const handleDecrement = () => {
        if (!disabled && value > min) {
            const newValue = Math.max(value - step, min);
            onChange(newValue);
        }
    };

    // Kiểm tra có thể tăng/giảm không
    const canIncrement = !disabled && value < max;
    const canDecrement = !disabled && value > min;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '2px solid #e1e5e9',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white',
            transition: 'border-color 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            {/* Nút giảm (-) */}
            <button
                type="button"
                onClick={handleDecrement}
                disabled={!canDecrement}
                style={{
                    width: '44px',
                    height: '44px',
                    border: 'none',
                    backgroundColor: canDecrement ? '#f8f9fa' : '#e9ecef',
                    color: canDecrement ? '#495057' : '#adb5bd',
                    cursor: canDecrement ? 'pointer' : 'not-allowed',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    borderRight: '1px solid #e1e5e9'
                }}
                onMouseEnter={(e) => {
                    if (canDecrement) {
                        e.currentTarget.style.backgroundColor = '#e9ecef';
                    }
                }}
                onMouseLeave={(e) => {
                    if (canDecrement) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }
                }}
            >
                −
            </button>

            {/* Input hiển thị giá trị (không thể chỉnh sửa) */}
            <input
                type="text"
                value={`${value}s`}
                readOnly
                style={{
                    flex: 1,
                    height: '44px',
                    border: 'none',
                    textAlign: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: disabled ? '#adb5bd' : '#495057',
                    backgroundColor: 'white',
                    outline: 'none',
                    cursor: 'default',
                    userSelect: 'none'
                }}
                disabled={disabled}
            />

            {/* Nút tăng (+) */}
            <button
                type="button"
                onClick={handleIncrement}
                disabled={!canIncrement}
                style={{
                    width: '44px',
                    height: '44px',
                    border: 'none',
                    backgroundColor: canIncrement ? '#f8f9fa' : '#e9ecef',
                    color: canIncrement ? '#495057' : '#adb5bd',
                    cursor: canIncrement ? 'pointer' : 'not-allowed',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    borderLeft: '1px solid #e1e5e9'
                }}
                onMouseEnter={(e) => {
                    if (canIncrement) {
                        e.currentTarget.style.backgroundColor = '#e9ecef';
                    }
                }}
                onMouseLeave={(e) => {
                    if (canIncrement) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }
                }}
            >
                +
            </button>
        </div>
    );
};

export default DurationSelector;