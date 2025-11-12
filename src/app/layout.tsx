import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "@/components/SessionProvider";
import MainLayout from "@/components/MainLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RamHomeLabs - Industrial IoT & Digital Twin Solutions",
  description: "Sai Ram Makkapati's portfolio showcasing Industrial IoT, Digital Twin solutions, MQTT, OPC UA, Eclipse BaSyx, and automation projects.",
  keywords: "Industrial IoT, Digital Twin, MQTT, OPC UA, Eclipse BaSyx, Node-RED, Python, Automation, Industry 4.0",
  authors: [{ name: "Sai Ram Makkapati" }],
  creator: "Sai Ram Makkapati",
  openGraph: {
    title: "RamHomeLabs - Industrial IoT & Digital Twin Solutions",
    description: "Professional portfolio showcasing Industrial IoT and Digital Twin projects",
    url: "https://ramhomelabs.com",
    siteName: "RamHomeLabs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RamHomeLabs - Industrial IoT & Digital Twin Solutions",
    description: "Professional portfolio showcasing Industrial IoT and Digital Twin projects",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        <Provider>
          <MainLayout>{children}</MainLayout>
        </Provider>
      </body>
    </html>
  );
}
