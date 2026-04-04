'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import { useRouter } from 'next/navigation'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormData = {
  email: string
  name: User['name']
  password: string
  passwordConfirm: string
}

export const AccountForm: React.FC = () => {
  const { setUser, user } = useAuth()
  const [changePassword, setChangePassword] = useState(false)

  const {
    formState: { errors, isLoading, isSubmitting, isDirty },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const router = useRouter()

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (user) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
          // Make sure to include cookies with fetch
          body: JSON.stringify(data),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PATCH',
        })

        if (response.ok) {
          const json = await response.json()
          setUser(json.doc)
          toast.success('Successfully updated account.')
          setChangePassword(false)
          reset({
            name: json.doc.name,
            email: json.doc.email,
            password: '',
            passwordConfirm: '',
          })
        } else {
          toast.error('There was a problem updating your account.')
        }
      }
    },
    [user, setUser, reset],
  )

  useEffect(() => {
    if (user === null) {
      router.push(
        `/login?error=${encodeURIComponent(
          'You must be logged in to view this page.',
        )}&redirect=${encodeURIComponent('/account')}`,
      )
    }

    // Once user is loaded, reset form to have default values
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        passwordConfirm: '',
      })
    }
  }, [user, router, reset, changePassword])

  const fieldInputClass =
    'border-neutral-300 bg-white text-brand-navy shadow-sm placeholder:text-neutral-400 focus-visible:border-brand-navy focus-visible:ring-brand-navy/25 dark:border-neutral-300 dark:bg-white dark:text-brand-navy'

  const labelClassName =
    'mb-2 font-body text-sm font-medium text-brand-navy peer-disabled:opacity-60'

  const introClass = 'font-body text-sm leading-relaxed text-brand-navy'

  const textLinkClass =
    'inline h-auto min-h-0 p-0 align-baseline font-body text-sm font-medium text-brand-gold underline underline-offset-4 hover:text-brand-navy hover:no-underline'

  return (
    <form className="max-w-xl" onSubmit={handleSubmit(onSubmit)}>
      {!changePassword ? (
        <Fragment>
          <p className={`${introClass} mb-8`}>
            {'Change your account details below, or '}
            <Button
              className={textLinkClass}
              onClick={() => setChangePassword(!changePassword)}
              type="button"
              variant="link"
            >
              change your password
            </Button>
            .
          </p>

          <div className="flex flex-col gap-8 mb-8">
            <FormItem>
              <Label htmlFor="email" className={labelClassName}>
                Email address
              </Label>
              <Input
                id="email"
                className={fieldInputClass}
                {...register('email', { required: 'Please provide an email.' })}
                type="email"
              />
              {errors.email && <FormError message={errors.email.message} />}
            </FormItem>

            <FormItem>
              <Label htmlFor="name" className={labelClassName}>
                Name
              </Label>
              <Input
                id="name"
                className={fieldInputClass}
                {...register('name', { required: 'Please provide a name.' })}
                type="text"
              />
              {errors.name && <FormError message={errors.name.message} />}
            </FormItem>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <p className={`${introClass} mb-8`}>
            {'Choose a new password below, or '}
            <Button
              className={textLinkClass}
              onClick={() => setChangePassword(!changePassword)}
              type="button"
              variant="link"
            >
              cancel
            </Button>
            {' to go back.'}
          </p>

          <div className="flex flex-col gap-8 mb-8">
            <FormItem>
              <Label htmlFor="password" className={labelClassName}>
                New password
              </Label>
              <Input
                id="password"
                className={fieldInputClass}
                {...register('password', { required: 'Please provide a new password.' })}
                type="password"
              />
              {errors.password && <FormError message={errors.password.message} />}
            </FormItem>

            <FormItem>
              <Label htmlFor="passwordConfirm" className={labelClassName}>
                Confirm password
              </Label>
              <Input
                id="passwordConfirm"
                className={fieldInputClass}
                {...register('passwordConfirm', {
                  required: 'Please confirm your new password.',
                  validate: (value) => value === password.current || 'The passwords do not match',
                })}
                type="password"
              />
              {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
            </FormItem>
          </div>
        </Fragment>
      )}
      <Button
        className="min-w-[11rem] bg-brand-navy font-body font-medium text-white shadow-sm hover:bg-brand-gold hover:text-brand-navy disabled:bg-neutral-200 disabled:text-neutral-600 disabled:opacity-100 disabled:shadow-none"
        disabled={isLoading || isSubmitting || !isDirty}
        type="submit"
        variant="default"
      >
        {isLoading || isSubmitting
          ? 'Processing'
          : changePassword
            ? 'Change Password'
            : 'Update Account'}
      </Button>
    </form>
  )
}
