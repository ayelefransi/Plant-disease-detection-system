import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import ChatMount from "@/components/chatbot/ChatMount"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["400", "600", "700"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "PlantCare AI",
  description:
    "AI-powered plant health assistant for detecting diseases and getting personalized treatment recommendations.",
  generator: "Next.js",
  authors: [{ name: "PlantCare AI Team" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "PlantCare AI – Smart Plant Disease Detection",
    description:
      "Advanced AI-powered plant disease detection with real-time insights and treatment recommendations.",
    url: "https://your-domain.com",
    siteName: "PlantCare AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PlantCare AI Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlantCare AI – Smart Plant Disease Detection",
    description:
      "AI-powered plant disease detection and care recommendations.",
    images: ["/og-image.png"],
    creator: "@your_twitter_handle",
  },
}

export const viewport = {
  themeColor: "#16a34a",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased scroll-smooth bg-background text-foreground">
        {children}
        <ChatMount />
      </body>
    </html>
  )
}
