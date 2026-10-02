import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#DA2128"
};

export const metadata: Metadata = {
  title: "SWU Inventory & Asset Management - มหาวิทยาลัยศรีนครินทรวิโรฒ",
  description: "ระบบบริหารจัดการพัสดุ ครุภัณฑ์ และใบขอเบิกดิจิทัล 100% ไร้กระดาษ ส่วนพัฒนากายภาพ มศว",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SWU Inventory"
  },
  formatDetection: {
    telephone: false
  }
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
