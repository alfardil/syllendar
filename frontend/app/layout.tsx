import React from 'react'
import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Syllendar - Smart Academic Planning',
  description: 'Upload your syllabus, sync important dates, track grades, and get AI-powered study resources',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 