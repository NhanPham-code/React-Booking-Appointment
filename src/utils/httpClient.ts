import axios from 'axios';
import { authService } from '../services/authService';

const httpClient = axios.create({
    // Đây là URL API giả lập (Mock API) nổi tiếng để test
    baseURL: 'http://127.0.0.1:8000',
    timeout: 10000, // Quá 10s thì báo lỗi
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tự động đính kèm Token vào mọi Request đi lên server
httpClient.interceptors.request.use((config) => {
    const token = authService.getAccessTokenFromSession();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Xử lý lỗi phản hồi từ server
httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Xóa session
            authService.clearSession();

            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default httpClient;