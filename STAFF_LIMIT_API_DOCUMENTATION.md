# Staff Limit Management API Documentation

## Tổng quan
Hệ thống quản lý giới hạn nhân viên cho phép ADMIN thiết lập và quản lý các giới hạn thời gian mà nhân viên không được phép nhận đơn hàng mới.

## Base URL
```
/api/v1/videos
```

## Authentication & Authorization
- **Tất cả API**: Yêu cầu JWT token trong header
- **Admin-only APIs**: Chỉ user có role ADMIN mới được phép gọi
- **Header format**: `Authorization: Bearer <jwt_token>`

---

## 📋 Danh sách APIs

### 1. **Thiết lập giới hạn nhân viên** (ADMIN ONLY)
Tạo giới hạn mới hoặc cập nhật giới hạn hiện tại cho nhân viên.

#### **POST** `/staff-limit`

**Parameters:**
- `staffName` (string, required): Tên nhân viên cần giới hạn
- `lockDays` (integer, required): Số ngày khóa (1-30)

**Request Example:**
```bash
POST /api/v1/videos/staff-limit?staffName=NguyenVanA&lockDays=7
Authorization: Bearer <admin_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã thiết lập giới hạn cho nhân viên 'NguyenVanA' trong 7 ngày",
  "data": {
    "staffName": "NguyenVanA",
    "lockDays": 7,
    "startDate": "2025-06-18T10:30:00",
    "endDate": "2025-06-25T10:30:00",
    "remainingDays": 7,
    "createdBy": "admin_user"
  },
  "timestamp": 1718702400000,
  "tenantId": "tenant_001"
}
```

**Error Responses:**
```json
// 400 - Invalid parameters
{
  "success": false,
  "message": "Số ngày khóa phải lớn hơn 0",
  "data": null,
  "timestamp": 1718702400000,
  "status": 400,
  "error": "Bad Request",
  "tenantId": "tenant_001"
}

// 403 - Not admin
{
  "success": false,
  "message": "Chỉ admin mới có quyền thiết lập giới hạn nhân viên",
  "data": null,
  "timestamp": 1718702400000,
  "status": 403,
  "error": "Forbidden",
  "tenantId": "tenant_001"
}
```

---

### 2. **Hủy giới hạn nhân viên** (ADMIN ONLY)
Hủy giới hạn hiện tại của nhân viên trước thời hạn.

#### **DELETE** `/staff-limit`

**Parameters:**
- `staffName` (string, required): Tên nhân viên cần hủy giới hạn

**Request Example:**
```bash
DELETE /api/v1/videos/staff-limit?staffName=NguyenVanA
Authorization: Bearer <admin_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đã hủy giới hạn cho nhân viên 'NguyenVanA'",
  "data": {
    "staffName": "NguyenVanA",
    "action": "LIMIT_REMOVED"
  },
  "timestamp": 1718702400000,
  "tenantId": "tenant_001"
}
```

**Error Responses:**
```json
// 400 - No active limit
{
  "success": false,
  "message": "Nhân viên 'NguyenVanA' hiện không có giới hạn nào",
  "data": null,
  "timestamp": 1718702400000,
  "status": 400,
  "error": "Bad Request",
  "tenantId": "tenant_001"
}
```

---

### 3. **Lấy danh sách giới hạn đang active**
Hiển thị tất cả nhân viên đang bị giới hạn.

#### **GET** `/staff-limits`

**Request Example:**
```bash
GET /api/v1/videos/staff-limits
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách giới hạn nhân viên thành công - 2 giới hạn đang có hiệu lực",
  "data": [
    {
      "id": 1,
      "staffName": "NguyenVanA",
      "startDate": "2025-06-18T10:30:00",
      "endDate": "2025-06-25T10:30:00",
      "remainingDays": 7,
      "createdBy": "admin_user",
      "createdAt": "2025-06-18T10:30:00",
      "isCurrentlyActive": true
    },
    {
      "id": 2,
      "staffName": "TranThiB",
      "startDate": "2025-06-17T14:20:00",
      "endDate": "2025-06-20T14:20:00",
      "remainingDays": 2,
      "createdBy": "admin_user",
      "createdAt": "2025-06-17T14:20:00",
      "isCurrentlyActive": true
    }
  ],
  "total": 2,
  "timestamp": 1718702400000,
  "tenantId": "tenant_001"
}
```

---

### 4. **Kiểm tra nhân viên có bị giới hạn không**
Kiểm tra trạng thái giới hạn của một nhân viên cụ thể.

#### **GET** `/staff-limit/check`

**Parameters:**
- `staffName` (string, required): Tên nhân viên cần kiểm tra

**Request Example:**
```bash
GET /api/v1/videos/staff-limit/check?staffName=NguyenVanA
Authorization: Bearer <jwt_token>
```

**Success Response (200) - Bị giới hạn:**
```json
{
  "success": true,
  "message": "Nhân viên 'NguyenVanA' hiện đang bị giới hạn",
  "data": {
    "staffName": "NguyenVanA",
    "isLimited": true,
    "canReceiveNewOrders": false
  },
  "timestamp": 1718702400000,
  "tenantId": "tenant_001"
}
```

**Success Response (200) - Không bị giới hạn:**
```json
{
  "success": true,
  "message": "Nhân viên 'NguyenVanA' không bị giới hạn",
  "data": {
    "staffName": "NguyenVanA",
    "isLimited": false,
    "canReceiveNewOrders": true
  },
  "timestamp": 1718702400000,
  "tenantId": "tenant_001"
}
```

---

## 🎨 Frontend Implementation Guidelines

### 1. **Staff Limit Management Page (Admin Only)**

#### **Required Components:**

