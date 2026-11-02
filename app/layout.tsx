import type { Metadata } from 'next'
import { Unbounded, Space_Grotesk } from 'next/font/google'
import './globals.css'
const display = Unbounded({ subsets: ['latin'], variable: '--f-display', weight: ['500', '800'] })
const body = Space_Grotesk({ subsets: ['latin'], variable: '--f-body', weight: ['300', '400', '500'] })
export const metadata: Metadata = { title: 'Mustang – Concept Study', description: 'Loud by design.' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>
}
