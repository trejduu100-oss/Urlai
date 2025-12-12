import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: Request) {
  try {
    const { url, customCode } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const shortCode = customCode || generateShortCode()
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + 1)

    const { data, error } = await supabase
      .from("urls")
      .insert({
        original_url: url,
        short_code: shortCode,
        expiry_date: expiryDate.toISOString(),
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: `Custom code "${customCode}" is already taken` }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      shortCode: data.short_code,
      originalUrl: data.original_url,
      expiryDate: data.expiry_date,
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
