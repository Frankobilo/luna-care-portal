import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://vsahkgegyiqxxzuepnyo.supabase.co'
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYWhrZ2VneWlxeHh6dWVwbnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MzA4NzksImV4cCI6MjA5NTQwNjg3OX0.g8O7YqSqq44Y7Klc5AlYhKilFumxbjiSTJW5HcWqHdI'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
