// app/layout.js or app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/Authcontext";
import { SearchProvider } from "./context/SearchContext";
import { LoadingProvider } from "./context/LoadingContext";
import { Inter } from 'next/font/google';
import { TabProvider } from "./context/ActiveTab";

const inter = Inter({
  variable: "--font-geist-inter",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Add favicon and metadata properly
export const metadata = {
  title: "Todo 2.0 - Your Daily TaskManager",
  description: "Your Daily Tasks Manager 2.0 and Write Your Diary",
  icons: {
    icon: "/Logo.png",
    shortcut: "/Logo.png",

  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}>
      <body>
        <AuthProvider>
          <LoadingProvider>
            <SearchProvider>
              <TabProvider>
                {children}
              </TabProvider>
            </SearchProvider>
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
