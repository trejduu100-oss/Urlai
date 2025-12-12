"use client"

import { UrlShortener } from "@/components/url-shortener"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <UrlShortener />
      <button
        onClick={() => (window.location.href = "/inject")}
        className="fixed bottom-4 right-4 z-50 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-lg"
      >
        Inject Widget
      </button>
    </main>
  )
}
