import type { Metadata } from "next";
import "antd/dist/reset.css";

export const metadata: Metadata = {
  title: "Student Management System",
  description: "Student Management System built with Next.js and Ant Design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f0f2f5" }}>{children}</body>
    </html>
  );
}
