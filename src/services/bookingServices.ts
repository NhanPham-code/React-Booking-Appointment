// src/services/bookingServices. ts
import httpClient from '@/src/utils/httpClient';
import { API_ENDPOINTS } from '@/src/constants/api';
import { IBooking, CreateBookingDTO, UpdateBookingDTO } from '@/src/models/booking';
import { isAxiosError } from 'axios';
import { BookingWithStatus } from '../utils/bookingUtils';

export const bookingService = {

    getByUserId: async (userId: number | undefined): Promise<IBooking[]> => {
        try {
            const response = await httpClient.get<IBooking[]>(`${API_ENDPOINTS.BOOKING}/user/${userId}`);
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

    getByDoctorId: async (doctorId: number | undefined): Promise<IBooking[]> => {
        try {
            const response = await httpClient.get<IBooking[]>(`${API_ENDPOINTS.BOOKING}/doctor/${doctorId}`);
            return response.data;
        }
        catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                // Return empty array so UI shows "No Bookings" instead of "Error"
                return [];
            }
            console.error('Error fetching bookings by doctor ID:', error);
            throw error;
        }
    },

    getById: async (id: number | undefined): Promise<IBooking> => {
        const response = await httpClient.get<IBooking>(`${API_ENDPOINTS.BOOKING}/${id}`);
        return response.data;
    },

    create: async (data: CreateBookingDTO): Promise<IBooking> => {
        const payload = {
            ...data,
            createdAt: new Date().toISOString()
        };

        const response = await httpClient.post<IBooking>(API_ENDPOINTS.BOOKING, payload);

        // try {
        //     await timeSlotService.markAsBooked(data.timeSlotId);
        // } catch (error) {
        //     console.error("Mark booked failed, rolling back booking...");
        //     await bookingService.delete(response.data.id); // rollback delete booking
        //     throw error; // Vẫn ném lỗi ra để UI
        // }
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        //const booking = await bookingService.getById(id);
        await httpClient.delete(`${API_ENDPOINTS.BOOKING}/${id}`);
        //await timeSlotService.markAsAvailable(booking.timeSlotId);
    },

    update: async (id: number, data: Partial<UpdateBookingDTO>): Promise<IBooking> => {
        const response = await httpClient.put<IBooking>(`${API_ENDPOINTS.BOOKING}/${id}`, data);
        return response.data;
    },

    reschedule: async (
        oldBooking: BookingWithStatus | null,
        newTimeSlotId: number | null,
    ): Promise<IBooking> => {

        if (!oldBooking) {
            throw new Error('Old booking is required for reschedule operation');
        }

        if (!newTimeSlotId) {
            throw new Error('New time slot ID is required for reschedule operation');
        }

        console.log('Rescheduling old booking:', oldBooking, 'to new time slot ID:', newTimeSlotId);

        const newBookingData: UpdateBookingDTO = {
            notes: oldBooking.notes || '',
            createById: oldBooking.createById,
            timeSlotId: newTimeSlotId!
        };

        const updatedBooking = await bookingService.update(oldBooking.id, newBookingData);

        // if (updatedBooking) {
        //     // Update time slot statuses
        //     await timeSlotService.markAsAvailable(oldBooking.timeSlotId);
        //     await timeSlotService.markAsBooked(newTimeSlotId!);
        // }
        return updatedBooking;

    }
};