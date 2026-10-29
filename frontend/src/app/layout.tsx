import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "@/styles/jobpilot.css";
import "@/styles/auth-login.css";
import "@/styles/app-loading.css";
import "@/styles/dashboard.css";
import "@/styles/settings.css";
import "@/styles/company-profile.css";
import "@/styles/cv-generator.css";
import "@/styles/post-job.css";
import "@/styles/job-detail.css";
import "@/styles/learn-chat.css";
import "@/styles/agent.css";
import { UserProvider } from "@/context/usercontext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const hindSiliguri = Hind_Siliguri({
  weight: ["400", "500", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chakri.ai - AI-Powered Job Platform in Bangladesh",
  description: "Find jobs and internships across Bangladesh with AI matching, resume builder, and mock interview tools.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a65cc",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${hindSiliguri.variable}`}>
      <body className="min-h-screen antialiased bg-white text-[#18191c]">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
