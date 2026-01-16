// src/constants/queryKeys.ts

export const QUERY_KEYS = {
    // TimeSlots
    TIME_SLOTS: {
        ALL: ['timeSlots'] as const,
        BY_DATE: (date: string) => ['timeSlots', 'byDate', date] as const,
        BY_ID: (id: string) => ['timeSlots', id] as const,
    },
    
    // Bookings
    BOOKINGS:  {
        ALL:  ['bookings'] as const,
        BY_ID: (id: string) => ['bookings', id] as const,
        BY_CUSTOMER: (customerId:  string) => ['bookings', 'customer', customerId] as const,
    },
} as const;