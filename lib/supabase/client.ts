export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
    }),
  }
}
