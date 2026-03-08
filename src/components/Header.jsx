import React, { useState } from 'react'
import { Home, ChevronRight, LogIn, User, ShieldCheck, QrCode } from 'lucide-react'
import QRCodeModal from './QRCodeModal'

export default function Header({ breadcrumbs, onBreadcrumbClick, onAdminClick, isAdminPage }) {
  const [showQR, setShowQR] = useState(false)

  return (
    <>
      <header>
        {/* Top system bar */}
        <div className="bg-navy-800 text-white text-xs flex items-center justify-between px-3 md:px-4 py-2">
          <div className="flex items-center gap-1 font-semibold text-sm tracking-wide min-w-0">
            <span className="text-gold-300 flex-shrink-0">&#9632;</span>
            <span className="truncate">施設予約管理システム</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* QR code button */}
            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-1 hover:text-gold-300 transition-colors min-h-[44px] px-1"
              aria-label="QRコードを表示"
              title="スマホで開く"
            >
              <QrCode size={15} />
              <span className="hidden sm:inline">QR</span>
            </button>

            {/* Admin button */}
            <button
              onClick={onAdminClick}
              className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 min-h-[44px] rounded font-semibold text-xs transition-colors ${
                isAdminPage
                  ? 'bg-yellow-400 text-navy-900'
                  : 'bg-yellow-400 text-navy-900 hover:bg-yellow-300'
              }`}
            >
              <ShieldCheck size={13} />
              <span>管理者</span>
            </button>

            <button className="hidden sm:flex items-center gap-1 hover:text-gold-300 transition-colors min-h-[44px]">
              <LogIn size={13} />
              <span>ログイン</span>
            </button>
            <button className="hidden sm:flex items-center gap-1 hover:text-gold-300 transition-colors min-h-[44px]">
              <User size={13} />
              <span>利用者登録</span>
            </button>
          </div>
        </div>

        {/* Breadcrumb nav bar */}
        <div className="bg-white border-b border-gray-200 px-3 md:px-4 py-2 overflow-x-auto">
          <nav className="flex items-center gap-1 text-sm text-navy-700 whitespace-nowrap">
            <button
              onClick={() => onBreadcrumbClick('home')}
              className="flex items-center gap-1 hover:text-navy-500 transition-colors min-h-[44px]"
            >
              <Home size={14} />
              <span className="text-navy-600 hover:underline">ホーム</span>
            </button>
            {breadcrumbs.slice(1).map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                {crumb.page ? (
                  <button
                    onClick={() => onBreadcrumbClick(crumb.page)}
                    className="text-navy-600 hover:underline transition-colors min-h-[44px]"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-gray-600">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </header>

      {showQR && <QRCodeModal onClose={() => setShowQR(false)} />}
    </>
  )
}
