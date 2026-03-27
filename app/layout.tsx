import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Copiloto da Sorte | Análise Esportiva Inteligente',
  description: 'Seu copiloto ao vivo que traduz probabilidades e contexto em cenários explicáveis. Análise premium de futebol com inteligência artificial.',
  keywords: ['análise esportiva', 'apostas', 'futebol', 'IA', 'previsões', 'odds'],
}

export const viewport: Viewport = {
  themeColor: '#02003a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
