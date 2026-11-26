import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";
import "@/lib/dbWakeup";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Notylist - Organize Your Thoughts",
  description: "A beautiful and powerful note-taking app with todos, QR generator, and offline mode.",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6655F5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: `
          // Service Worker with cleanup for broken versions
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', async () => {
              try {
                // Unregister old broken service workers
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                  const sw = registration.active || registration.waiting || registration.installing;
                  if (sw && sw.scriptURL.includes('/sw.js')) {
                    // Check if it's the new version by testing cache name
                    const hasOldCache = await caches.has('notylist-v1');
                    if (hasOldCache) {
                      console.log('Cleaning up old service worker...');
                      await registration.unregister();
                      await caches.delete('notylist-v1');
                      // Wait a bit before registering new SW
                      await new Promise(resolve => setTimeout(resolve, 100));
                    }
                  }
                }
                
                // Register new service worker
                await navigator.serviceWorker.register('/sw.js', { scope: '/' });
              } catch (error) {
                console.warn('Service worker registration failed:', error);
              }
            });
          }
        `}} />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#1e2030', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
