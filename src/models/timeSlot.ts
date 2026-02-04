// src/models/timeSlot.ts
export interface ITimeSlot {
    id: number;
    startTime: string;  // e.g., "2026-01-21T02:00:00Z" UTC
    endTime: string;    // e.g., "2026-01-21T03:00:00Z" UTC

    is_booked: boolean;
    created_at: string;
    doctor_id: number;
}

// We don't need 'date' anymore because it lives inside startTime
export type CreateTimeSlotDTO = {
    startTime: string;  // e.g., "2026-01-21T02:00:00Z" UTC
    endTime: string;    // e.g., "2026-01-21T03:00:00Z" UTC
    doctor_id: number | undefined;
}