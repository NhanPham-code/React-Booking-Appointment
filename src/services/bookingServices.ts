// src/services/bookingServices. ts
import httpClient from '@/src/utils/httpClient';
import { API_ENDPOINTS } from '@/src/constants/api';
import { IBooking, CreateBookingDTO, UpdateBookingDTO } from '@/src/models/booking';
import { timeSlotService } from './timeSlotServices';
import { isAxiosError } from 'axios';
import { BookingWithStatus } from '../utils/bookingUtils';

export const bookingService = {
    async getAll(): Promise<IBooking[]> {
        const response = await httpClient.get<IBooking[]>(API_ENDPOINTS.BOOKING);
        return response.data;
    },

    async getByUserId(userId: string): Promise<IBooking[]> {
        try {
            const response = await httpClient.get<IBooking[]>(`${API_ENDPOINTS.BOOKING}?createdById=${userId}`);
            return response.data;
        }
        catch (error) {

            if (isAxiosError(error) && error.response?.status === 404) {
                // Return empty array so UI shows "No Bookings" instead of "Error"
                return [];
            }

            console.error('Error fetching bookings by user ID:', error);
            throw error;
        }
    },

    async getByDateRange(startDate: string, endDate: string): Promise<IBooking[]> {
        try {
            const response = await httpClient.get<IBooking[]>(API_ENDPOINTS.BOOKING);
            return response.data.filter(booking => {
                // booking.startTime is an ISO string
                return booking.startTime >= startDate && booking.endTime <= endDate;
            });
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                // Return empty array so UI shows "No Bookings" instead of "Error"
                return [];
            }

            console.error('Error fetching bookings by range:', error);
            throw error;
        }
    },

    async getById(id: string): Promise<IBooking> {
        const response = await httpClient.get<IBooking>(`${API_ENDPOINTS.BOOKING}/${id}`);
        return response.data;
    },

    async create(data: CreateBookingDTO): Promise<IBooking> {
        const payload = {
            ...data,
            createdAt: new Date().toISOString()
        };

        const response = await httpClient.post<IBooking>(API_ENDPOINTS.BOOKING, payload);
        try {
            await timeSlotService.markAsBooked(data.timeSlotId);
        } catch (error) {
            console.error(`Failed to mark slot ${data.timeSlotId} as booked:`, error);
        }
        return response.data;
    },

    async delete(id: string): Promise<void> {
        const booking = await bookingService.getById(id);
        await httpClient.delete(`${API_ENDPOINTS.BOOKING}/${id}`);

        try {
            await timeSlotService.markAsAvailable(booking.timeSlotId);
        } catch (error) {
            console.error(`Failed to mark slot ${booking.timeSlotId} as available: `, error);
        }
    },

    async update(id: string, data: Partial<UpdateBookingDTO>): Promise<IBooking> {
        const response = await httpClient.put<IBooking>(`${API_ENDPOINTS.BOOKING}/${id}`, data);
        return response.data;
    },

    async reschedule(
        oldBooking: BookingWithStatus | null,
        newTimeSlotId: string,
        newStartTime: string, // ISO string
        newEndTime: string // ISO string
    ): Promise<IBooking> {
        
        if (!oldBooking) {
            throw new Error('Old booking is required for reschedule operation');
        }

        const newBookingData: CreateBookingDTO = {
            customerName: oldBooking.customerName,
            phoneNumber: oldBooking.phoneNumber,
            notes: oldBooking.notes || '',
            createdById: oldBooking.createdById,
            timeSlotId: newTimeSlotId,
            startTime: newStartTime,
            endTime: newEndTime
        };

        try {
            const updatedBooking = await this.update(oldBooking.id, newBookingData);
            if (updatedBooking) {
                // Update time slot statuses
                await timeSlotService.markAsAvailable(oldBooking.timeSlotId);
                await timeSlotService.markAsBooked(newTimeSlotId);
            }
            return updatedBooking;
        } catch (error) {
            console.error('Error updating booking during reschedule:', error);
            throw error;
        }
    }
};