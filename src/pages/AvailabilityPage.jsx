import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import MiniCalendar from '../components/MiniCalendar'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  HelpCircle,
  X,
  LayoutGrid,
  Circle,
  ExternalLink,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   定数
───────────────────────────────────────────── */
const _now = new Date()
const TODAY = {
  year: _now.getFullYear(),
  month: _now.getMonth() + 1,
  day: _now.getDate(),
}
const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土']

// 予約可能期間：今日から2か月後の同日まで
function getMaxDate() {
  return new Date(TODAY.year, TODAY.month - 1 + 2, TODAY.day)
}

/* ─────────────────────────────────────────────
   ステータス判定
   'available' | 'full' | 'closed' | 'past' | 'locked'
───────────────────────────────────────────── */
function getStatusForCell(cell, reservedKeys, filters) {
  if (cell.otherMonth) return null

  const cellDate = new Date(cell.year, cell.month - 1, cell.day)
  const todayDate = new Date(TODAY.year, TODAY.month - 1, TODAY.day)

  // 過去
  if (cellDate < todayDate) return 'past'

  // 2か月超はロック
  if (cellDate > getMaxDate()) return 'locked'

  // 火曜日は休館日（getDay() === 2）
  if (cellDate.getDay() === 2) return 'closed'

  // Supabase 予約済みチェック
  const mm = String(cell.month).padStart(2, '0')
  const dd = String(cell.day).padStart(2, '0')
  const isoDate = `${cell.year}-${mm}-${dd}`
  const activeSlots = [
    filters.timeSlots.morning && 'morning',
    filters.timeSlots.afternoon && 'afternoon',
    filters.timeSlots.evening && 'evening',
  ].filter(Boolean)

  if (activeSlots.some((slot) => reservedKeys.has(`${isoDate}_${slot}`))) return 'full'

  return 'available'
}

/* ─────────────────────────────────────────────
   ステータスアイコン（3種 + past/locked）
───────────────────────────────────────────── */
function StatusMark({ status }) {
  switch (status) {
    case 'available':
      return <Circle size={20} className="text-green-500" strokeWidth={2.5} />
    case 'full':
      return <span className="text-lg font-bold text-gray-500">×</span>
    case 'closed':
      return (
        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-500 leading-none">
          休
        </span>
      )
    case 'past':
      return <span className="text-xs text-gray-300">－</span>
    case 'locked':
      return <span className="text-xs text-gray-300">－</span>
    default:
      return null
  }
}

