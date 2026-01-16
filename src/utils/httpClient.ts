import axios from 'axios';

const httpClient = axios.create({
    // Đây là URL API giả lập (Mock API) nổi tiếng để test
    baseURL: 'https://6967bf0dbbe157c088b2e82f.mockapi.io',
    timeout: 10000, // Quá 10s thì báo lỗi
    headers: {
        'Content-Type': 'application/json',
    },
});

// Có thể thêm interceptor để xử lý token ở đây sau này 
export default httpClient;