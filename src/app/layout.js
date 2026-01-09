import './globals.css'
import { Inter, Crimson_Pro } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson',
  weight: ['400', '500', '600'],
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
        <body className={`${inter.variable} ${crimsonPro.variable} font-sans antialiased`}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
