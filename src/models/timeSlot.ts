// 📁 src/models/timeSlot.ts
export interface ITimeSlot {
    id: string;
    date: string;           // YYYY-MM-DD
    startTime: string;      // HH:mm
    endTime:  string;        // HH:mm
    isBooked: boolean;
    createdAt: string;
}

export type CreateTimeSlotDTO = Omit<ITimeSlot, 'id' | 'createdAt' | 'isBooked'>;