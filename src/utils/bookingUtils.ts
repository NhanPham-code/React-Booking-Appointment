// src/utils/bookingUtils.ts
import { IBooking } from '@/src/models/booking';

export type BookingStatus = 'past' | 'today' | 'upcoming';

export interface BookingWithStatus extends IBooking {
    status: BookingStatus;
    statusLabel: string;
    statusColor: 'default' | 'warning' | 'success';
}

/**
 * Xác định status của booking dựa trên timeSlots
 * - Past: Tất cả slots đã qua
 * - Today: Có ít nhất 1 slot trong hôm nay
 * - Upcoming: Tất cả slots trong tương lai (không phải hôm nay)
 */
export function getBookingStatus(booking: IBooking): BookingStatus {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Kiểm tra từng time slot
    const slotStatuses = booking.timeSlots.map(slot => {
        const slotDate = new Date(slot.date);
        const slotEndDateTime = new Date(`${slot.date}T${slot.endTime}`);

        // Past: slot đã kết thúc
        if (slotEndDateTime < now) {
            return 'past';
        }
        
        // Today: slot trong ngày hôm nay
        if (slotDate >= today && slotDate < tomorrow) {
            return 'today';
        }
        
        // Upcoming: slot trong tương lai
        return 'upcoming';
    });

    // Ưu tiên: today > upcoming > past
    if (slotStatuses.includes('today')) {
        return 'today';
    }
    if (slotStatuses.includes('upcoming')) {
        return 'upcoming';
    }
    return 'past';
}

/**
 * Thêm status info vào booking
 */
export function enrichBookingWithStatus(booking: IBooking): BookingWithStatus {
    const status = getBookingStatus(booking);
    
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
    
    return [...bookings].sort((a, b) => {
        // Sort by status priority
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        
        // Within same status, sort by earliest slot date
        const aDate = new Date(a.timeSlots[0].date + 'T' + a.timeSlots[0].startTime);
        const bDate = new Date(b.timeSlots[0].date + 'T' + b.timeSlots[0].startTime);
        return aDate.getTime() - bDate.getTime();
    });
}