// Component gốc của ứng dụng
// Chứa layout chính và routing

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VideoList from './components/video/VideoList/VideoList';
import VideoDetail from './components/video/VideoDetail/VideoDetail';
import './styles/global.css';

const App: React.FC = () => {
    return (
        <Router>
            <div className="App">
                {/* Header */}
                <header className="header">
                    <div className="container">
                        <h1>Hệ thống quản lý Video</h1>
                    </div>
                </header>

                {/* Main Content */}
                <main className="container">
                    <Routes>
                        {/* Route mặc định redirect đến danh sách video */}
                        <Route path="/" element={<Navigate to="/videos" replace />} />

                        {/* Route danh sách video */}
                        <Route path="/videos" element={<VideoList />} />

                        {/* Route chi tiết video */}
                        <Route path="/videos/:id" element={<VideoDetail />} />

                        {/* Có thể thêm routes khác ở đây */}
                        {/* <Route path="/videos/:id" element={<VideoDetail />} /> */}
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;