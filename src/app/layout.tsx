import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'O braço de tecnologia para empresários',
  description: 'Empresas que crescem com inteligência artificial crescem de forma exponencial.',
}

import { GoogleTagManager } from "@/components/GoogleTagManager";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <GoogleTagManager />
      </body>
    </html>
  );
}
















