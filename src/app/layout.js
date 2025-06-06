import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '../../node_modules/bootstrap/dist/css/bootstrap.rtl.min.css';
import NavBar from "./components/NavBar";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Tamamy Attendance System",
  keywords: ["attendance", "system", "tamamy", "erp"],
  authors: [{ name: "Tamamy Team", url: "https://tamamy.com" }],
  description: "Tamamy Attendance System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} container`}>
        <NavBar/>
        {children}
      </body>
    </html>
  );
}
