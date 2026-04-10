'use client'

import { Html5Qrcode } from 'html5-qrcode'
import { Camera, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import type { FoodInput } from '@/lib/schema'

type ScanResult = Omit<FoodInput, 'calories'> & { calories: number; barcode: string }

interface BarcodeScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResult: (result: ScanResult) => void
}

export function BarcodeScanner({ open, onOpenChange, onResult }: BarcodeScannerProps) {
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const readerRef = useRef<HTMLDivElement>(null)

  const stopScanner = useCallback(async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop()
    }
    scannerRef.current = null
    setScanning(false)
  }, [])

  const lookup = useCallback(
    async (code: string) => {
      setError('')
      setLoading(true)
      try {
        const result = await api.lookupBarcode({ queries: { code } })
        if (!result.name) throw new Error('not found')
        onResult(result)
        onOpenChange(false)
      } catch {
        setError(`「${code}」に該当する食品が見つかりませんでした`)
      } finally {
        setLoading(false)
      }
    },
    [onResult, onOpenChange]
  )

  const startScanner = useCallback(async () => {
    if (!readerRef.current || scannerRef.current) return
    setError('')

    try {
      const scanner = new Html5Qrcode(readerRef.current.id)
      scannerRef.current = scanner
      setScanning(true)

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        async (decodedText) => {
          await stopScanner()
          lookup(decodedText)
        },
        () => {}
      )
    } catch {
      setError('カメラにアクセスできません')
      setScanning(false)
    }
  }, [lookup, stopScanner])

  useEffect(() => {
    if (open) {
      setError('')
      const timer = setTimeout(startScanner, 300)
      return () => clearTimeout(timer)
    }
    stopScanner()
  }, [open, startScanner, stopScanner])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = manualCode.trim()
    if (code) {
      lookup(code)
      setManualCode('')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) stopScanner()
        onOpenChange(v)
      }}
    >
      <DialogContent className='max-w-sm gap-4'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Camera className='size-4' />
            バーコードスキャン
          </DialogTitle>
        </DialogHeader>

        <div
          id='barcode-reader'
          ref={readerRef}
          className='overflow-hidden rounded-xl bg-black'
          style={{ minHeight: scanning ? 240 : 0 }}
        />

        {loading && (
          <div className='flex items-center justify-center gap-2 py-2'>
            <Loader2 className='text-muted-foreground size-4 animate-spin' />
            <span className='text-muted-foreground text-sm'>検索中...</span>
          </div>
        )}

        {error && (
          <div className='space-y-2'>
            <p className='text-destructive text-center text-sm'>{error}</p>
            {!scanning && (
              <Button variant='outline' size='sm' className='w-full' onClick={startScanner}>
                もう一度スキャン
              </Button>
            )}
          </div>
        )}

        <div className='relative flex items-center'>
          <div className='border-border flex-1 border-t' />
          <span className='text-muted-foreground px-3 text-xs'>または手動入力</span>
          <div className='border-border flex-1 border-t' />
        </div>

        <form onSubmit={handleManualSubmit} className='flex gap-2'>
          <Input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder='バーコード番号を入力'
            inputMode='numeric'
            className='flex-1'
          />
          <Button type='submit' size='sm' disabled={!manualCode.trim() || loading}>
            検索
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
