import { getUrlByShortCode } from "@/app/actions/url-actions"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  const result = await getUrlByShortCode(code)

  if (result.error || !result.data) {
    redirect("/?error=not-found")
  }

  redirect(result.data.original_url)
}
