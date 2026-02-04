'use client';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/src/constants/queryKey';
import { toast } from 'react-toastify';

export const useSocketManager = (token: string | null | undefined) => {
    const queryClient = useQueryClient();
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        function connect() {
            if (!token || socketRef.current?.readyState === WebSocket.OPEN) return;

            console.log("Connecting to:", `ws://127.0.0.1:8000/ws?token=${token}`);

            const wsUrl = `ws://127.0.0.1:8000/ws?token=${token}`;
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => console.log(" WebSocket Connected");

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case "SLOT_ADDED":
                        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.BY_DOCTOR(data.doctor_id) });
                        toast.success(" New time slot has been added!");
                        break;
                    case "SLOT_DELETED":
                        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.BY_DOCTOR(data.doctor_id) });
                        break;
                    case "BOOKING_CREATED":
                        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.ALL });
                        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.BY_DOCTOR(data.doctor_id) });
                        toast.success(" New booking has been created!");
                        break;
                    case "BOOKING_UPDATED":
                        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.ALL });
                        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TIME_SLOTS.BY_DOCTOR(data.doctor_id) });
                        toast.info(" Booking has been updated.");
                        break;
                }
            };

            ws.onclose = (event) => {
                // Kiểm tra nếu không phải chủ động đóng thì mới reconnect
                if (event.code !== 1000) {
                    console.log(" WS Disconnected. Reconnecting in 3s...");
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, 3000);
                }
            };

            ws.onerror = (err) => {
                console.error(" WebSocket Error:", err);
                ws.close();
            };

            socketRef.current = ws;
        }

        connect();

        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (socketRef.current) {
                socketRef.current.close(1000);
            }
        };
    }, [token, queryClient]); // Khi token đổi, useEffect sẽ chạy lại và tạo kết nối mới

    return;
};