'use client'

import { AlertTriangle, Home, RotateCcw, Trash2 } from 'lucide-react'
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
        <div className='flex min-h-[60dvh] flex-col items-center justify-center gap-6 px-6'>
          <div className='bg-destructive/10 flex size-20 items-center justify-center rounded-3xl'>
            <AlertTriangle className='text-destructive size-9' />
          </div>
          <div className='text-center'>
            <p className='text-lg font-bold'>エラーが発生しました</p>
            <p className='text-muted-foreground mt-2 text-sm'>
              予期しないエラーが発生しました。再試行するか、ホームに戻ってください。
            </p>
            {this.state.error?.message && (
              <p className='bg-muted mt-3 rounded-lg px-3 py-2 font-mono text-xs break-all'>
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className='flex flex-wrap justify-center gap-3'>
            <Button variant='outline' onClick={() => this.setState({ hasError: false, error: null })}>
              <RotateCcw className='mr-2 size-4' />
              再試行
            </Button>
            <Button onClick={() => (window.location.href = '/')}>
              <Home className='mr-2 size-4' />
              ホームに戻る
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                localStorage.clear()
                sessionStorage.clear()
                window.location.href = '/'
              }}
            >
              <Trash2 className='mr-2 size-4' />
              キャッシュを削除
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
