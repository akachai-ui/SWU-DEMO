import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";

export const metadata: Metadata = {
  title: "SWU Inventory & Asset Management - มหาวิทยาลัยศรีนครินทรวิโรฒ",
  description: "ระบบบริหารจัดการพัสดุและครุภัณฑ์ภาครัฐ (มศว เทา-แดง)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased min-h-screen bg-[#121417] text-gray-100">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
