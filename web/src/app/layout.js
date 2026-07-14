import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "vietnamese"],
});

export const metadata = {
  title: "Nhắc Việc - Trợ lý nhắc nhở thông minh",
  description: "Ứng dụng nhắc việc trên Android. Gõ tự nhiên, tự hiểu ngày giờ, nhắc nhở chính xác qua thông báo nền.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nhắc Ơi"
  }
};

export const viewport = {
  themeColor: "#12141C",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          if('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
              for(let registration of registrations) {
                registration.unregister();
              }
            });
          }
          if('caches' in window) {
            caches.keys().then(function(names) {
              for (let name of names) caches.delete(name);
            });
          }
        ` }} />
      </body>
    </html>
  );
}
