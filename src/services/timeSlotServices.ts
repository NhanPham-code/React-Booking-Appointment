import httpClient from '@/src/utils/httpClient';
import { API_ENDPOINTS } from '@/src/constants/api';
import { ITimeSlot, CreateTimeSlotDTO } from '@/src/models/timeSlot';
import { isBefore } from 'date-fns';

export const timeSlotService = {

    async getAll(): Promise<ITimeSlot[]> {
        const response = await httpClient.get<ITimeSlot[]>(API_ENDPOINTS.TIME_SLOT);
        return response.data;
    },

    async getByDate(date: string): Promise<ITimeSlot[]> {
        try {
            const response = await httpClient.get<ITimeSlot[]>(API_ENDPOINTS.TIME_SLOT);
            return response.data.filter(slot => slot.startTime.startsWith(date));
        } catch (error) {
            console.error('Error fetching time slots by date:', error);
            return [];
        }
    },

    // Get Slots by Range (The "Professional" Way)
    async getSlotsByRange(startDate: string, endDate: string): Promise<(ITimeSlot & { isPast: boolean })[]> {
        const now = new Date();

        try {
            const response = await httpClient.get<ITimeSlot[]>(API_ENDPOINTS.TIME_SLOT);

            return response.data
                .filter(slot => {
                    // slot.startTime is "2026-01-21T02:00:00.000Z"
                    // startDate is "2026-01-19"
                    // We simply check if the ISO string starts with the date or is greater
                    // A simple string comparison works well for ISO dates
                    return slot.startTime >= startDate && slot.startTime <= endDate; 
                })
                .map(slot => {
                    // Simple "isPast" check using the ISO string directly
                    const slotDateObj = new Date(slot.endTime); 
                    return {
                        ...slot,
                        isPast: isBefore(slotDateObj, now)
                    };
                })
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

        } catch (error) {
            console.error("Error fetching range:", error);
            return [];
        }
    },

    // Create (UTC Logic)
    // Note: The UI has already converted the input to UTC ISO strings before calling this.
    async create(data: CreateTimeSlotDTO): Promise<ITimeSlot> {
        const now = new Date();
        const slotDateObj = new Date(data.startTime); // It's already an ISO string

        if (slotDateObj <= now) {
            throw new Error('Cannot create time slot in the past');
        }

        const payload = {
            ...data,
            isBooked: false,
            createdAt: new Date().toISOString()
        };
        const response = await httpClient.post<ITimeSlot>(API_ENDPOINTS.TIME_SLOT, payload);
        return response.data;
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
            { isBooked: false }
        );
        return response.data;
    }
};