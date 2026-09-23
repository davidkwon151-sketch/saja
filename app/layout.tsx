import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "커리어 나침반 | Career Compass",
  description: "취업과 이직 고민을 오늘의 행동으로 연결하는 커리어 가이드",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
