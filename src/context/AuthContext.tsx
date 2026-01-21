// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/src/services/authService';
import { UserWithoutPassword } from '@/src/models/authentication';
import { LoginFormData } from '../validations/loginSchema';
import { CircularProgress, Box } from '@mui/material';
import { useRouter } from 'next/navigation'; // Import router để redirect luôn trong context (tuỳ chọn)

// Manage state of login and logout
interface AuthContextType {
    user: UserWithoutPassword | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginFormData) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserWithoutPassword | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // check login session
    useEffect(() => {
        const initAuth = async () => {
            const storedUser = authService.getSession();
            if (storedUser) {
                setUser(storedUser);
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    // Viết hàm Login Wrapper: Vừa gọi Service, Vừa cập nhật State
    const login = async (credentials: LoginFormData) => {
        // get user data
        const user = await authService.login(credentials);
        
        if (user) {
            // update state to trigger update UI
            setUser(user);
            router.push('/');
            return; 
        } else {
            throw new Error('Đăng nhập thất bại');
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null); // Reset state về null
        router.push('/');
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    // PROVIDE DATA CHO TOÀN APP
    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated: !!user, 
            isLoading,
            login,  // Export hàm login
            logout  // Export hàm logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// 3. Export custom hook để dùng ở các trang khác
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};