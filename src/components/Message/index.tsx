import clsx from 'clsx'
import React from 'react'

export const Message: React.FC<{
  className?: string
  error?: React.ReactNode
  message?: React.ReactNode
  success?: React.ReactNode
  warning?: React.ReactNode
}> = ({ className, error, message, success, warning }) => {
  const messageToRender = message || error || success || warning

  if (messageToRender) {
    const isError = Boolean(error)
    const isSuccess = Boolean(success)
    const isWarning = Boolean(warning)

    return (
      <div
        role={isError ? 'alert' : 'status'}
        aria-live={isError ? 'assertive' : 'polite'}
        aria-atomic="true"
        className={clsx(
          'p-4 my-8 rounded-lg',
          {
            'bg-success ': Boolean(success),
            ' bg-warning': isWarning,
            'bg-error': isError,
            'border border-brand-surface/60': !isError && !isSuccess && !isWarning,
          },
          className,
        )}
      >
        {messageToRender}
      </div>
    )
  }
  return null
}
