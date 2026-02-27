import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TypeScript 白紙練習",
  description:
    "手本を見て理解し、ゼロから再現する。TypeScript の基礎構造を白紙から書けるようにする学習アプリ。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
