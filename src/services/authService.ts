import { UserWithoutPassword } from '@/src/models/authentication';
import { MOCK_USERS } from '@/src/data/mockUsers';
import { LoginFormData } from '../validations/loginSchema';

const STORAGE_KEY = 'user_session';

export const authService = {

    async login(credentials: LoginFormData): Promise<UserWithoutPassword | null> {

        const user = MOCK_USERS.find(
            u => u.username === credentials.username && u.password === credentials.password
        );

        if (!user) return null;

        const userWithoutPassword: UserWithoutPassword = {
            id: user.id,
            username: user.username,
            role: user.role,
            fullName: user.fullName,
            email: user.email,
        };

        // 2. Lưu vào storage (Logic được đóng gói tại đây)
        this.saveSession(userWithoutPassword);

        return userWithoutPassword;
    },

    async logout(): Promise<void> {
        // Xóa session
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    },

    // --- Helper Methods (Để đóng gói việc tương tác với Storage) ---
    saveSession(user: UserWithoutPassword) {
        // Kiểm tra 'window' để tránh lỗi khi Next.js render trên server
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        }
    },

    getSession(): UserWithoutPassword | null {
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        }
        return null;
    }
};