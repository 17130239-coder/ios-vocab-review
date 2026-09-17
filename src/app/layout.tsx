import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOEIC Vocab Mastery — iOS 18 Daily Review",
  description: "Ôn tập 36 ngày từ vựng tiếng Anh TOEIC chuẩn giao diện Apple iOS 18",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vocab Review",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="bg-[#F2F2F7] dark:bg-[#000000] text-[#1C1C1E] dark:text-[#F2F2F7] min-h-screen selection:bg-[#007AFF]/25 selection:text-[#007AFF]">
        {children}
      </body>
    </html>
  );
}
