# CancelVideoButton Component

## Tổng quan
Component button để admin hủy video - reset video về trạng thái "Chưa ai nhận" và xóa assignedStaff.

## Tính năng
- ✅ **Admin Only**: Chỉ hiển thị cho admin (checked via `useIsAdmin()`)
- ✅ **Smart Enable/Disable**: Chỉ enable khi video đã được assigned
- ✅ **Confirmation Dialog**: Hiển thị dialog xác nhận trước khi hủy
- ✅ **Loading States**: Hiển thị trạng thái loading khi đang xử lý
- ✅ **Toast Notifications**: Thông báo thành công/thất bại
- ✅ **Optimistic Updates**: Cập nhật UI ngay lập tức khi thành công
- ✅ **Responsive Design**: Hỗ trợ 3 sizes: small, medium, large

## Props Interface
```typescript
interface CancelVideoButtonProps {
    video: Video;                                    // Video object cần hủy
    onVideoUpdate?: (updatedVideo: Video) => void;  // Callback khi video được update
    size?: 'small' | 'medium' | 'large';           // Kích thước button (default: small)
    style?: React.CSSProperties;                    // Custom styles
}
```

## Usage Examples

### Trong VideoItem (hiện tại)
```tsx
<CancelVideoButton
    video={video}
    onVideoUpdate={onVideoUpdate}
    size="small"
/>
```

### Trong VideoDetail (có thể thêm sau)
```tsx
<CancelVideoButton
    video={video}
    onVideoUpdate={handleVideoUpdate}
    size="medium"
    style={{ marginTop: '10px' }}
/>
```

## Business Logic

### Điều kiện hiển thị:
1. User phải có role admin (`useIsAdmin()` returns true)
2. Component sẽ return `null` nếu không phải admin

### Điều kiện enable/disable:
```typescript
const canCancel = video.assignedStaff && video.assignedStaff.trim() !== '';
```
- **Enable**: Khi video đã được assign cho ai đó
- **Disable**: Khi video chưa có assignedStaff

### Confirmation Dialog:
- Hiển thị thông tin video (ID, customer name, assigned staff)
- Warning message về việc reset video
- 2 buttons: "Hủy bỏ" và "Xác nhận hủy"

## API Integration

### Endpoint: 
```
POST /api/v1/videos/{id}/cancel
```

### Service Method:
```typescript
static async cancelVideo(id: number): Promise<ApiResponse<Video>> {
    const response = await apiClient.post(`/videos/${id}/cancel`);
    return response.data;
}
```

### Response Format:
```typescript
{
    success: boolean;
    message: string;
    data: Video;     // Updated video với assignedStaff=null, status=CHUA_AI_NHAN
    timestamp: number;
}
```

## Security

### Frontend Security:
- Component không hiển thị nếu không phải admin
- Button disabled nếu video chưa được assign

### Backend Security:
- API endpoint kiểm tra JWT token
- Server-side validation role admin từ token
- Trả về 403 Forbidden nếu không phải admin

## UI/UX Design

### Button States:
- **Normal**: Red background (#dc2626) với icon 🚫
- **Hover**: Darker red (#b91c1c) với slight transform
- **Disabled**: Gray background (#9ca3af) với opacity 0.6
- **Loading**: Spinner animation với text "Đang hủy..."

### Confirmation Dialog:
- Modal overlay với backdrop
- Clear warning message
- Video information display
- Action buttons với proper colors
- Loading state trong dialog

### Toast Notifications:
- Success: Green background với checkmark
- Error: Red background với error message
- Auto-dismiss sau 4 giây
- Positioned top-right

## Size Configurations

### Small (default):
```css
padding: 4px 8px;
fontSize: 11px;
minWidth: 40px;
height: 28px;
```

### Medium:
```css
padding: 6px 12px;
fontSize: 13px;
minWidth: 80px;
height: 32px;
```

### Large:
```css
padding: 8px 16px;
fontSize: 14px;
minWidth: 100px;
height: 36px;
```

## Error Handling

### Frontend Errors:
- Network errors
- API response errors
- Validation errors
- Timeout errors

### User Feedback:
- Toast notifications với clear error messages
- Console logging để debugging
- Graceful fallback UI states

## Testing Considerations

### Manual Testing:
1. **Admin Role Test**: Verify button chỉ hiển thị cho admin
2. **Enable/Disable Test**: Verify button logic với different video states
3. **Confirmation Dialog**: Test dialog flow
4. **API Integration**: Test với real API endpoint
5. **Error Scenarios**: Test với network failures, 403 errors, etc.

### Edge Cases:
- Video đã ở trạng thái CHUA_AI_NHAN
- Video đang được process bởi user khác
- Network connectivity issues
- JWT token expiration during operation

## Performance Considerations

### Optimizations:
- Component chỉ render khi cần thiết (admin only)
- Debounced API calls (built-in với user interaction)
- Optimistic UI updates
- Minimal re-renders với proper state management

### Memory Management:
- Cleanup toast notifications
- Proper dialog state management
- No memory leaks với timeouts

## Integration Points

### Current Integration:
- `VideoItem` component trong action buttons
- Part của video table row actions

### Future Integration Possibilities:
- `VideoDetail` page để cancel từ detail view
- Bulk operations để cancel multiple videos
- Admin dashboard với video management

## Accessibility

### Features:
- Proper button titles/tooltips
- Keyboard navigation ready
- Screen reader compatible
- Color contrast compliant
- Focus management trong dialog

## Code Quality

### Clean Code Principles:
- Single Responsibility: Chỉ handle cancel video logic
- Separation of Concerns: UI, API, state management tách biệt
- Reusable: Component có thể dùng ở nhiều nơi
- Maintainable: Clear structure, good documentation
- Testable: Logic tách biệt, dependencies injectable

### TypeScript:
- Full type safety
- Proper interfaces
- Type inference
- Error handling với types

## Deployment Notes

### Compatibility:
- React 18+
- TypeScript 4.5+
- Modern browsers với ES6+ support

### Bundle Impact:
- Small component footprint
- No external dependencies
- Efficient rendering

## Changelog

### v1.6.0 (Current)
- ✅ Initial implementation
- ✅ Admin-only functionality  
- ✅ Confirmation dialog
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Full TypeScript support
- ✅ Integration với VideoItem