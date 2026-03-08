import React from 'react'
import { Home, ChevronRight, LogIn, User, ShieldCheck } from 'lucide-react'

export default function Header({ breadcrumbs, onBreadcrumbClick, onAdminClick, isAdminPage }) {
  return (
    <header>
      {/* Top system bar */}
      <div className="bg-navy-800 text-white text-xs flex items-center justify-between px-4 py-1.5">
        <div className="flex items-center gap-1 font-semibold text-sm tracking-wide">
          <span className="text-gold-300">&#9632;</span>
          <span>施設予約管理システム</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onAdminClick}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-semibold text-xs transition-colors ${
              isAdminPage
                ? 'bg-yellow-400 text-navy-900'
                : 'bg-yellow-400 text-navy-900 hover:bg-yellow-300'
            }`}
          >
            <ShieldCheck size={13} />
            <span>管理者</span>
          </button>
          <button className="flex items-center gap-1 hover:text-gold-300 transition-colors">
            <LogIn size={13} />
            <span>ログイン</span>
          </button>
          <button className="flex items-center gap-1 hover:text-gold-300 transition-colors">
            <User size={13} />
            <span>利用者登録</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb nav bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <nav className="flex items-center gap-1 text-sm text-navy-700">
          <button
            onClick={() => onBreadcrumbClick('home')}
            className="flex items-center gap-1 hover:text-navy-500 transition-colors"
          >
            <Home size={14} />
            <span className="text-navy-600 hover:underline">ホーム</span>
          </button>
          {breadcrumbs.slice(1).map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight size={14} className="text-gray-400" />
              {crumb.page ? (
                <button
                  onClick={() => onBreadcrumbClick(crumb.page)}
                  className="text-navy-600 hover:underline transition-colors"
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
  )
}
