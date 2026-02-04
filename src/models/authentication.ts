// src/models/authentication.ts

export type UserRole = 'doctor' | 'patient';


export interface IUser {
    id: number;
    username: string;
    role: UserRole;
    fullname: string;
    email?: string;
    phone?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: IUser;
}