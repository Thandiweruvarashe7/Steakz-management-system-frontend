import { useState, useEffect } from 'react'

type ToastVariant = 'default' | 'destructive' | 'success'

interface ToastData {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

let toastCount = 0

const listeners: Array<(toasts: ToastData[]) => void> = []
let memoryState: ToastData[] = []

function dispatch(toasts: ToastData[]) {
  memoryState = toasts
  listeners.forEach((listener) => listener(toasts))
}

export function toast({
  title,
  description,
  variant = 'default',
  duration = 4000,
}: Omit<ToastData, 'id'>) {
  const id = String(++toastCount)
  const newToast: ToastData = { id, title, description, variant, duration }
  dispatch([...memoryState, newToast])
  setTimeout(() => {
    dispatch(memoryState.filter((t) => t.id !== id))
  }, duration)
  return id
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>(memoryState)

  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      const index = listeners.indexOf(setToasts)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return { toasts, toast }
}
