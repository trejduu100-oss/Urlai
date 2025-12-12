"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface UrlRecord {
  id: string
  original_url: string
  short_code: string
  expiry_date: string
  created_at: string
}

function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function createShortUrl(originalUrl: string, customCode?: string) {
  try {
    const supabase = await createClient()

    const shortCode = customCode || generateShortCode()

    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + 1)

    const { data, error } = await supabase
      .from("urls")
      .insert({
        original_url: originalUrl,
        short_code: shortCode,
        expiry_date: expiryDate.toISOString(),
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return { error: `Custom code "${customCode}" is already taken. Please try another.` }
      }
      return { error: error.message }
    }

    revalidatePath("/")
    return { data: data as UrlRecord }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error occurred" }
  }
}

export async function getUrls() {
  const supabase = await createClient()

  await cleanupExpiredUrls()

  const { data, error } = await supabase.from("urls").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching URLs:", error)
    return { error: error.message, data: [] }
  }

  return { data: data as UrlRecord[] }
}

export async function deleteUrl(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("urls").delete().eq("id", id)

  if (error) {
    console.error("Error deleting URL:", error)
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function getUrlByShortCode(shortCode: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("urls").select("*").eq("short_code", shortCode).maybeSingle()

  if (error) {
    return { error: error.message }
  }

  if (!data) {
    return { error: "URL not found" }
  }

  if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
    await supabase.from("urls").delete().eq("id", data.id)
    return { error: "URL has expired and been deleted" }
  }

  return { data: data as UrlRecord }
}

export async function cleanupExpiredUrls() {
  const supabase = await createClient()

  const { error } = await supabase.from("urls").delete().lt("expiry_date", new Date().toISOString())

  if (error) {
    console.error("Error cleaning up expired URLs:", error)
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}
