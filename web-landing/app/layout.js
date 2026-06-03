import './globals.css'
import ClientLayout from './ClientLayout'

export const metadata = {
  title: "JustUs – Your Private Couple's Space",
  description: 'A private, encrypted space built exclusively for couples. Secure chat, memory vault, love timeline and milestones – all 100% ad-free.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0C0C0E',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Jost:wght@200;300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
