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
import React, { useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
}

export const LoginForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const redirect = useRef(searchParams.get('redirect'))
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = React.useState<null | string>(null)

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await login(data)
        if (redirect?.current) router.push(redirect.current)
        else router.push('/account')
      } catch (_) {
        setError('There was an error with the credentials provided. Please try again.')
      }
    },
    [login, router],
  )

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-950">Sign In</h2>
        <p className="font-body mt-2 text-[15px] leading-relaxed text-slate-600">
          Enter your details to continue shopping and manage your orders.
        </p>
      </div>
      <Message error={error} className="my-0 border border-red-200 bg-red-50 text-red-900" />
      <div className="flex flex-col gap-5">
        <FormItem>
          <Label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-800">
            Email address
          </Label>
          <Input
            className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
            id="email"
            type="email"
            {...register('email', { required: 'Email is required.' })}
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-800">
            Password
          </Label>
          <Input
            className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
            id="password"
            type="password"
            {...register('password', { required: 'Please provide a password.' })}
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <div className="font-body text-sm text-slate-600">
          <p className="leading-relaxed">
            Forgot your password?{' '}
            <Link
              href={`/forgot-password${allParams}`}
              className="font-medium text-brand-navy underline underline-offset-4 transition-colors duration-200 hover:text-sky-700"
            >
              Reset it here
            </Link>
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <Button
          className="h-11 w-full bg-brand-navy text-white transition-colors duration-200 hover:bg-sky-800 sm:flex-1"
          disabled={isSubmitting}
          size="lg"
          type="submit"
          variant="default"
        >
          {isSubmitting ? 'Signing in…' : 'Login'}
        </Button>
      </div>
    </form>
  )
}
