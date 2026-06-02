import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'BeautyPro — ניהול עסק',
  description: 'מערכת ניהול למאפרות ומעצבות שיער',
  manifest: '/manifest.json',
  themeColor: '#0F6E56',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BeautyPro',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BeautyPro" />
        <meta name="theme-color" content="#0F6E56" />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 mr-64 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
