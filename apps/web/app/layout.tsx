import type { Metadata, Viewport } from "next";
import { Fraunces, Caveat, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F5EFEB",
};

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
    <html
      lang="en"
      className={`${fraunces.variable} ${caveat.variable} ${jakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased min-h-screen bg-[#F5EFEB] text-[#1C1917] font-sans selection:bg-[#A62B34]/20 selection:text-[#A62B34]">
        {children}
      </body>
    </html>
  );
}

