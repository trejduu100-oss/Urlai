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
      console.error("[v0] Database error:", error)
      if (error.code === "23505") {
        return { error: `Custom code "${customCode}" is already taken. Please try another.` }
      }
      return { error: error.message || "Failed to create short URL" }
    }

    revalidatePath("/")
    return { data: data as UrlRecord }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error occurred"
    console.error("[v0] Exception in createShortUrl:", errorMsg, err)
    return { error: errorMsg }
  }
}

export async function getUrls() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("urls").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching URLs:", error)
      return { error: error.message || "Failed to fetch URLs", data: [] }
    }

    return { data: data as UrlRecord[] }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error occurred"
    console.error("[v0] Exception in getUrls:", errorMsg)
    return { error: errorMsg, data: [] }
  }
}

export async function deleteUrl(id: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("urls").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting URL:", error)
      return { error: error.message }
    }

    revalidatePath("/")
    return { success: true }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error occurred"
    console.error("[v0] Exception in deleteUrl:", errorMsg)
    return { error: errorMsg }
  }
}

export async function getUrlByShortCode(shortCode: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("urls").select("*").eq("short_code", shortCode).maybeSingle()

    if (error) {
      console.error("[v0] Error fetching URL by code:", error)
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
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error occurred"
    console.error("[v0] Exception in getUrlByShortCode:", errorMsg)
    return { error: errorMsg }
  }
}

export async function cleanupExpiredUrls() {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("urls").delete().lt("expiry_date", new Date().toISOString())

    if (error) {
      console.error("[v0] Error cleaning up expired URLs:", error)
      return { error: error.message }
    }

    revalidatePath("/")
    return { success: true }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error occurred"
    console.error("[v0] Exception in cleanupExpiredUrls:", errorMsg)
    return { error: errorMsg }
  }
}
