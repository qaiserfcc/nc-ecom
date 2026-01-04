'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        style: {
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          color: '#1a1a1a',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(255, 215, 0, 0.2)',
        },
        className: 'sonner-toast',
      }}
      {...props}
    />
  )
}

export { Toaster }
