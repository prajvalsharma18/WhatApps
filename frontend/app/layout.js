import "./globals.css";

export const metadata = {
  title: "WhatApps",
  description: "WhatsApp Clone",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}