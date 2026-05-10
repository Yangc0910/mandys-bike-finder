import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Mandy's Bike Finder",
  description: "A used kids bike fit, price, style, and seller-message helper for parents.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
