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
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden bg-brand-navy px-6 py-10 text-white md:px-10 md:py-14">
          <div className="pointer-events-none absolute -right-20 -top-16 h-52 w-52 rounded-full bg-brand-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-sky-400/20 blur-3xl" />
          <p className="font-body mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
            Welcome Back
          </p>
          <h1 className="font-display text-3xl font-semibold leading-tight md:text-5xl">Sign in to your account</h1>
          <p className="font-body mt-4 max-w-md text-[15px] leading-relaxed text-slate-200 md:text-base">
            Access your profile, track current orders, and checkout faster with saved details.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              'Track your delivery status in real time',
              'Manage addresses and account details',
              'View order history instantly',
            ].map((item) => (
              <li key={item} className="font-body flex items-start gap-3 text-sm text-slate-100 md:text-[15px]">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-gold" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="px-5 py-8 md:px-10 md:py-12">
          <RenderParams />
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <LoginForm />
          </div>
          <p className="font-body mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/create-account"
              className="font-semibold text-brand-navy underline underline-offset-4 transition-colors duration-200 hover:text-sky-700"
            >
              Create one
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
