import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  X,
  CalendarDays,
  User,
  Phone,
  FileText,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  LayoutGrid,
} from 'lucide-react'

const TIME_SLOTS = [
  { id: 'morning', label: '午前', sub: '9:00〜12:00' },
  { id: 'afternoon', label: '午後', sub: '13:00〜17:00' },
  { id: 'evening', label: '夜間', sub: '18:00〜21:00' },
]

const PURPOSES = [
  '会議・打ち合わせ',
  '研修・セミナー',
  '文化活動',
  'スポーツ・健康',
  '展示・発表会',
  '地域活動',
  'その他',
]

export default function ReservationModal({ date, facility, room, filters, onClose, onReserved }) {
  const facilityName = facility?.name ?? 'ひかりプラザ・セントラル'
  const roomName = room?.name ?? 'メインホール'

  const [form, setForm] = useState({
    name: '',
    phone: '',
    purpose: '',
    count: '',
    notes: '',
    timeSlot: filters.timeSlots.afternoon ? 'afternoon' : filters.timeSlots.morning ? 'morning' : 'afternoon',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [errors, setErrors] = useState({})

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = '氏名を入力してください'
    if (!form.phone.trim()) e.phone = '電話番号を入力してください'
    if (!form.purpose) e.purpose = '利用目的を選択してください'
    if (!form.count || isNaN(form.count) || Number(form.count) < 1) e.count = '正しい人数を入力してください'
    return e
  }

  // "2026年3月8日" → "2026-03-08"
  function parseDateToISO(jpDate) {
    const m = jpDate.match(/(\d+)年(\d+)月(\d+)日/)
    if (!m) return jpDate
    return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }

    setSubmitting(true)
    setSubmitError(null)

    // 重複チェック
    const isoDate = parseDateToISO(date)
    const { data: existing, error: checkError } = await supabase
      .from('reservations')
      .select('id')
      .eq('room_name', roomName)
      .eq('date', isoDate)
      .eq('time_slot', form.timeSlot)
      .limit(1)

    if (checkError) {
      console.error('重複チェックエラー:', checkError)
      setSubmitError('予約確認中にエラーが発生しました。もう一度お試しください。')
      setSubmitting(false)
      return
    }

    if (existing && existing.length > 0) {
      setSubmitError('この日時は既に予約されています。別の日時をお選びください。')
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('reservations').insert({
      facility_name: facilityName,
      room_name: roomName,
      date: parseDateToISO(date),
      time_slot: form.timeSlot,
      user_name: form.name,
      phone: form.phone,
      purpose: form.purpose,
      count: Number(form.count),
      notes: form.notes,
    })

    setSubmitting(false)

    if (error) {
      console.error('予約保存エラー:', error)
      setSubmitError('予約の保存に失敗しました。もう一度お試しください。')
      return
    }

    if (onReserved) onReserved()
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="bg-navy-800 text-white flex items-center justify-between px-5 py-3 rounded-t-lg">
          <div className="flex items-center gap-2 font-semibold">
            <CalendarDays size={16} />
            <span>予約登録</span>
          </div>
          <button onClick={onClose} className="hover:text-gold-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          /* ─── Success state ─── */
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <CheckCircle size={56} className="text-green-500" />
            <h2 className="text-xl font-bold text-navy-800">予約申請を受け付けました</h2>
            <p className="text-gray-600 text-sm">
              {date}（{form.timeSlot === 'morning' ? '午前' : form.timeSlot === 'afternoon' ? '午後' : '夜間'}）<br />
              {facilityName}　{roomName} の予約申請が完了しました。<br />
              確認メールをご登録の連絡先にお送りします。
            </p>
            <button
              onClick={onClose}
              className="mt-2 bg-navy-700 hover:bg-navy-600 text-white px-8 py-2 rounded text-sm font-semibold transition-colors"
            >
              閉じる
            </button>
          </div>
        ) : (
          /* ─── Form state ─── */
          <form onSubmit={handleSubmit} noValidate>
            {/* Reservation summary */}
            <div className="bg-cream-100 border-b border-gray-200 px-5 py-3 space-y-1">
              <div className="flex items-center gap-2 text-sm text-navy-800">
                <LayoutGrid size={14} className="text-navy-600 flex-shrink-0" />
                <span className="font-semibold">{facilityName}</span>
                <span className="text-gray-500">／</span>
                <span className="font-semibold">{roomName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-navy-700">
                <CalendarDays size={14} className="text-navy-600 flex-shrink-0" />
                <span>{date}</span>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Time slot */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800 mb-2">
                  <Clock size={14} />
                  利用時間帯 <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="flex gap-3">
                  {TIME_SLOTS.map((ts) => (
                    <label
                      key={ts.id}
                      className={`flex-1 border rounded-lg p-2.5 text-center cursor-pointer transition-all ${
                        form.timeSlot === ts.id
                          ? 'border-navy-600 bg-navy-50 text-navy-800'
                          : 'border-gray-300 hover:border-navy-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="timeSlot"
                        value={ts.id}
                        checked={form.timeSlot === ts.id}
                        onChange={set('timeSlot')}
                        className="sr-only"
                      />
                      <div className="font-semibold text-sm">{ts.label}</div>
                      <div className="text-xs text-gray-500">{ts.sub}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800 mb-1.5">
                  <User size={14} />
                  利用者氏名 <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-200 ${
                    errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="山田 太郎"
                  value={form.name}
                  onChange={set('name')}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800 mb-1.5">
                  <Phone size={14} />
                  連絡先電話番号 <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="tel"
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-200 ${
                    errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="042-000-0000"
                  value={form.phone}
                  onChange={set('phone')}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Purpose */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800 mb-1.5">
                  <FileText size={14} />
                  利用目的 <span className="text-red-500 ml-0.5">*</span>
                </label>
                <select
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-200 bg-white ${
                    errors.purpose ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  value={form.purpose}
                  onChange={set('purpose')}
                >
                  <option value="">選択してください</option>
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
              </div>

              {/* Count */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800 mb-1.5">
                  <Users size={14} />
                  利用人数 <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    className={`w-32 border rounded px-3 py-2 text-sm outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-200 ${
                      errors.count ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    value={form.count}
                    onChange={set('count')}
                  />
                  <span className="text-sm text-gray-600">名</span>
                </div>
                {errors.count && <p className="text-red-500 text-xs mt-1">{errors.count}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800 mb-1.5">
                  <MessageSquare size={14} />
                  備考
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-200 resize-none"
                  rows={3}
                  placeholder="特記事項があればご記入ください"
                  value={form.notes}
                  onChange={set('notes')}
                />
              </div>

              {/* Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800">
                ※ 予約は申請後、施設担当者の承認が必要です。承認完了後に確定となります。
              </div>
            </div>

            {/* Error message */}
            {submitError && (
              <div className="mx-5 mb-3 bg-red-50 border border-red-200 rounded p-3 text-xs text-red-700">
                {submitError}
              </div>
            )}

            {/* Footer buttons */}
            <div className="flex gap-3 px-5 pb-5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 rounded text-sm font-semibold transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-navy-800 hover:bg-navy-700 text-white py-2.5 rounded text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? '送信中...' : '予約申請する'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
