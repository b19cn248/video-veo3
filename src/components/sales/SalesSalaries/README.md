# Sales Salaries Component

## Tổng quan

Component `SalesSalaries` hiển thị bảng lương sales với tính năng lọc theo ngày và chỉ dành cho Admin.

## Cấu trúc thư mục

```
src/components/sales/SalesSalaries/
├── SalesSalaries.tsx           # Component chính
├── components/
│   ├── DateSelector.tsx        # Component chọn ngày
│   └── SalesDateStatus.tsx     # Component hiển thị status ngày
├── hooks/
│   └── useSalesSalariesWithDate.ts  # Custom hook quản lý logic
└── index.ts                    # Export file
```

## Features

- ✅ **Admin Only Access**: Chỉ admin có quyền truy cập
- ✅ **Date Filtering**: Lọc theo ngày với date picker
- ✅ **Search & Sort**: Tìm kiếm và sắp xếp theo multiple criteria  
- ✅ **Responsive Design**: Tương thích mobile và desktop
- ✅ **Real-time Data**: Load data theo real-time từ API
- ✅ **Commission Calculation**: Tính hoa hồng 12% tự động

## Data Structure

### SalesSalary Interface
```typescript
interface SalesSalary {
    salesName: string;          // Tên sales person
    salaryDate: string;         // Ngày tính lương (yyyy-MM-dd)
    totalPaidVideos: number;    // Tổng video đã thanh toán
    totalSalesValue: number;    // Tổng giá trị doanh số
    commissionSalary: number;   // Hoa hồng (12%)
    commissionRate: number;     // Tỷ lệ hoa hồng
}
```

## API Integration

### Endpoint
```
GET /api/v1/videos/sales-salaries?currentDate=2025-06-13
```

### Response Format
```json
{
  "success": true,
  "data": [...],
  "summary": {
    "totalSalesPersons": 3,
    "totalCommission": 150000,
    "totalSalesValue": 1250000,
    "totalPaidVideos": 15,
    "commissionRate": "12%",
    "calculationDate": "2025-06-13"
  }
}
```

## Usage

### In App.tsx
```tsx
// Import
import SalesSalaries from './components/sales/SalesSalaries/SalesSalaries';

// Route with Admin protection
<Route
    path="/sales-salaries"
    element={
        <ProtectedRoute requiredRoles={['admin']}>
            <SalesSalaries />
        </ProtectedRoute>
    }
/>
```

### Navigation (Admin only)
```tsx
{user?.roles && user.roles.some(role => role.toLowerCase().includes('admin')) && (
    <a href="/sales-salaries">💼 Lương Sales</a>
)}
```

## Architecture

### Custom Hook Pattern
- `useSalesSalariesWithDate`: Quản lý state và business logic
- Tách biệt UI khỏi logic để dễ maintain và test

### Component Composition
- `SalesSalaries`: Main container component
- `DateSelector`: Reusable date picker
- `SalesDateStatus`: Date overview display

### Performance Optimizations
- `useMemo` for filtered/sorted data
- `useCallback` for event handlers
- Constructor expression trong JPQL queries

## UI/UX Features

### Dashboard-style Layout
- Summary cards với metrics chính
- Date status banner với gradient
- Responsive table với horizontal scroll

### Interactive Elements
- Hover effects trên table rows
- Sortable columns với visual indicators
- Real-time search filtering
- Loading states với spinners

### Visual Hierarchy
- Color-coded commission levels
- Typography scaling
- Icon usage để improve readability

## Security

### Role-based Access Control
```tsx
<ProtectedRoute requiredRoles={['admin']}>
    <SalesSalaries />
</ProtectedRoute>
```

### API Security
- Bearer token authentication
- Tenant-based data isolation
- Error handling để avoid data leaks

## Performance Considerations

### Frontend Optimizations
- Debounced search input
- Memoized calculations
- Efficient re-renders

### Backend Optimizations  
- JPQL constructor expressions
- Indexed database queries
- Cached calculations

## Maintenance

### Code Organization
- Single Responsibility Principle
- Clean component separation
- Consistent naming conventions

### Error Handling
- User-friendly error messages
- Graceful fallbacks
- Comprehensive logging

### Extensibility
- Modular architecture
- Configurable commission rates
- Pluggable sorting/filtering

## Testing Considerations

### Unit Tests
- Custom hook logic
- Formatter functions
- Component rendering

### Integration Tests
- API integration
- Role-based access
- User interactions

### E2E Tests
- Complete user workflows
- Cross-browser compatibility
- Responsive behavior