import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Biology 3D Study Lab — Interactive Anatomy",
  description:
    "Interactive 3D biology study lab: reproductive systems, the human heart and more. Explore labeled models, animated flow paths, X-ray, cross-sections and scored quizzes.",
  keywords: ["biology", "anatomy", "3D", "study", "education", "heart", "reproductive system", "quiz"],
  authors: [{ name: "Biology Lab" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Biology 3D Study Lab",
    description: "Interactive 3D anatomy models with quizzes, X-ray and animated flow paths",
    siteName: "Biology 3D Study Lab",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
