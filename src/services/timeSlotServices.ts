import httpClient from '@/src/utils/httpClient';
import { API_ENDPOINTS } from '@/src/constants/api';
import { ITimeSlot, CreateTimeSlotDTO } from '@/src/models/timeSlot';
import { isBefore } from 'date-fns';

const getClientTimeZone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const timeSlotService = {

    getAll: async (): Promise<ITimeSlot[]> => {
        const response = await httpClient.get<ITimeSlot[]>(API_ENDPOINTS.TIME_SLOT);
        return response.data;
    },

    getByDate: async (doctorId: number | undefined, date: string): Promise<ITimeSlot[]> => {
        if (!doctorId) return [];
        try {
            const timeZone = getClientTimeZone();
            // encodeURIComponent để xử lý ký tự "/" trong timezone (Asia/Ho_Chi_Minh)
            const encodedTz = encodeURIComponent(timeZone);

            // URL: /doctor/{id}/time_zone/{tz}/date/{date}
            const url = API_ENDPOINTS.TIME_SLOT + `/doctor/${doctorId}/time_zone/${encodedTz}?date=${date}`;

            const response = await httpClient.get<ITimeSlot[]>(url);
            return response.data;
            // Không cần filter client-side nữa, Backend đã trả về chuẩn xác
        } catch (error) {
            console.error('Error fetching time slots by date:', error);
            return [];
        }
    },

    // Get Slots by Range
    getSlotsByRange: async (doctorId: number | undefined, startDate: string, endDate: string): Promise<(ITimeSlot & { isPast: boolean })[]> => {

        if (!doctorId) return [];

        const now = new Date();

        try {
            const timeZone = getClientTimeZone();
            const encodedTz = encodeURIComponent(timeZone);

            const formattedStart = startDate.split('T')[0];
            const formattedEnd = endDate.split('T')[0];

            // URL: /doctor/{id}/time_zone/{tz}/slots?startDate={startDate}&endDate={endDate}
            const url = API_ENDPOINTS.TIME_SLOT + `/doctor/${doctorId}/time_zone/${encodedTz}?start_date=${formattedStart}&end_date=${formattedEnd}`;

            const response = await httpClient.get<ITimeSlot[]>(url);

            return response.data
                .map(slot => {
                    const slotDateObj = new Date(slot.startTime); // Dùng startTime
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

    // Create (Send UTC ISO Strings)
    create: async (data: CreateTimeSlotDTO): Promise<ITimeSlot> => {
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

    delete: async (id: number, doctorId: number | undefined): Promise<void> => {
        await httpClient.delete(`${API_ENDPOINTS.TIME_SLOT}/${id}`);
    },

    markAsBooked: async (id: number): Promise<ITimeSlot> => {
        const response = await httpClient.put<ITimeSlot>(
            `${API_ENDPOINTS.TIME_SLOT}/${id}`,
            { is_booked: true }
        );
        return response.data;
    },

    markAsAvailable: async (id: number): Promise<ITimeSlot> => {
        const response = await httpClient.put<ITimeSlot>(
            `${API_ENDPOINTS.TIME_SLOT}/${id}`,
            { is_booked: false }
        );
        return response.data;
    }
};