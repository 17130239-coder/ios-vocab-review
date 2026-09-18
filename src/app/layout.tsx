import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "TOEIC Prep — Ôn Tập Từ Vựng",
  description: "Ôn tập từ vựng tiếng Anh TOEIC theo ngày phong cách Zen Minimalist",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TOEIC Prep",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={plusJakarta.variable} suppressHydrationWarning>
      <body className="bg-[#f8fafc] dark:bg-[#000000] text-[#0f172a] dark:text-[#f8fafc] font-sans min-h-screen selection:bg-[#0070eb]/15 selection:text-[#0070eb]">
        {children}
      </body>
    </html>
  );
}
