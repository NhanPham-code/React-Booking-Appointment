// src/services/bookingServices.ts
import httpClient from '@/src/utils/httpClient';
import { API_ENDPOINTS } from '@/src/constants/api';
import { IBooking, CreateBookingDTO } from '@/src/models/booking';
import { timeSlotService } from './timeSlotServices';

export const bookingService = {
    async getAll(): Promise<IBooking[]> {
        const response = await httpClient.get<IBooking[]>(API_ENDPOINTS. BOOKING);
        return response.data;
    },

    async getById(id: string): Promise<IBooking> {
        const response = await httpClient.get<IBooking>(`${API_ENDPOINTS.BOOKING}/${id}`);
        return response.data;
    },

    async create(data: CreateBookingDTO): Promise<IBooking> {
        const payload = {
            ... data,
            createdAt: new Date().toISOString()
        };
        
        // Tạo booking
        const response = await httpClient.post<IBooking>(API_ENDPOINTS. BOOKING, payload);
        
        // Update tất cả TimeSlots thành isBooked = true
        for (const slot of data.timeSlots) {
            try {
                console.log(`Marking slot ${slot.timeSlotId} as booked... `);
                await timeSlotService.markAsBooked(slot.timeSlotId);
                console.log(`Slot ${slot.timeSlotId} marked as booked successfully`);
            } catch (error) {
                console.error(`Failed to mark slot ${slot.timeSlotId} as booked:`, error);
            }
        }

        
        return response.data;
    },

    async delete(id: string): Promise<void> {
        // Lấy booking trước khi xóa để biết timeSlotIds
        const booking = await bookingService.getById(id);
        
        // Xóa booking
        await httpClient.delete(`${API_ENDPOINTS. BOOKING}/${id}`);
        
        // Update tất cả TimeSlots thành isBooked = false
        for (const slot of booking.timeSlots) {
            try {
                console.log(`Marking slot ${slot.timeSlotId} as available... `);
                await timeSlotService. markAsAvailable(slot.timeSlotId);
                console.log(`Slot ${slot.timeSlotId} marked as available successfully`);
            } catch (error) {
                console.error(`Failed to mark slot ${slot.timeSlotId} as available:`, error);
            }
        }
    },

    /**
     * Reschedule booking:
     * 1. Lấy thông tin booking cũ
     * 2. Delete booking cũ (tự động release slots)
     * 3. Create booking mới với slots mới
     */
    async reschedule(
        bookingId: string, 
        newTimeSlotData: CreateBookingDTO['timeSlots']
    ): Promise<IBooking> {
        // 1. Lấy booking cũ
        const oldBooking = await this.getById(bookingId);
        
        // 2. Delete booking cũ (sẽ release slots cũ)
        await this.delete(bookingId);
        
        // 3. Tạo booking mới với cùng thông tin khách hàng
        const newBookingData: CreateBookingDTO = {
            customerName: oldBooking.customerName,
            phoneNumber: oldBooking.phoneNumber,
            notes: oldBooking.notes || '',
            timeSlots: newTimeSlotData
        };
        
        // 4. Create booking mới
        return await this.create(newBookingData);
    }
};