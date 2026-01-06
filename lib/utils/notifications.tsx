'use client'

import { toast } from 'sonner'
import React from 'react'

// Success notification with gradient
const SuccessNotification = ({
  message,
  description,
}: {
  message: string
  description?: string
}) => (
  <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800 shadow-lg">
    <div className="flex-shrink-0 mt-0.5">
      <svg
        className="w-5 h-5 text-green-600 dark:text-green-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-green-800 dark:text-green-200">
        {message}
      </h3>
      {description && (
        <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">
          {description}
        </p>
      )}
    </div>
  </div>
)

// Error notification with gradient
const ErrorNotification = ({
  message,
  description,
}: {
  message: string
  description?: string
}) => (
  <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 dark:from-red-950 dark:to-rose-950 dark:border-red-800 shadow-lg">
    <div className="flex-shrink-0 mt-0.5">
      <svg
        className="w-5 h-5 text-red-600 dark:text-red-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-red-800 dark:text-red-200">
        {message}
      </h3>
      {description && (
        <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">
          {description}
        </p>
      )}
    </div>
  </div>
)

// Warning notification with gradient
const WarningNotification = ({
  message,
  description,
}: {
  message: string
  description?: string
}) => (
  <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 dark:from-amber-950 dark:to-yellow-950 dark:border-amber-800 shadow-lg">
    <div className="flex-shrink-0 mt-0.5">
      <svg
        className="w-5 h-5 text-amber-600 dark:text-amber-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-amber-800 dark:text-amber-200">
        {message}
      </h3>
      {description && (
        <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
          {description}
        </p>
      )}
    </div>
  </div>
)

// Info notification with gradient
const InfoNotification = ({
  message,
  description,
}: {
  message: string
  description?: string
}) => (
  <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 dark:from-blue-950 dark:to-cyan-950 dark:border-blue-800 shadow-lg">
    <div className="flex-shrink-0 mt-0.5">
      <svg
        className="w-5 h-5 text-blue-600 dark:text-blue-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-blue-800 dark:text-blue-200">
        {message}
      </h3>
      {description && (
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">
          {description}
        </p>
      )}
    </div>
  </div>
)

// Loading notification with gradient
const LoadingNotification = ({ message }: { message: string }) => (
  <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 dark:from-purple-950 dark:to-indigo-950 dark:border-purple-800 shadow-lg">
    <div className="flex-shrink-0 mt-0.5">
      <svg
        className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-purple-800 dark:text-purple-200">
        {message}
      </h3>
    </div>
  </div>
)

// Global notification export object
export const notify = {
  success: (message: string, description?: string) => {
    toast.custom(
      (t) => <SuccessNotification message={message} description={description} />,
      {
        duration: 4000,
      }
    )
  },
  error: (message: string, description?: string) => {
    toast.custom(
      (t) => <ErrorNotification message={message} description={description} />,
      {
        duration: 4000,
      }
    )
  },
  warning: (message: string, description?: string) => {
    toast.custom(
      (t) => <WarningNotification message={message} description={description} />,
      {
        duration: 4000,
      }
    )
  },
  info: (message: string, description?: string) => {
    toast.custom(
      (t) => <InfoNotification message={message} description={description} />,
      {
        duration: 4000,
      }
    )
  },
  loading: (message: string) => {
    return toast.custom(
      (t) => <LoadingNotification message={message} />,
      {
        duration: 60000, // longer duration for loading states
      }
    )
  },
  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId)
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    })
  },
}
