import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import "./globals.css";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "California Art Delivery",
    template: "%s – California Art Delivery",
  },
  description: "Delivery of fine furniture and decor.",
  icons: {
    icon: "/logo.jpg",
  },
  openGraph: {
    title: "California Art Delivery",
    description: "Delivery of fine furniture and decor.",
    siteName: "California Art Delivery",
    images: [{ url: "/logo.jpg" }],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${assistant.variable} antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
