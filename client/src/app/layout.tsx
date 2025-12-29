import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kapkorn",
  description: "Kapkorn Application",
  icons: {
    icon: "/Logo-Primary.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
