// Shared constants cho page options
// Được sử dụng trong VideoForm và AdvancedFilterBar

export interface PageOption {
    value: string;
    label: string;
}

// Các options tên page để đăng video (sắp xếp theo thứ tự từ 1-7)
export const PAGE_OPTIONS: PageOption[] = [
    { value: 'page1', label: 'Page 1 - Cheap Google Account' },
    { value: 'page2', label: 'Page 2 - Video AI Veo3 Google' },
    { value: 'page3', label: 'Page 3 - Video AI Quảng Cáo Số' },
    { value: 'page4', label: 'Page 4 - Visage Media' },
    { value: 'page5', label: 'Page 5 - Truyền Thông Số 4.0' },
    { value: 'page6', label: 'Page 6 - OPEN LEARN HUB' },
    { value: 'page7', label: 'Page 7 - AI Video Studio' }
];

// Helper function để convert short value (page1) sang full name (Page 1 - Cheap Google Account)
export const getPageFullName = (pageValue: string): string => {
    if (!pageValue) return pageValue;
    const page = PAGE_OPTIONS.find(option => option.value === pageValue);
    return page ? page.label : pageValue;
};

// Helper function để convert full name ngược lại thành short value cho form display
export const getPageShortValue = (fullName: string): string => {
    if (!fullName) return '';
    const page = PAGE_OPTIONS.find(option => option.label === fullName);
    return page ? page.value : '';
};