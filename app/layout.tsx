import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "커리어 나침반 | Career Compass",
  description: "취업과 이직 고민을 오늘의 행동으로 연결하는 커리어 가이드",
  applicationName: "커리어 나침반",
  openGraph: {
    title: "커리어 나침반 | Career Compass",
    description: "취업과 이직 고민을 오늘의 행동으로 연결하는 커리어 가이드",
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf8ef",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