/* ─────────────────────────────────────────────
   凡例（3種のみ）
───────────────────────────────────────────── */
function Legend() {
  return (
    <div className="border border-gray-300 rounded bg-white p-3 w-36">
      <div className="font-semibold text-sm text-navy-800 mb-2 pb-1 border-b border-gray-200">凡例</div>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-gray-700">
          <Circle size={15} className="text-green-500 flex-shrink-0" strokeWidth={2.5} />
          <span>予約可能</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-700">
          <span className="font-bold text-gray-500 text-sm w-4 text-center flex-shrink-0">×</span>
          <span>予約済</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-700">
          <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-red-100 text-red-500 leading-none flex-shrink-0">
            休
          </span>
          <span>休館日（火曜）</span>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-400 leading-relaxed">
        予約可能期間:<br />
        本日〜2か月後
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main AvailabilityPage
───────────────────────────────────────────── */
export default function AvailabilityPage({ facility, room, filters, onDateClick, refreshKey, initialDate }) {
  const [currentYear, setCurrentYear] = useState(initialDate?.year ?? TODAY.year)
  const [currentMonth, setCurrentMonth] = useState(initialDate?.month ?? TODAY.month)
  const [selectedDay, setSelectedDay] = useState(initialDate?.day ?? TODAY.day)
  const [reservedKeys, setReservedKeys] = useState(new Set())

  const facilityName = facility?.name ?? 'ひかりプラザ・セントラル'
  const roomNameForQuery = room?.name ?? 'メインホール'
  const roomName = room?.name ?? 'メインホール'

  // Supabase から予約データ取得
  useEffect(() => {
    async function fetchReservations() {
      const { data, error } = await supabase
        .from('reservations')
        .select('date, time_slot')
        .eq('facility_name', facilityName)
        .eq('room_name', roomNameForQuery)

      if (error) {
        console.error('予約データ取得エラー:', error)
        return
      }
      setReservedKeys(new Set(data.map((r) => `${r.date}_${r.time_slot}`)))
    }
    fetchReservations()
  }, [facilityName, roomNameForQuery, refreshKey])

  const timeLabel = [
    filters.timeSlots.morning && '午前',
    filters.timeSlots.afternoon && '午後',
    filters.timeSlots.evening && '夜間',
  ].filter(Boolean).join('・') || '午後'

  /* カレンダーグリッド生成 */
  function buildCalendarGrid(year, month) {
    const firstDow = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate()
    const cells = []

    for (let d = firstDow - 1; d >= 0; d--) {
      cells.push({ day: daysInPrevMonth - d, month: month - 1, year: month === 1 ? year - 1 : year, otherMonth: true })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, month, year, otherMonth: false })
    }
    const remaining = 35 - cells.length
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, month: month + 1, year: month === 12 ? year + 1 : year, otherMonth: true })
    }
    return cells
  }

  const cells = buildCalendarGrid(currentYear, currentMonth)

  function isToday(cell) {
    return !cell.otherMonth && cell.day === TODAY.day && cell.month === TODAY.month && cell.year === TODAY.year
  }

  function isSelected(cell) {
    return !cell.otherMonth && cell.day === selectedDay
  }

  function handleCellClick(cell) {
    if (cell.otherMonth) return
    const status = getStatusForCell(cell, reservedKeys, filters)
    if (status !== 'available') return
    setSelectedDay(cell.day)
    const dateStr = `${cell.year}年${cell.month}月${cell.day}日`
    onDateClick(dateStr)
  }

  function prevMonth() {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
    setSelectedDay(null)
  }

  function nextMonth() {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
    setSelectedDay(null)
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      {/* ページタイトル */}
      <div className="flex items-center justify-between mb-4 border-b-2 border-dashed border-navy-200 pb-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-navy-800">
          <LayoutGrid size={26} className="text-navy-700" />
          施設の空き状況
        </h1>
        <button className="flex items-center gap-1 text-navy-600 text-sm hover:text-navy-400">
          <HelpCircle size={16} />
          <span>ヘルプ</span>
          <ExternalLink size={12} />
        </button>
      </div>

      {/* 施設名バナー */}
      <div className="bg-navy-100 border border-navy-200 rounded px-4 py-2 mb-4">
        <span className="text-navy-800 font-bold text-lg underline">{facilityName}</span>
      </div>

      {/* 検索条件バー */}
      <div className="flex items-center justify-between bg-cream-50 border border-gray-200 rounded px-3 py-2 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-navy-700">
          <Search size={13} />
          <span>
            室場：<span className="text-navy-600 underline cursor-pointer">{roomName}</span>
            &ensp;、&ensp;利用時間帯：<span className="text-navy-600 underline cursor-pointer">{timeLabel}</span>
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <X size={14} />
        </button>
      </div>

      {/* メインコンテンツ：ミニカレンダー ＋ メインカレンダー ＋ 凡例 */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-start">

        {/* ── 左：ミニカレンダー（日付選択）— モバイルでは非表示 ── */}
        <aside className="hidden lg:block flex-shrink-0">
          <div className="text-xs font-semibold text-navy-700 mb-2">&#128197; 日付を選択</div>
          <MiniCalendar
            year={currentYear}
            month={currentMonth}
            selectedDay={selectedDay}
            reservedKeys={reservedKeys}
            filters={filters}
            onSelectDate={(y, m, d) => {
              setCurrentYear(y)
              setCurrentMonth(m)
              setSelectedDay(d)
            }}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
          <p className="text-[10px] text-gray-400 mt-2 w-44 leading-relaxed">
            赤点：予約済み日付<br />
            火曜日は休館日です
          </p>
        </aside>

        {/* ── 中央：メインカレンダー ── */}
        <div className="flex-1 min-w-0">
          <div className="border border-gray-300 rounded overflow-hidden shadow-sm">
            {/* 月ナビゲーション */}
            <div className="flex items-center bg-navy-800 text-white">
              <button onClick={prevMonth} className="flex items-center gap-1 px-4 py-2.5 hover:bg-navy-700 transition-colors text-sm">
                <ChevronLeft size={15} />
                {currentMonth === 1 ? 12 : currentMonth - 1}月
              </button>
              <div className="flex-1 text-center font-semibold text-base py-2.5">
                <select
                  className="bg-transparent text-white font-semibold outline-none cursor-pointer"
                  value={`${currentYear}-${currentMonth}`}
                  onChange={(e) => {
                    const [y, m] = e.target.value.split('-')
                    setCurrentYear(Number(y))
                    setCurrentMonth(Number(m))
                  }}
                >
                  {Array.from({ length: 3 }, (_, i) => {
                    const d = new Date(TODAY.year, TODAY.month - 1 + i)
                    return { year: d.getFullYear(), month: d.getMonth() + 1 }
                  }).map(({ year, month }) => (
                    <option key={`${year}-${month}`} value={`${year}-${month}`} className="text-black">
                      {year}年 {month}月
                    </option>
                  ))}
                </select>
              </div>
              <button onClick={nextMonth} className="flex items-center gap-1 px-4 py-2.5 hover:bg-navy-700 transition-colors text-sm">
                {currentMonth === 12 ? 1 : currentMonth + 1}月
                <ChevronRight size={15} />
              </button>
            </div>

            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 bg-navy-700">
              {DAY_NAMES.map((name, i) => (
                <div
                  key={name}
                  className={`text-center py-1.5 text-sm font-semibold ${
                    i === 0 ? 'text-red-300' : i === 6 ? 'text-blue-200' : 'text-white'
                  }`}
                >
                  {i === 0 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-red-300 text-red-300 text-xs">
                      {name}
                    </span>
                  ) : (
                    name
                  )}
                </div>
              ))}
            </div>

            {/* 日付グリッド */}
            <div className="grid grid-cols-7">
              {cells.map((cell, idx) => {
                const dow = idx % 7
                const status = getStatusForCell(cell, reservedKeys, filters)
                const today = isToday(cell)
                const selected = isSelected(cell) && cell.day === selectedDay
                const isClickable = status === 'available'

                // セル背景
                let cellBg = ''
                if (cell.otherMonth) cellBg = 'bg-gray-100'
                else if (status === 'closed') cellBg = 'bg-red-50'
                else if (status === 'past' || status === 'locked') cellBg = 'bg-gray-50'
                else if (selected && today) cellBg = 'bg-navy-200'
                else if (today) cellBg = 'bg-yellow-50'
                else if (selected) cellBg = 'bg-navy-100'
                else cellBg = 'bg-white'

                // 日付数字の色
                const dayColor = cell.otherMonth
                  ? 'text-gray-300'
                  : status === 'past' || status === 'locked'
                  ? 'text-gray-300'
                  : dow === 0
                  ? 'text-red-500'
                  : dow === 6
                  ? 'text-blue-600'
                  : 'text-navy-800'

                return (
                  <div
                    key={idx}
                    onClick={() => isClickable && handleCellClick(cell)}
                    className={`
                      border-b border-r border-gray-200 min-h-[72px] p-1.5 flex flex-col items-center
                      ${cellBg}
                      ${isClickable ? 'cursor-pointer hover:bg-green-50 transition-colors' : 'cursor-default'}
                    `}
                  >
                    <span className={`text-sm font-semibold mb-1 ${dayColor}`}>
                      {cell.otherMonth ? '' : cell.day}
                    </span>
                    <div className="flex items-center justify-center flex-1">
                      {!cell.otherMonth && <StatusMark status={status} />}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 選択日バー */}
            {selectedDay && (
              <div className="bg-yellow-100 text-navy-900 text-center py-1.5 text-sm font-semibold border-t border-yellow-200">
                {currentMonth}/{selectedDay}（{DAY_NAMES[new Date(currentYear, currentMonth - 1, selectedDay).getDay()]}）選択中
              </div>
            )}
          </div>

          {/* 運用ルール注記 */}
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-800">
            ※ 毎週火曜日は休館日です。予約可能期間は本日から2か月後までです。
          </div>
        </div>

        {/* ── 右：凡例（モバイルでは横並び） ── */}
        <aside className="w-full lg:flex-shrink-0 lg:w-auto">
          <div className="lg:hidden flex items-center gap-6 bg-white border border-gray-200 rounded px-4 py-2 text-xs text-gray-700">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-green-500 inline-block" />予約可能
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-gray-500">×</span>予約済
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-1 rounded bg-red-100 text-red-500">休</span>休館日（火曜）
            </span>
          </div>
          <div className="hidden lg:block">
            <Legend />
          </div>
        </aside>
      </div>
    </main>
  )
}
