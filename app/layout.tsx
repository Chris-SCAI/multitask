import type { Metadata, Viewport } from 'next'
import './globals.css'
import ErrorBoundary from '../components/ErrorBoundary'
import GoogleAnalytics from '../components/analytics/GoogleAnalytics'
import OfflineIndicator from '../components/pwa/OfflineIndicator'

const siteUrl = 'https://multitasks.fr'
const siteName = 'MultiTasks'
const siteDescription = 'Gestionnaire de tâches multi-rôles. Organisez votre vie pro et perso avec des workspaces personnalisés, une matrice Eisenhower IA, et des exports PDF/CSV.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MultiTasks - Gestionnaire de tâches multi-rôles',
    template: '%s | MultiTasks',
  },
  description: siteDescription,
  keywords: [
    'gestionnaire de tâches',
    'todo list',
    'productivité',
    'organisation',
    'workspaces',
    'matrice eisenhower',
    'gestion du temps',
    'tâches',
    'priorités',
    'rappels',
    'export pdf',
    'application web',
  ],
  authors: [{ name: 'MultiTasks' }],
  creator: 'MultiTasks',
  publisher: 'MultiTasks',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: siteName,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: siteName,
    title: 'MultiTasks - Gestionnaire de tâches multi-rôles',
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MultiTasks - Gestionnaire de tâches multi-rôles',
    description: siteDescription,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: siteUrl,
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
        <GoogleAnalytics />
        <ErrorBoundary>{children}</ErrorBoundary>
        <OfflineIndicator />
      </body>
    </html>
  )
}
