
export interface IBooking {
    id: string;

    // Customer info
    customerName: string;
    phoneNumber: string;
    notes?: string;

    // Time info - ARRAY
    timeSlots: {
        timeSlotId: string;
        date: string;
        startTime: string;
        endTime: string;
    }[];

    createdAt: string;
}

// lấy tất cả trường của IBooking trừ id và createAt và điều chỉnh lại notes
export type CreateBookingDTO = Omit<IBooking, 'id' | 'createdAt' | 'notes'> & {
    // Override: Tại Form, notes luôn tồn tại (dù là rỗng), không được undefined
    notes: string;
};