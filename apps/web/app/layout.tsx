import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "smol café",
  description: "Handcrafted coffee, wholesome treats & cozy vibes in Rishikesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
