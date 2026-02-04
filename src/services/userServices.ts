// src/services/userServices.ts
import httpClient from '../utils/httpClient';
import { UserWithoutPassword } from '@/src/models/authentication';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Get all users with doctor role
 */
export const getDoctors = async (): Promise<UserWithoutPassword[]> => {
    const response = await httpClient.get<UserWithoutPassword[]>('/users?role=doctor');
    return response.data;
};

/**
 * Get a specific doctor by ID
 */
export const getDoctorById = async (doctorId: number): Promise<UserWithoutPassword | null> => {
    const response = await httpClient.get<UserWithoutPassword>(`${API_ENDPOINTS.USERS}/${doctorId}`);
    const doctor = response.data;
    if (!doctor || doctor.role !== 'doctor') {
        return null;
    }
    return doctor;
};
