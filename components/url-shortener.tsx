"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Zap, Copy, Trash2, ExternalLink, Loader2, Check, Link2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { createShortUrl, deleteUrl, getUrls, type UrlRecord } from "@/app/actions/url-actions"

export function UrlShortener() {
  const [url, setUrl] = useState("")
  const [customCode, setCustomCode] = useState("")
  const [links, setLinks] = useState<UrlRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLinks() {
      const result = await getUrls()
      if (result.data) {
        setLinks(result.data)
      }
      if (result.error) {
        setError(result.error)
      }
      setIsFetching(false)
    }
    fetchLinks()
  }, [])

  const normalizeUrl = (inputUrl: string): string => {
    const trimmed = inputUrl.trim()
    if (!trimmed) return trimmed
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`
    }
    return trimmed
  }

  const handleShorten = async () => {
    if (!url) return

    setIsLoading(true)
    setError(null)

    const normalizedUrl = normalizeUrl(url)
    const codeToUse = customCode.trim() || undefined
    const result = await createShortUrl(normalizedUrl, codeToUse)

    if (result.data) {
      setLinks((prev) => [result.data!, ...prev])
      setUrl("")
      setCustomCode("")
    }

    if (result.error) {
      setError(result.error)
    }

    setIsLoading(false)
  }

  const handleCopy = async (id: string, shortCode: string) => {
    await navigator.clipboard.writeText(`https://urlai.vercel.app/${shortCode}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id))
    await deleteUrl(id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && url && !isLoading) {
      handleShorten()
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-12">
      <div className="mb-10 flex items-center gap-4">
        <div className="relative">
          <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-md" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
            <Zap className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">URLAI</h1>
          <p className="text-sm text-muted-foreground">by Riste aka ExploitZ3r0</p>
        </div>
      </div>

      <div className="relative mb-10">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-50 blur-sm" />
        <div className="relative rounded-2xl border border-border bg-card p-6 shadow-xl shadow-background/50">
          <div className="mb-4 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">New Short Link</h2>
          </div>

          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="example.com/very-long-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
            <Button
              onClick={handleShorten}
              disabled={!url || isLoading}
              className="bg-primary px-6 text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 disabled:shadow-none"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Shorten"}
            </Button>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-foreground">Custom Code (optional)</label>
            <Input
              type="text"
              placeholder="e.g., my-link, promo2024"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              className="border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Letters, numbers, and dashes only. Leave empty for random code.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>https:// is optional. Links automatically expire after 1 month.</span>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Your Links</h2>
          <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
            {links.length}
          </span>
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-card/30 p-6">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">Loading your links...</p>
            </div>
          ) : links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="mb-4 rounded-full bg-muted/50 p-4">
                <Link2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-center text-muted-foreground">No links created yet.</p>
              <p className="mt-1 text-center text-sm text-muted-foreground">Paste a URL above to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link, index) => (
                <div
                  key={link.id}
                  className="group flex items-center justify-between rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/30 hover:shadow-md"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-primary">urlai.vercel.app/{link.short_code}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{link.original_url}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Expires {format(new Date(link.expiry_date!), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(link.id, link.short_code)}
                      className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    >
                      {copiedId === link.id ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(`https://urlai.vercel.app/${link.short_code}`, "_blank")}
                      className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(link.id)}
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="mt-12 text-center text-xs text-muted-foreground">
        <p>by Riste aka ExploitZ3r0</p>
      </footer>
    </div>
  )
}
