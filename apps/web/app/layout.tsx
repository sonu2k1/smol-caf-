import type { Metadata, Viewport } from "next";
import { EB_Garamond, Inter, Noto_Sans_Mono } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoSansMono = Noto_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F3E7D3",
};

export const metadata: Metadata = {
  title: "smol café",
  description: "A warm, literary neighbourhood café with a day-to-night personality in Rishikesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ebGaramond.variable} ${inter.variable} ${notoSansMono.variable}`}
    >
      <body className="antialiased min-h-screen bg-[#F3E7D3] text-[#241F1C] font-sans selection:bg-[#B72E35]/20 selection:text-[#B72E35]">
        {children}
      </body>
    </html>
  );
}

