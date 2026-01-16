// src/services/timeSlotServices.ts
import httpClient from '@/src/utils/httpClient';
import { API_ENDPOINTS } from '@/src/constants/api';
import { ITimeSlot, CreateTimeSlotDTO } from '@/src/models/timeSlot';

export const timeSlotService = {
    async getAll(): Promise<ITimeSlot[]> {
        const response = await httpClient.get<ITimeSlot[]>(API_ENDPOINTS.TIME_SLOT);
        return response. data;
    },

    async getByDate(date: string): Promise<ITimeSlot[]> {
        const response = await httpClient.get<ITimeSlot[]>(API_ENDPOINTS.TIME_SLOT);
        return response. data.filter(slot => slot.date === date);
    },

    async getSlotsByDateWithStatus(date: string): Promise<(ITimeSlot & { isPast: boolean })[]> {
        const response = await httpClient.get<ITimeSlot[]>(API_ENDPOINTS.TIME_SLOT);
        const now = new Date();
        
        // vẫn phải get tất cả TimeSlot rồi mới filter lại (do chưa có đầu API để tryền Date xuống)
        return response.data
            .filter(slot => slot.date === date)
            .map(slot => {
                // check past slot bằng 'endTime' mỗi khi load lên (add thêm isPast)
                const slotDateTime = new Date(`${slot.date}T${slot. endTime}`);
                return {
                    ... slot,
                    isPast: slotDateTime <= now
                };
            })
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    },

    async create(data: CreateTimeSlotDTO): Promise<ITimeSlot> {
        // Double-check:  không cho tạo slot trong quá khứ
        const now = new Date();
        const slotDateTime = new Date(`${data.date}T${data.startTime}`);
        
        if (slotDateTime <= now) {
            throw new Error('Cannot create time slot in the past');
        }

        const payload = {
            ... data,
            isBooked: false,
            createdAt: new Date().toISOString()
        };
        const response = await httpClient.post<ITimeSlot>(API_ENDPOINTS.TIME_SLOT, payload);
        return response. data;
    },

    async delete(id: string): Promise<void> {
        await httpClient.delete(`${API_ENDPOINTS.TIME_SLOT}/${id}`);
    },

    async markAsBooked(id: string): Promise<ITimeSlot> {
        const response = await httpClient.put<ITimeSlot>(
            `${API_ENDPOINTS.TIME_SLOT}/${id}`,
            { isBooked: true }
        );
        return response.data;
    },

    async markAsAvailable(id: string): Promise<ITimeSlot> {
        const response = await httpClient.put<ITimeSlot>(
            `${API_ENDPOINTS.TIME_SLOT}/${id}`,
            { isBooked:  false }
        );
        return response. data;
    }
};