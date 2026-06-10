import type { Metadata, Viewport } from "next";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { SettingsProvider } from "@/components/SettingsContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carpenter's Calculator",
  description:
    "Construction calculator for finish carpenters: feet-inch-fraction math, baluster layout, stairs, crown molding, and board feet.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CarpCalc",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#16191f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SettingsProvider>{children}</SettingsProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
