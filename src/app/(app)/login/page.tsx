import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import Link from 'next/link'
import React from 'react'

import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { LoginForm } from '@/components/forms/LoginForm'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  description: 'Sign in to your Mixie Kadai account.',
  robots: { follow: false, index: false },
  title: 'Sign In',
}

export default async function Login() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (user) {
    redirect(`/account`)
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Page hero */}
      <div className="bg-brand-navy text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-brand-gold text-xs font-semibold tracking-widest uppercase mb-3">
            Welcome Back
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold">Sign In</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-16">
        <RenderParams />
        <div className="bg-white border border-brand-surface p-8">
          <LoginForm />
        </div>
        <p className="font-body text-sm text-brand-muted text-center mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/create-account" className="text-brand-navy font-medium underline underline-offset-4 hover:text-brand-gold transition-colors">
            Create one →
          </Link>
        </p>
      </div>
    </div>
  )
}
