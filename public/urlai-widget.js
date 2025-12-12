;(() => {
  const URLAI_API = "https://urlai.vercel.app"

  window.URLAIWidget = {
    shorten: async (options = {}) => {
      const { url, customCode = null, onSuccess = null, onError = null } = options

      if (!url) {
        if (onError) onError("URL is required")
        return
      }

      try {
        const response = await fetch(`${URLAI_API}/api/shorten`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url,
            customCode: customCode,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          if (onError) onError(data.error || "Failed to shorten URL")
          return
        }

        if (onSuccess) {
          onSuccess({
            shortUrl: `${URLAI_API}/${data.shortCode}`,
            shortCode: data.shortCode,
            originalUrl: data.originalUrl,
            expiresAt: data.expiryDate,
          })
        }
      } catch (error) {
        if (onError) onError(error.message)
      }
    },

    createButton: (containerId, options = {}) => {
      const container = document.getElementById(containerId)
      if (!container) {
        console.error(`Container with id "${containerId}" not found`)
        return
      }

      const buttonHTML = `
        <div style="display: flex; gap: 8px; align-items: center;">
          <input 
            type="text" 
            id="urlai-input" 
            placeholder="Paste URL here..." 
            style="padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 6px; flex: 1; font-family: inherit;"
          />
          <input 
            type="text" 
            id="urlai-custom" 
            placeholder="Custom code (optional)" 
            style="padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 6px; width: 150px; font-family: inherit;"
          />
          <button 
            id="urlai-btn" 
            style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-family: inherit;"
          >
            Shorten
          </button>
          <div id="urlai-result" style="display: none; margin-left: 12px;"></div>
        </div>
      `

      container.innerHTML = buttonHTML

      const input = document.getElementById("urlai-input")
      const customInput = document.getElementById("urlai-custom")
      const btn = document.getElementById("urlai-btn")
      const resultDiv = document.getElementById("urlai-result")

      btn.addEventListener("click", () => {
        const url = input.value.trim()
        const customCode = customInput.value.trim() || null

        window.URLAIWidget.shorten({
          url: url,
          customCode: customCode,
          onSuccess: (result) => {
            resultDiv.style.display = "block"
            resultDiv.innerHTML = `
              <a href="${result.shortUrl}" target="_blank" style="color: #10b981; text-decoration: none; font-weight: 500;">
                ${result.shortUrl}
              </a>
              <button style="margin-left: 8px; padding: 4px 8px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                Copy
              </button>
            `
            const copyBtn = resultDiv.querySelector("button")
            copyBtn.addEventListener("click", () => {
              navigator.clipboard.writeText(result.shortUrl)
              copyBtn.textContent = "Copied!"
              setTimeout(() => (copyBtn.textContent = "Copy"), 2000)
            })
            input.value = ""
            customInput.value = ""
          },
          onError: (error) => {
            resultDiv.style.display = "block"
            resultDiv.innerHTML = `<span style="color: #ef4444;">Error: ${error}</span>`
          },
        })
      })

      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") btn.click()
      })
    },
  }

  console.log("URLAIWidget loaded. Use window.URLAIWidget.shorten() or window.URLAIWidget.createButton(containerId)")
})()
