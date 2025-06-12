# Error Handling System - Video Management App

## Tổng quan

Hệ thống xử lý lỗi đã được cập nhật để trích xuất và hiển thị message lỗi từ API response thay vì sử dụng message chung chung. Điều này giúp cung cấp thông tin lỗi cụ thể và hữu ích hơn cho người dùng.

## Kiến trúc Error Handling

### 1. Error Utils (`src/utils/errorUtils.ts`)

Cung cấp các utility functions để xử lý lỗi:

- **`extractErrorMessage(error, fallbackMessage)`**: Trích xuất message lỗi từ API response
- **`createOperationErrorMessage(operation, resource, error)`**: Tạo message lỗi cho các thao tác CRUD
- **`extractValidationErrors(error)`**: Xử lý validation errors từ backend
- **`isAuthenticationError(error)`**: Kiểm tra lỗi authentication
- **`isNetworkError(error)`**: Kiểm tra lỗi network

### 2. Global Error Handler (`src/utils/globalErrorHandler.ts`)

Xử lý lỗi ở level ứng dụng:

- **`GlobalErrorHandler.handleApiError()`**: Xử lý lỗi API và hiển thị toast
- **`GlobalErrorHandler.handleNetworkError()`**: Xử lý lỗi network
- **`GlobalErrorHandler.logError()`**: Log lỗi cho debugging
- **`withErrorHandling()`**: HOF để wrap async functions
- **`useErrorHandler()`**: Hook-like function cho React components

### 3. ErrorDisplay Component (`src/components/common/ErrorDisplay/`)

Component để hiển thị lỗi một cách nhất quán:

```jsx
<ErrorDisplay 
    message={errorMessage}
    type="error"
    showIcon={true}
    dismissible={true}
    onDismiss={() => setError(null)}
/>
```

## Cách sử dụng

### 1. Trong Service Layer

```typescript
// VideoService.ts
try {
    const response = await apiClient.get('/videos');
    return response.data;
} catch (error) {
    console.error('Error fetching videos:', error);
    const errorMessage = createOperationErrorMessage('fetch', 'danh sách video', error);
    throw new Error(errorMessage);
}
```

### 2. Trong React Components

```typescript
// Trong hooks hoặc components
import { extractErrorMessage } from '../../../utils/errorUtils';

try {
    const response = await VideoService.getVideos();
    // Handle success
} catch (err) {
    const errorMessage = extractErrorMessage(err, 'Lỗi khi tải video');
    setError(errorMessage);
}
```

### 3. Sử dụng Global Error Handler

```typescript
import { useErrorHandler } from '../../../utils/globalErrorHandler';

const MyComponent = () => {
    const { handleError, withErrorHandling } = useErrorHandler(showToast);
    
    const loadData = withErrorHandling(async () => {
        const data = await VideoService.getVideos();
        return data;
    }, 'tải danh sách video');
};
```

## Format API Response lỗi

Hệ thống được thiết kế để xử lý API response lỗi có format:

```json
{
    "data": null,
    "success": false,
    "tenantId": "video_management",
    "message": "Có 2 đơn cần sửa gấp, không thể nhận đơn",
    "error": "Bad Request",
    "timestamp": 1749740674667,
    "status": 400
}
```

## Hierarchy xử lý lỗi

1. **API message** - Ưu tiên cao nhất từ `response.data.message`
2. **HTTP status message** - Message tương ứng với HTTP status code
3. **Network error** - Message cho lỗi kết nối
4. **Fallback message** - Message mặc định nếu không extract được

## Các thay đổi đã thực hiện

### 1. Services
- ✅ **VideoService.ts**: Cập nhật tất cả catch blocks để sử dụng `createOperationErrorMessage()`
- ✅ **AuthService.ts**: Giữ nguyên (đã ổn)

### 2. Components
- ✅ **VideoList**: Cập nhật hook `useVideoList` để sử dụng `extractErrorMessage()`
- ✅ **VideoItem**: Cập nhật tất cả error handlers để sử dụng `extractErrorMessage()`
- ✅ **VideoDetail**: Cập nhật error handling và sử dụng `ErrorDisplay` component
- ✅ **StaffSalaries**: Cập nhật error handling và sử dụng `ErrorDisplay` component

### 3. Hooks
- ✅ **useVideoList**: Cập nhật để extract error message từ API response
- ✅ **useVideoFilters**: Cập nhật error handling
- ✅ **useStaffSalariesWithDate**: Cập nhật error handling

### 4. UI Components
- ✅ **ErrorDisplay**: Component mới để hiển thị lỗi nhất quán
- ✅ Cập nhật tất cả nơi hiển thị lỗi để sử dụng `ErrorDisplay`

## Testing

Để test error handling:

1. **Network errors**: Tắt internet và thực hiện API calls
2. **API errors**: Mock API responses với status codes khác nhau
3. **Validation errors**: Gửi data không hợp lệ
4. **Authentication errors**: Sử dụng token không hợp lệ

## Best Practices

1. **Luôn sử dụng** `extractErrorMessage()` khi xử lý errors từ API
2. **Log errors** với đầy đủ context để debugging
3. **Hiển thị user-friendly messages** thay vì technical errors
4. **Sử dụng ErrorDisplay component** để đồng nhất UI
5. **Handle edge cases** như network errors, timeouts

## Monitoring và Debugging

- Tất cả errors được log với `GlobalErrorHandler.logError()`
- Console logs chứa đầy đủ thông tin error context
- Có thể tích hợp với monitoring services (Sentry, LogRocket, etc.)

## Migration Guide

Nếu cần cập nhật thêm components:

1. Import `extractErrorMessage` từ `utils/errorUtils`
2. Thay thế hard-coded error messages bằng `extractErrorMessage(error, fallbackMessage)`
3. Sử dụng `ErrorDisplay` component thay vì custom error UI
4. Wrap async operations với `withErrorHandling()` nếu cần
