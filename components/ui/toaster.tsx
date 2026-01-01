'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, icon, variant, ...props }) {
        const resolvedIcon =
          icon ||
          (variant === 'destructive' ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : variant === 'default' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <Info className="h-5 w-5 text-primary" />
          ));

        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5">{resolvedIcon}</span>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
