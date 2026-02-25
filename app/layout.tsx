import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "THE HOLD - 限界耐久チャレンジ", // タイトルも少し日本語を入れてみました
  description:
    "世界中の暇なプレイヤーとリアルタイムで耐久時間を競い合え。指を離したら終わりのサバイバル。",
  openGraph: {
    images: [
      {
        url: "https://the-hold-app.vercel.app/og-image.png", // ← ここを自分の画像ファイル名にする！
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "https://the-hold-app.vercel.app/og-image.png", // ← ここも同じく！
      },
    ],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
