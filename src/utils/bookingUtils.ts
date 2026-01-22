// src/utils/bookingUtils.ts
import { IBooking } from '@/src/models/booking';

export type BookingStatus = 'past' | 'today' | 'upcoming';

export interface BookingWithStatus extends IBooking {
    status: BookingStatus;
    statusLabel: string;
    statusColor: 'default' | 'warning' | 'success';
}

/**
 * Add status to booking based on current date and booking start/end time
 * param: booking IBooking
 * returns: BookingWithStatus (booking + status, statusLabel, statusColor)
 */
export function enrichBookingWithStatus(booking: IBooking): BookingWithStatus {
    const now = new Date();

    // Reset hours to compare dates strictly (00:00:00)
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowMidnight = new Date(todayMidnight);
    tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);

    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime); // You need to use endTime here

    let status: BookingStatus;

    // 1. First Priority: Is the booking time completely over?
    // If now is 16:00 and booking ended at 15:00, this is TRUE -> 'past'
    if (bookingEnd < now) {
        status = 'past';
    }
    // 2. If not over, is it scheduled for tomorrow or later?
    else if (bookingStart >= tomorrowMidnight) {
        status = 'upcoming';
    }
    // 3. If neither, it must be happening Today (and hasn't finished yet)
    else {
        status = 'today';
    }

    const statusConfig = {
        past: {
            label: 'Completed',
            color: 'default' as const
        },
        today: {
            label: 'Today',
            color: 'warning' as const
        },
        upcoming: {
            label: 'Upcoming',
            color: 'success' as const
        }
    };

    return {
        ...booking,
        status,
        statusLabel: statusConfig[status].label,
        statusColor: statusConfig[status].color
    };
}

/**
 * Sort bookings: Today → Upcoming → Past
 */
export function sortBookingsByStatus(bookings: BookingWithStatus[]): BookingWithStatus[] {
    const statusOrder = { today: 0, upcoming: 1, past: 2 };
    
    return bookings.sort((a, b) => {
        return statusOrder[a.status] - statusOrder[b.status];
    });
}