**A. Staff Limit Creation Form**
```jsx
// Form fields needed:
- staffName: Select dropdown from active staff list
- lockDays: Number input (1-30, with validation)
- Submit button (calls POST /staff-limit)
- Cancel button
```

**B. Active Limits Table**
```jsx
// Table columns:
- Staff Name
- Start Date (format: DD/MM/YYYY HH:mm)
- End Date (format: DD/MM/YYYY HH:mm) 
- Remaining Days (calculated, highlight if < 2 days)
- Created By
- Actions (Remove button for admin)
```

**C. Staff Status Checker**
```jsx
// Quick check component:
- Staff name input/select
- Check button (calls GET /staff-limit/check)
- Status display (Limited/Available with colors)
```

#### **Recommended UI Flow:**

1. **Page Load:**
   ```javascript
   // Load active limits on page load
   fetch('/api/v1/videos/staff-limits')
     .then(response => response.json())
     .then(data => setActiveLimits(data.data));
   ```

2. **Create New Limit:**
   ```javascript
   const createLimit = async (staffName, lockDays) => {
     try {
       const response = await fetch(`/api/v1/videos/staff-limit?staffName=${staffName}&lockDays=${lockDays}`, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${token}`
         }
       });
       
       if (response.ok) {
         showSuccessMessage('Giới hạn đã được tạo thành công');
         refreshLimitsList();
       } else {
         const error = await response.json();
         showErrorMessage(error.message);
       }
     } catch (error) {
       showErrorMessage('Có lỗi xảy ra khi tạo giới hạn');
     }
   };
   ```

3. **Remove Limit:**
   ```javascript
   const removeLimit = async (staffName) => {
     if (confirm(`Bạn có chắc muốn hủy giới hạn cho nhân viên ${staffName}?`)) {
       try {
         const response = await fetch(`/api/v1/videos/staff-limit?staffName=${staffName}`, {
           method: 'DELETE',
           headers: {
             'Authorization': `Bearer ${token}`
           }
         });
         
         if (response.ok) {
           showSuccessMessage('Giới hạn đã được hủy');
           refreshLimitsList();
         }
       } catch (error) {
         showErrorMessage('Có lỗi xảy ra khi hủy giới hạn');
       }
     }
   };
   ```

### 2. **Video Assignment Integration**

Khi assign video cho nhân viên, cần check limit trước:

```javascript
const checkStaffBeforeAssign = async (staffName) => {
  try {
    const response = await fetch(`/api/v1/videos/staff-limit/check?staffName=${staffName}`);
    const result = await response.json();
    
    if (result.data.isLimited) {
      showWarningMessage(`Nhân viên ${staffName} hiện đang bị giới hạn không thể nhận đơn mới`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking staff limit:', error);
    return true; // Allow assignment if check fails
  }
};

// Usage in assignment flow
const assignVideo = async (videoId, staffName) => {
  const canAssign = await checkStaffBeforeAssign(staffName);
  
  if (!canAssign) {
    return;
  }
  
  // Proceed with normal assignment
  // ...existing assignment logic
};
```

---

## 📱 UI/UX Recommendations

### **Colors & Status Indicators:**
- 🔴 **Limited**: Red badge/background
- 🟢 **Available**: Green badge/background  
- 🟡 **Expiring Soon** (<2 days): Yellow badge/background

### **Form Validations:**
- Staff name: Required, must exist in system
- Lock days: Required, number between 1-30
- Real-time validation with error messages

### **User Experience:**
- Auto-refresh limits list every 30 seconds
- Confirmation dialogs for destructive actions
- Loading states for all API calls
- Toast notifications for success/error messages
- Responsive design for mobile devices

### **Permissions:**
- Hide admin-only features for non-admin users
- Show read-only view for regular users
- Clear admin badges/indicators

---

## 🔧 Error Handling

### **Common Error Scenarios:**
1. **Network errors**: Show retry button
2. **Authorization errors**: Redirect to login
3. **Validation errors**: Highlight problematic fields
4. **Server errors**: Show generic error message

### **Error Response Format:**
All error responses follow this structure:
```json
{
  "success": false,
  "message": "Human readable error message",
  "data": null,
  "timestamp": 1718702400000,
  "status": 400,
  "error": "HTTP status text",
  "tenantId": "tenant_001"
}
```

---

## 📊 Business Rules

1. **Giới hạn tối đa**: 30 ngày
2. **Giới hạn tối thiểu**: 1 ngày
3. **Đồng thời**: Mỗi nhân viên chỉ có 1 giới hạn active
4. **Ghi đè**: Tạo giới hạn mới sẽ hủy giới hạn cũ
5. **Tự động hết hạn**: Giới hạn tự động hết hiệu lực sau ngày kết thúc
6. **Ảnh hưởng**: Nhân viên bị giới hạn không thể nhận video mới

---

## 🧪 Testing Scenarios

### **Manual Testing Checklist:**
- [ ] Tạo giới hạn với các giá trị hợp lệ (1-30 ngày)
- [ ] Tạo giới hạn với giá trị không hợp lệ (0, 31, âm)
- [ ] Hủy giới hạn đang active
- [ ] Hủy giới hạn không tồn tại
- [ ] Kiểm tra nhân viên bị giới hạn
- [ ] Kiểm tra nhân viên không bị giới hạn
- [ ] Thử assign video cho nhân viên bị giới hạn
- [ ] Test với non-admin user (should fail)
- [ ] Test auto-expiry sau ngày kết thúc

### **API Testing with Postman:**
```javascript
// Environment variables needed:
- base_url: http://localhost:8080/api/v1/videos
- admin_token: <your_admin_jwt_token>
- regular_token: <your_regular_jwt_token>
- staff_name: NguyenVanA
```
