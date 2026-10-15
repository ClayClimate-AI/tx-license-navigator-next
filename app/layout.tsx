import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Texas Second Chance License Navigator",
  description: "See how many people hold a Texas license in a county. Counts only.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
