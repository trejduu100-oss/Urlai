import { UrlShortener } from "@/components/url-shortener"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <UrlShortener />
      <div className="fixed bottom-4 right-4">
        <Link
          href="/inject"
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          Inject Widget to HTML
        </Link>
      </div>
    </main>
  )
}
