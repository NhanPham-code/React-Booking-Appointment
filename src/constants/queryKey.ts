// src/constants/queryKeys.ts

export const QUERY_KEYS = {
    // TimeSlots
    TIME_SLOTS: {
        ALL: ['timeSlots'],
        BY_DATE: (date: string) => ['timeSlots', 'byDate', date],
        BY_RANGE: (start: string, end: string) => ['timeSlots', 'range', { start, end }],
    },
    
    // Bookings
    BOOKINGS:  {
        ALL:  ['bookings'],
        BY_ID: (id: string) => ['bookings', id],
        BY_USER: (userId:  string) => ['bookings', 'user', userId],
    },
};