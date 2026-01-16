// import { IBooking } from "@/src/models/booking";

// /**
//  * Kiểm tra xem khung giờ mới có bị trùng với danh sách đã đặt không.
//  * Trả về true nếu có conflict.
//  */
// export const checkTimeConflict = (
//     newBooking: { date: string; startTime: string; endTime: string },
//     existingBookings: IBooking[]
// ): boolean => {
//     const newStart = new Date(`${newBooking.date}T${newBooking.startTime}`);
//     const newEnd = new Date(`${newBooking.date}T${newBooking.endTime}`);

//     return existingBookings.some((booking) => {
//         // Chỉ so sánh các booking trong cùng một ngày
//         if (booking.date !== newBooking.date) return false;

//         const existingStart = new Date(`${booking.date}T${booking.startTime}`);
//         const existingEnd = new Date(`${booking.date}T${booking.endTime}`);

//         // Logic conflict:
//         // (NewStart < ExistingEnd) && (NewEnd > ExistingStart)
//         return newStart < existingEnd && newEnd > existingStart;
//     });
// };