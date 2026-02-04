'use client';

import { useSocketManager } from "@/hook/useSocketManager";
import { useAuth } from "@/src/context/AuthContext";

export default function SocketWatcher() {
    const { accessToken } = useAuth();
    useSocketManager(accessToken);
    return null;
}