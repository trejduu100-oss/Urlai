"use client"

import type React from "react"

import { useState } from "react"

export default function InjectWidget() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".html")) {
        setError("Please select an HTML file")
        return
      }
      setFile(selectedFile)
      setError("")
      setSuccess(false)
    }
  }

  const handleInject = async () => {
    if (!file) {
      setError("Please select an HTML file")
      return
    }

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const content = await file.text()
      const injectedContent = injectWidget(content)

      // Create blob and download
      const blob = new Blob([injectedContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${file.name.replace(".html", "")}-with-urlai.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setSuccess(true)
      setFile(null)
      if (document.getElementById("file-input")) {
        ;(document.getElementById("file-input") as HTMLInputElement).value = ""
      }
    } catch (err) {
      setError("Failed to process file: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-foreground mb-2">URLAI Widget</h1>
          <p className="text-muted-foreground mb-8">Inject Shortener</p>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-accent transition">
              <label htmlFor="file-input" className="cursor-pointer block">
                <svg
                  className="w-8 h-8 mx-auto mb-2 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-sm text-foreground font-medium">{file ? file.name : "Click to select HTML file"}</p>
                <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
              </label>
              <input id="file-input" type="file" accept=".html" onChange={handleFileChange} className="hidden" />
            </div>

            <button
              onClick={handleInject}
              disabled={!file || loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              {loading ? "Processing..." : "Inject & Download"}
            </button>

            {/* Error message */}
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

            {/* Success message */}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                ✓ File downloaded successfully with URLAI widget injected!
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Manual Installation</h2>
            <p className="text-sm text-muted-foreground mb-3">Add this line before closing &lt;/body&gt; tag:</p>
            <code className="block bg-muted p-3 rounded text-xs text-foreground overflow-auto">
              {'<script src="https://urlai.vercel.app/urlai-widget.js"></script>'}
            </code>

            <p className="text-sm text-muted-foreground mt-4 mb-3">Then add container:</p>
            <code className="block bg-muted p-3 rounded text-xs text-foreground overflow-auto">
              {
                "<div id=\"urlai-shortener\"></div>\n<script>\n  window.URLAIWidget.createButton('urlai-shortener');\n</script>"
              }
            </code>
          </div>
        </div>
      </div>
    </main>
  )
}

function injectWidget(htmlContent: string): string {
  const widgetScript = `<script src="https://urlai.vercel.app/urlai-widget.js"><\/script>`

  // Check if widget is already injected
  if (htmlContent.includes("urlai-widget.js")) {
    return htmlContent
  }

  // Try to inject before closing body tag
  if (htmlContent.includes("</body>")) {
    return htmlContent.replace("</body>", `${widgetScript}\n</body>`)
  }

  // If no body tag, append to end
  return htmlContent + `\n${widgetScript}`
}
