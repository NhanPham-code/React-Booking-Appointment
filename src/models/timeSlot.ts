// src/models/timeSlot.ts
export interface ITimeSlot {
    id: string;
    startTime: string;  // e.g., "2026-01-21T02:00:00Z"
    endTime: string;    // e.g., "2026-01-21T03:00:00Z"
    
    isBooked: boolean;
    createdAt: string;
}

// We don't need 'date' anymore because it lives inside startTime
export type CreateTimeSlotDTO = Omit<ITimeSlot, 'id' | 'createdAt' | 'isBooked'>;