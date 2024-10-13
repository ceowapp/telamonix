'use server'
import { signIn, signOut } from '@/lib/auth'

export async function SignIn() {
  return await signIn('google', { redirectTo: '/' })
}

export async function SignOut() {
  await signOut({ redirectTo: "/login" });
}
