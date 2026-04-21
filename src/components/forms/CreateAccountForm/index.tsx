'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
  passwordConfirm: string
}

export const CreateAccountForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const onSubmit = useCallback(
    async (data: FormData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users`, {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const message = response.statusText || 'There was an error creating the account.'
        setError(message)
        return
      }

      const redirect = searchParams.get('redirect')

      const timer = setTimeout(() => {
        setLoading(true)
      }, 1000)

      try {
        await login(data)
        clearTimeout(timer)
        if (redirect) router.push(redirect)
        else router.push(`/account?success=${encodeURIComponent('Account created successfully')}`)
      } catch (_) {
        clearTimeout(timer)
        setError('There was an error with the credentials provided. Please try again.')
      }
    },
    [login, router, searchParams],
  )

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-950">Create account</h2>
        <p className="font-body mt-2 text-[15px] leading-relaxed text-slate-600">
          Create an account to save your details, track orders, and check out faster next time.
        </p>
      </div>

      <Message error={error} className="my-0 border border-red-200 bg-red-50 text-red-900" />

      <div className="flex flex-col gap-5">
        <FormItem>
          <Label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-800">
            Email Address
          </Label>
          <Input
            className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
            id="email"
            {...register('email', { required: 'Email is required.' })}
            type="email"
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-800">
            New password
          </Label>
          <Input
            className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
            id="password"
            {...register('password', { required: 'Password is required.' })}
            type="password"
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="passwordConfirm" className="mb-2 block text-sm font-medium text-slate-800">
            Confirm Password
          </Label>
          <Input
            className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
            id="passwordConfirm"
            {...register('passwordConfirm', {
              required: 'Please confirm your password.',
              validate: (value) => value === password.current || 'The passwords do not match',
            })}
            type="password"
          />
          {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
        </FormItem>
      </div>

      <Button
        className="h-11 w-full bg-brand-navy text-white transition-colors duration-200 hover:bg-sky-800"
        disabled={loading}
        type="submit"
        variant="default"
      >
        {loading ? 'Processing' : 'Create Account'}
      </Button>

      <div className="font-body text-sm text-slate-600">
        <p className="leading-relaxed">
          {'Already have an account? '}
          <Link
            href={`/login${allParams}`}
            className="font-medium text-brand-navy underline underline-offset-4 transition-colors duration-200 hover:text-sky-700"
          >
            Login
          </Link>
        </p>
      </div>
    </form>
  )
}
