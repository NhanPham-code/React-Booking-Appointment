// src/models/authentication.ts

export type UserRole = 'doctor' | 'patient';

export interface IUser {
    id: string;
    username: string;
    password: string;
    role: UserRole;
    fullName: string;
    email?: string;
}

export type UserWithoutPassword = Omit<IUser, "password">;