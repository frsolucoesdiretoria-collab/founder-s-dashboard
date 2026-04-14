import { supabase } from './supabase-client.js'

export async function requireAuth() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = '/login.html'
    return null
  }
  return user
}

export async function requireRole(allowedRoles) {
  const user = await requireAuth()
  if (!user) return null
  const role = user.app_metadata?.role
  if (!allowedRoles.includes(role)) {
    window.location.href = '/login.html'
    return null
  }
  return user
}

export function getMyRole(user) {
  return user?.app_metadata?.role || null
}

export function getMyProfileId(user) {
  return user?.app_metadata?.profile_id || null
}

export async function logout() {
  await supabase.auth.signOut()
  window.location.href = '/login.html'
}
