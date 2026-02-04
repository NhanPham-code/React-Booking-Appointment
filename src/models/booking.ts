
export interface IBooking {
    id: number;
    patientName: string;
    patientEmail: string;
    patientPhoneNumber: string;
    notes: string;
    createdAt: string;
    createById: number;
    timeSlotId: number;
    doctorId: number;
    doctorName: string;
    doctorEmail: string;
    doctorPhoneNumber: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
}

// lấy tất cả trường của IBooking trừ id và createAt
export type CreateBookingDTO = {
    notes: string;
    createById: number;
    timeSlotId: number;
}

export type UpdateBookingDTO = {
    notes: string;
    createById: number;
    timeSlotId: number;
}