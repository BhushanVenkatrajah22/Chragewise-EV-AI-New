import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata = {
  title: "EV Chargewise AI | Automotive Intelligence",
  description: "Enterprise-grade electric vehicle analytics and predictive maintenance platform.",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body className={`${inter.className} antialiased relative`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
