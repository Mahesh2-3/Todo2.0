// app/layout.js or app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SearchProvider } from "./context/SearchContext";
import { LoadingProvider } from "./context/LoadingContext";
import { Inter } from "next/font/google";
import { TabProvider } from "./context/ActiveTab";
import Providers from "./context/provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  verification: {
    google: "MV_yKUL8AUGYW500wF3fQ_k0cyS2Xhd4G7AYuHwFAwM",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
    >
      <body>
        <Providers>
          <LoadingProvider>
            <SearchProvider>
              <TabProvider>{children}</TabProvider>
              <ToastContainer position="top-right" theme="dark" />
            </SearchProvider>
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
