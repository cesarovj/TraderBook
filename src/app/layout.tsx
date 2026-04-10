import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TraderBook",
  description: "Trading journal and analytics dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
