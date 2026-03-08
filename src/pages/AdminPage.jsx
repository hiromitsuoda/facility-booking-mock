import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'
import {
  ShieldCheck,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Inbox,
  ChevronDown,
  ChevronUp,
  QrCode,
  Copy,
  Check,
} from 'lucide-react'

const APP_URL = 'https://facility-booking-mock.vercel.app/'

const TIME_SLOT_LABELS = {
  morning: '午前（9:00〜12:00）',
  afternoon: '午後（13:00〜17:00）',
  evening: '夜間（18:00〜21:00）',
}

const SORT_KEYS = ['date', 'facility_name', 'room_name', 'created_at']

export default function AdminPage({ onDeleted }) {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [sortKey, setSortKey] = useState('date')
  const [sortAsc, setSortAsc] = useState(true)
  const [copied, setCopied] = useState(false)

  function handleCopyURL() {
    navigator.clipboard.writeText(APP_URL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('reservations')
      .select('*')
      .order('date', { ascending: true })
      .order('created_at', { ascending: true })

    if (err) {
      setError('予約データの取得に失敗しました。')
    } else {
      setReservations(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function handleDelete(id) {
    setDeletingId(id)
    const { error: err } = await supabase.from('reservations').delete().eq('id', id)
    if (err) {
      alert('削除に失敗しました。もう一度お試しください。')
    } else {
      setReservations((prev) => prev.filter((r) => r.id !== id))
      if (onDeleted) onDeleted()
    }
    setDeletingId(null)
    setConfirmId(null)
  }

  function toggleSort(key) {
    if (sortKey === key) {
      setSortAsc((v) => !v)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const sorted = [...reservations].sort((a, b) => {
    const va = a[sortKey] ?? ''
    const vb = b[sortKey] ?? ''
    return sortAsc ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0)
  })

  function SortIcon({ k }) {
    if (sortKey !== k) return <ChevronDown size={12} className="text-gray-400" />
    return sortAsc
      ? <ChevronUp size={12} className="text-white" />
      : <ChevronDown size={12} className="text-white" />
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      {/* Page title */}
      <div className="flex items-center justify-between mb-5 border-b-2 border-dashed border-navy-200 pb-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-navy-800">
          <ShieldCheck size={26} className="text-navy-700" />
          管理者画面 — 予約一覧
        </h1>
        <button
          onClick={fetchAll}
          className="flex items-center gap-1.5 border border-navy-300 text-navy-700 hover:bg-navy-50 px-3 py-1.5 rounded text-sm transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          更新
        </button>
      </div>

      {/* Stats bar */}
      <div className="bg-navy-100 border border-navy-200 rounded px-4 py-2 mb-4 text-sm text-navy-800">
        予約件数：<strong>{reservations.length}</strong> 件
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm text-red-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-gray-500 text-sm">読み込み中...</div>
      )}

      {/* Empty */}
      {!loading && !error && reservations.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
          <Inbox size={40} />
          <span className="text-sm">予約データはありません</span>
        </div>
      )}

      {/* Mobile: card list */}
      {!loading && sorted.length > 0 && (
        <div className="md:hidden space-y-3 mb-4">
          {sorted.map((r) => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-bold text-navy-800">{r.date}</span>
                  <span className="ml-2 text-xs text-gray-500">{TIME_SLOT_LABELS[r.time_slot] ?? r.time_slot}</span>
                </div>
                {confirmId === r.id ? null : (
                  <button
                    onClick={() => setConfirmId(r.id)}
                    className="flex items-center gap-1 text-red-500 border border-red-300 rounded px-3 py-2 text-xs min-h-[44px]"
                  >
                    <Trash2 size={13} />削除
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-700 space-y-0.5">
                <div><span className="text-gray-400 text-xs">室場：</span>{r.room_name}</div>
                <div><span className="text-gray-400 text-xs">氏名：</span>{r.user_name}</div>
                <div><span className="text-gray-400 text-xs">電話：</span>{r.phone}</div>
                <div><span className="text-gray-400 text-xs">目的：</span>{r.purpose}　{r.count}名</div>
                {r.notes && <div><span className="text-gray-400 text-xs">備考：</span>{r.notes}</div>}
              </div>
              {confirmId === r.id && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded p-3 flex flex-col gap-2">
                  <p className="text-xs text-red-700 font-medium flex items-center gap-1">
                    <AlertTriangle size={13} />
                    この予約を削除しますか？
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      className="flex-1 bg-red-600 text-white text-sm py-2.5 rounded font-semibold min-h-[44px] disabled:opacity-50"
                    >
                      {deletingId === r.id ? '削除中...' : '削除する'}
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="flex-1 border border-gray-300 text-gray-600 text-sm py-2.5 rounded min-h-[44px]"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Desktop: table */}
      {!loading && sorted.length > 0 && (
        <div className="hidden md:block overflow-x-auto rounded border border-gray-200 shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-navy-800 text-white">
                {[
                  { key: 'date', label: '日付' },
                  { key: 'facility_name', label: '施設' },
                  { key: 'room_name', label: '室場' },
                  { key: null, label: '時間帯' },
                  { key: null, label: '氏名' },
                  { key: null, label: '電話番号' },
                  { key: null, label: '目的' },
                  { key: null, label: '人数' },
                  { key: null, label: '備考' },
                  { key: 'created_at', label: '申請日時' },
                  { key: null, label: '操作' },
                ].map(({ key, label }, i) => (
                  <th
                    key={i}
                    className={`px-3 py-2.5 text-left font-semibold text-xs whitespace-nowrap border-r border-navy-700 last:border-0 ${
                      key ? 'cursor-pointer select-none hover:bg-navy-700' : ''
                    }`}
                    onClick={() => key && toggleSort(key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      {key && <SortIcon k={key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, idx) => (
                <React.Fragment key={r.id}>
                  <tr
                    className={`border-b border-gray-100 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-cream-50'
                    } hover:bg-navy-50 transition-colors`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap font-medium text-navy-800">
                      {r.date}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">{r.facility_name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">{r.room_name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                      {TIME_SLOT_LABELS[r.time_slot] ?? r.time_slot}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.user_name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-600">{r.phone}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-600">{r.purpose}</td>
                    <td className="px-3 py-2 text-center">{r.count}名</td>
                    <td className="px-3 py-2 text-gray-500 max-w-[160px] truncate">{r.notes || '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs">
                      {r.created_at ? new Date(r.created_at).toLocaleString('ja-JP') : '—'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {confirmId === r.id ? null : (
                        <button
                          onClick={() => setConfirmId(r.id)}
                          className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs border border-red-300 hover:border-red-500 rounded px-2 py-1 transition-colors mx-auto"
                        >
                          <Trash2 size={12} />
                          削除
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Inline confirm row */}
                  {confirmId === r.id && (
                    <tr className="bg-red-50 border-b border-red-200">
                      <td colSpan={11} className="px-4 py-2">
                        <div className="flex items-center gap-3 text-sm">
                          <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
                          <span className="text-red-700 font-medium">
                            {r.date}　{r.room_name}　{r.user_name} 様の予約を削除しますか？
                          </span>
                          <button
                            onClick={() => handleDelete(r.id)}
                            disabled={deletingId === r.id}
                            className="ml-auto bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-1.5 rounded font-semibold transition-colors disabled:opacity-50"
                          >
                            {deletingId === r.id ? '削除中...' : '削除する'}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs px-3 py-1.5 rounded transition-colors"
                          >
                            キャンセル
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Code panel */}
      <div className="mt-8 border border-gray-200 rounded-lg bg-white p-5 flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-shrink-0 p-2 border-2 border-gray-200 rounded-lg">
          <QRCodeSVG value={APP_URL} size={120} bgColor="#ffffff" fgColor="#1e293b" level="M" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start text-navy-800 font-bold mb-1">
            <QrCode size={18} />
            スマホで開く（QRコード）
          </div>
          <p className="text-xs text-gray-500 mb-3">
            カメラでQRコードを読み取ると、スマートフォンでこのシステムをすぐに開けます。
          </p>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2 max-w-sm">
            <span className="flex-1 text-xs text-gray-600 truncate">{APP_URL}</span>
            <button
              onClick={handleCopyURL}
              className="flex items-center gap-1 text-xs text-navy-700 hover:text-navy-900 font-medium flex-shrink-0 min-h-[44px] px-1"
            >
              {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              {copied ? 'コピー済' : 'コピー'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
