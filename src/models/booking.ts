
export interface IBooking {
    id: string;
    customerName: string;
    phoneNumber: string;
    notes: string;
    createdAt: string;
    createdById:  string;
    timeSlotId: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
}

// lấy tất cả trường của IBooking trừ id và createAt
export type CreateBookingDTO = Omit<IBooking, 'id' | 'createdAt'>

export type UpdateBookingDTO = Partial<CreateBookingDTO>;