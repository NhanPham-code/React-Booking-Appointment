// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "@/src/app/provider";

const inter = Inter({
    subsets:  ["latin"],
    variable: "--font-inter",
});

export const metadata:  Metadata = {
    title: "BookingApp - Appointment Scheduling",
    description:  "Modern appointment booking system",
};

export default function RootLayout({
    children,
}:  Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body className={`${inter.variable}`} suppressHydrationWarning={true}>
                <Provider>
                    {children}
                </Provider>
            </body>
        </html>
    );
}