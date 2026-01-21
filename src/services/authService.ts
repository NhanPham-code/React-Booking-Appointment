import { UserWithoutPassword } from '@/src/models/authentication';
import { MOCK_USERS } from '@/src/data/mockUsers';
import { LoginFormData } from '../validations/loginSchema';
import Cookies from 'js-cookie';
import { COOKIE_USER_KEY } from '../constants/cookieKey';

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

        this.saveSession(userWithoutPassword);

        return userWithoutPassword;
    },

    async logout(): Promise<void> {
        // Xóa session
        Cookies.remove(COOKIE_USER_KEY);
    },

    saveSession(user: UserWithoutPassword) {
        Cookies.set(COOKIE_USER_KEY, JSON.stringify(user), { expires: 7 });
    },

    getSession(): UserWithoutPassword | null {
        const data = Cookies.get(COOKIE_USER_KEY);
        return data ? JSON.parse(data) : null;
    }
};