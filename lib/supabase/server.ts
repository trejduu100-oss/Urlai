export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Simple fetch-based client for server-side operations
  return {
    from: (table: string) => ({
      select: (columns = "*") => ({
        eq: (column: string, value: any) => ({
          maybeSingle: async () => {
            try {
              const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}&select=${columns}`, {
                headers: {
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                },
              })
              const data = await response.json()
              return { data: data[0] || null, error: null }
            } catch (error) {
              return { data: null, error }
            }
          },
          single: async () => {
            try {
              const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}&select=${columns}`, {
                headers: {
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                },
              })
              const data = await response.json()
              return { data: data[0], error: null }
            } catch (error) {
              return { data: null, error }
            }
          },
        }),
        lt: (column: string, value: any) => ({
          async then(resolve: any) {
            try {
              const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${column}=lt.${value}&select=${columns}`, {
                headers: {
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                },
              })
              const data = await response.json()
              resolve({ data, error: null })
            } catch (error) {
              resolve({ data: null, error })
            }
          },
        }),
        order: (column: string, options?: { ascending: boolean }) => ({
          async then(resolve: any) {
            const order = options?.ascending ? "asc" : "desc"
            try {
              const response = await fetch(
                `${supabaseUrl}/rest/v1/${table}?select=${columns}&order=${column}.${order}`,
                {
                  headers: {
                    apikey: supabaseKey,
                    Authorization: `Bearer ${supabaseKey}`,
                  },
                },
              )
              const data = await response.json()
              resolve({ data, error: null })
            } catch (error) {
              resolve({ data: null, error })
            }
          },
        }),
      }),
      insert: (values: any) => ({
        select: () => ({
          single: async () => {
            try {
              const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
                method: "POST",
                headers: {
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                  "Content-Type": "application/json",
                  Prefer: "return=representation",
                },
                body: JSON.stringify(values),
              })
              const data = await response.json()
              if (!response.ok) {
                return {
                  data: null,
                  error: { code: response.status === 409 ? "23505" : String(response.status), message: data.message },
                }
              }
              return { data: data[0], error: null }
            } catch (error: any) {
              return { data: null, error: { message: error.message } }
            }
          },
        }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          async then(resolve: any) {
            try {
              const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}`, {
                method: "DELETE",
                headers: {
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                },
              })
              resolve({ error: response.ok ? null : await response.json() })
            } catch (error) {
              resolve({ error })
            }
          },
        }),
        lt: (column: string, value: any) => ({
          async then(resolve: any) {
            try {
              const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${column}=lt.${value}`, {
                method: "DELETE",
                headers: {
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                },
              })
              resolve({ error: response.ok ? null : await response.json() })
            } catch (error) {
              resolve({ error })
            }
          },
        }),
      }),
    }),
  }
}
