import type { Metadata, Viewport } from 'next'
import './globals.css'
import ErrorBoundary from '../components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'MultiTasks - Gère tes casquettes',
  description: 'TodoList multi-rôles minimaliste et élégante',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MultiTasks',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}
