import type { Metadata } from "next";
import { Oswald, Inter, Mrs_Sheppards, Plus_Jakarta_Sans, Istok_Web } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ClientLayout from "./components/layout/ClientLayout";

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
  title: "Arashi - Sportwear Shopping",
  description:
    "Your one-stop online sportwear destination. We offer the latest trends in clothing, shoes, accessories, and more at affordable prices.",
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
