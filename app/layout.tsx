import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Texas Second Chance License Navigator",
  description: "See how many people hold a Texas license in a county. Counts only.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="antialiased">
      {/* Column at least one screen tall, so the footer stays at the bottom on short pages. */}
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
