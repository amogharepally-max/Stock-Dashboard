import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock Research Terminal",
  description: "Personal stock research dashboard — not investment advice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-950">{children}</body>
    </html>
  );
}
