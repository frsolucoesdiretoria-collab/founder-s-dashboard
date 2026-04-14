import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://rwwheapbsnfxxrvwmwrb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3d2hlYXBic25meHhydndtd3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODE5NDYsImV4cCI6MjA5MTc1Nzk0Nn0.QLAEBt6RfRgusQOdty_5Z2hBk3FnJEhxKLG-hRKIvno'

export const ORG_ID = 'ec4c62fa-4158-4c69-a5fb-972d27cb9d48'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
