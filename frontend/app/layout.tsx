import type { Metadata } from "next";
import { Oswald, Inter, Mrs_Sheppards, Plus_Jakarta_Sans, Istok_Web } from "next/font/google";
import "@/app/globals.css";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { CartProvider } from "@/app/contexts/CartContext";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import ClientLayout from "@/app/components/layout/ClientLayout";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mrsSheppards = Mrs_Sheppards({
  weight: "400",
  variable: "--font-mrs-sheppards",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const istokWeb = Istok_Web({
  weight: ["400", "700"],
  variable: "--font-istok",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://arashi-sport.com"),
  title: {
    default: "Arashi - Premium Sportwear",
    template: "%s | Arashi"
  },
  description: "Your one-stop online sportwear destination. We offer the latest trends in clothing, shoes, accessories, and more at affordable prices.",
  openGraph: {
    title: "Arashi - Premium Sportwear",
    description: "Your one-stop online sportwear destination. Chase the unseen.",
    url: "/",
    siteName: "Arashi",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arashi - Premium Sportwear",
    description: "Your one-stop online sportwear destination. Chase the unseen.",
    creator: "@arashi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${inter.variable} ${mrsSheppards.variable} ${plusJakarta.variable} ${istokWeb.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="grow">
                {children}
              </main>
              <Footer />
            </div>
            <ClientLayout />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
