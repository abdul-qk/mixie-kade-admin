import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import React from 'react'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { CreateAccountForm } from '@/components/forms/CreateAccountForm'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = {
  description: 'Create a Mixie Kadai account to track orders and manage your profile.',
  robots: { follow: false, index: false },
  title: 'Create Account',
}

export default async function CreateAccount() {
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
            Join Mixie Kadai
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold">Create Account</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-16">
        <RenderParams />
        <div className="bg-white border border-brand-surface p-8">
          <CreateAccountForm />
        </div>
        <p className="font-body text-sm text-brand-muted text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-navy font-medium underline underline-offset-4 hover:text-brand-gold transition-colors">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}
