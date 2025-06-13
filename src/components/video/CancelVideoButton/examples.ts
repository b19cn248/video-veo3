/**
 * CancelVideoButton Usage Examples
 * 
 * File này cung cấp các ví dụ sử dụng CancelVideoButton component
 * Không phải là test file thực tế - chỉ để reference
 */

/*
// Example 1: Basic usage trong VideoItem
import CancelVideoButton from '../CancelVideoButton';

<CancelVideoButton
    video={video}
    onVideoUpdate={onVideoUpdate}
    size="small"
/>

// Example 2: Medium size trong VideoDetail
<CancelVideoButton
    video={video}
    onVideoUpdate={handleVideoUpdate}
    size="medium"
    style={{ marginLeft: '10px' }}
/>

// Example 3: Large size với custom styling
<CancelVideoButton
    video={video}
    onVideoUpdate={onVideoUpdate}
    size="large"
    style={{
        marginTop: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}
/>

// API Usage trong VideoService:
const response = await VideoService.cancelVideo(videoId);
if (response.success) {
    // Video đã được reset về CHUA_AI_NHAN
    console.log('Video canceled:', response.data);
}
*/

export const CancelVideoButtonExamples = {
    small: {
        size: 'small' as const,
        description: 'Dùng trong table rows, compact UI'
    },
    medium: {
        size: 'medium' as const,
        description: 'Dùng trong forms, detail pages'
    },
    large: {
        size: 'large' as const,
        description: 'Dùng trong prominent actions, admin dashboards'
    }
};

export const APIEndpoints = {
    cancel: 'POST /api/v1/videos/{id}/cancel',
    description: 'Reset video về trạng thái CHUA_AI_NHAN, chỉ admin'
};

export default 'CancelVideoButton Usage Examples';