// Component phân trang
// Nhận thông tin về trang hiện tại và tổng số trang

import React from 'react';

interface PaginationProps {
    currentPage: number;               // Trang hiện tại (bắt đầu từ 0)
    totalPages: number;               // Tổng số trang
    onPageChange: (page: number) => void; // Hàm gọi khi đổi trang
    hasNext: boolean;                 // Có trang tiếp theo không
    hasPrevious: boolean;             // Có trang trước không
}

const Pagination: React.FC<PaginationProps> = ({
                                                   currentPage,
                                                   totalPages,
                                                   onPageChange,
                                                   hasNext,
                                                   hasPrevious
                                               }) => {
    // Tạo array các số trang để hiển thị
    const getPageNumbers = () => {
        const pages = [];
        const startPage = Math.max(0, currentPage - 2);
        const endPage = Math.min(totalPages - 1, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            {/* Nút Previous */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevious}
            >
                « Trước
            </button>

            {/* Các số trang */}
            {getPageNumbers().map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={currentPage === page ? 'active' : ''}
                >
                    {page + 1}
                </button>
            ))}

            {/* Nút Next */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNext}
            >
                Sau »
            </button>
        </div>
    );
};

export default Pagination;