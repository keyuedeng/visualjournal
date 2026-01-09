import './globals.css'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

export const metadata = {
  title: 'Visual Journal',
  description: 'Personal journaling app'
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${cormorantGaramond.variable} font-sans antialiased`}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
