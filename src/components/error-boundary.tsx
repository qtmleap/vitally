'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className='flex min-h-[200px] flex-col items-center justify-center gap-4 p-8'>
          <AlertTriangle className='text-destructive size-10' />
          <div className='text-center'>
            <p className='font-medium'>エラーが発生しました</p>
            <p className='text-muted-foreground mt-1 text-sm'>{this.state.error?.message}</p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            <RotateCcw className='mr-1 size-4' />
            再試行
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
