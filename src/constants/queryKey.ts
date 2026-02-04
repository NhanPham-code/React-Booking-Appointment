// src/constants/queryKeys.ts

export const QUERY_KEYS = {
    // TimeSlots
    TIME_SLOTS: {
        ALL: ['timeSlots'],

        BY_DOCTOR: (doctorId: number | undefined) => ['timeSlots', 'doctor', doctorId],

        BY_DATE: (doctorId: number | undefined, date: string) =>
            [...QUERY_KEYS.TIME_SLOTS.BY_DOCTOR(doctorId), 'byDate', date],

        BY_RANGE: (doctorId: number | undefined, start: string, end: string) =>
            [...QUERY_KEYS.TIME_SLOTS.BY_DOCTOR(doctorId), 'range', start, end],
    },

    // Bookings
    BOOKINGS: {
        ALL: ['bookings'],
        BY_ID: (id: number | undefined) => ['bookings', id],
        BY_USER: (userId: number | undefined) => ['bookings', 'user', userId],
        BY_DOCTOR: (doctorId: number | undefined) => ['bookings', 'doctor', doctorId],
    },

    // Users
    USERS: {
        ALL: ['users'],
        DOCTORS: ['users', 'doctors'],
        BY_ID: (id: number | undefined) => ['users', id],
    },
};