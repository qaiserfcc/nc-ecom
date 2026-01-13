"use client"

import React, { createContext, useCallback, useContext, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export type ConfirmOptions = {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "default"
}

export type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

const defaultOptions: Required<ConfirmOptions> = {
  title: "Are you sure?",
  description: "This action cannot be undone.",
  confirmText: "Confirm",
  cancelText: "Cancel",
  variant: "default",
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>(defaultOptions)
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)

  const handleResolve = useCallback(
    (value: boolean) => {
      resolver?.(value)
      setResolver(null)
      setOpen(false)
    },
    [resolver]
  )

  const confirm = useCallback<ConfirmFn>((opts = {}) => {
    return new Promise<boolean>((resolve) => {
      setOptions({ ...defaultOptions, ...opts })
      setResolver(() => resolve)
      setOpen(true)
    })
  }, [])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        handleResolve(false)
      } else {
        setOpen(true)
      }
    },
    [handleResolve]
  )

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">{options.title || defaultOptions.title}</AlertDialogTitle>
            {options.description ? (
              <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                {options.description}
              </AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => handleResolve(false)}
              className="text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {options.cancelText || defaultOptions.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                options.variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }
              onClick={() => handleResolve(true)}
            >
              {options.confirmText || defaultOptions.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmDialogProvider")
  }
  return ctx
}
