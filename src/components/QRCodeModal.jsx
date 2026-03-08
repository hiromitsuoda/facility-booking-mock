import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, QrCode, Copy, Check } from 'lucide-react'

const APP_URL = 'https://facility-booking-mock.vercel.app/'

export default function QRCodeModal({ onClose }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(APP_URL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto p-6 flex flex-col items-center gap-4">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
          aria-label="閉じる"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 text-navy-800 font-bold text-lg">
          <QrCode size={20} />
          スマホで開く
        </div>

        <p className="text-xs text-gray-500 text-center">
          カメラでQRコードを読み取ると<br />スマホでこのページを開けます
        </p>

        {/* QR Code */}
        <div className="p-3 bg-white border-2 border-gray-200 rounded-lg">
          <QRCodeSVG
            value={APP_URL}
            size={180}
            bgColor="#ffffff"
            fgColor="#1e293b"
            level="M"
          />
        </div>

        {/* URL + copy */}
        <div className="w-full flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <span className="flex-1 text-xs text-gray-600 truncate">{APP_URL}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-navy-700 hover:text-navy-900 flex-shrink-0 font-medium"
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            {copied ? 'コピー済' : 'コピー'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-navy-800 hover:bg-navy-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
