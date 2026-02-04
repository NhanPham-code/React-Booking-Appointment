import { AuthResponse, IUser } from '@/src/models/authentication';
import { LoginFormData } from '../validations/loginSchema';
import Cookies from 'js-cookie';
import { COOKIE_ACCESS_TOKEN, COOKIE_USER_KEY } from '../constants/cookieKey';
import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../constants/api';

export const authService = {

    login: async (credentials: LoginFormData): Promise<IUser | null> => {

        const login_url = API_ENDPOINTS.AUTHENTICATION + "/login"

        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await httpClient.post<AuthResponse>(login_url, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const result = response.data
        if (!result) return null;

        const user = result.user || result;
        const token = result.access_token;

        authService.saveSession(user, token);
        return user;
    },

    logout: async (): Promise<void> => {
        // Xóa session
        Cookies.remove(COOKIE_USER_KEY);
        Cookies.remove(COOKIE_ACCESS_TOKEN);
    },

    saveSession: (user: IUser, token: string) => {
        Cookies.set(COOKIE_USER_KEY, JSON.stringify(user), { expires: 7, sameSite: 'Lax', secure: true });
        Cookies.set(COOKIE_ACCESS_TOKEN, token, { expires: 7, sameSite: 'Lax', secure: true });
    },

    clearSession: () => {
        Cookies.remove(COOKIE_USER_KEY);
        Cookies.remove(COOKIE_ACCESS_TOKEN);
    },

    getUserFromSession: (): IUser | null => {
        const data = Cookies.get(COOKIE_USER_KEY);
        return data ? JSON.parse(data) : null;
    },

    getAccessTokenFromSession: (): string | null => {
        return Cookies.get(COOKIE_ACCESS_TOKEN) || null;
    }
};