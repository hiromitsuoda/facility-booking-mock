import React, { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  HelpCircle,
  X,
  LayoutGrid,
  Phone,
  Building2,
  Clock,
  Target,
  Circle,
  Minus,
  BedDouble,
  Wrench,
  Users,
  ExternalLink,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   Deterministic pseudo-random status generator
   Status keys: 'available' | 'full' | 'closed' | 'past' |
                'phone' | 'counter' | 'lottery' | 'maintenance' |
                'open' | 'unavailable'
───────────────────────────────────────────── */
function generateDayStatus(year, month, day) {
  // Simple reproducible hash — same date always yields the same status
  const h = Math.abs(((year * 13 + month) * 31 + day) * 17) % 100
  if (h < 38) return 'available'
  if (h < 62) return 'full'
  if (h < 67) return 'closed'
  if (h < 72) return 'phone'
  if (h < 77) return 'counter'
  if (h < 82) return 'lottery'
  if (h < 88) return 'maintenance'
  if (h < 94) return 'open'
  return 'unavailable'
}

const _now = new Date()
const TODAY = {
  year: _now.getFullYear(),
  month: _now.getMonth() + 1,
  day: _now.getDate(),
}
const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土']

/* ─────────────────────────────────────────────
   Status icon/label renderer
───────────────────────────────────────────── */
function StatusMark({ status, size = 'md' }) {
  const sz = size === 'sm' ? 12 : 16
  const textCls = size === 'sm' ? 'text-[10px]' : 'text-xs'

  switch (status) {
    case 'available':
      return (
        <div className="flex flex-col items-center gap-0.5">
          <Circle size={sz} className="text-green-600" strokeWidth={2.5} />
        </div>
      )
    case 'full':
      return <span className={`font-bold text-gray-700 ${size === 'md' ? 'text-base' : 'text-sm'}`}>×</span>
    case 'closed':
      return (
        <div className="flex flex-col items-center gap-0.5">
          <BedDouble size={sz} className="text-teal-600" />
          <span className={`${textCls} text-teal-700 leading-none`}>休</span>
        </div>
      )
    case 'past':
      return (
        <div className="flex flex-col items-center gap-0.5">
          <Clock size={sz} className="text-gray-400" />
          <span className={`${textCls} text-gray-400 leading-none`}>終</span>
        </div>
      )
    case 'phone':
      return (
        <div className="flex flex-col items-center gap-0.5">
          <Phone size={sz} className="text-navy-600" />
        </div>
      )
    case 'counter':
      return (
        <div className="flex flex-col items-center gap-0.5">
          <Building2 size={sz} className="text-navy-600" />
        </div>
      )
    case 'lottery':
      return (
        <div className="flex flex-col items-center gap-0.5">
          <Target size={sz} className="text-red-500" />
        </div>
      )
    case 'maintenance':
      return (
        <div className="flex flex-col items-center gap-0.5">
          <Wrench size={sz} className="text-gray-500" />
        </div>
      )
    case 'open':
      return (
        <div className="flex flex-col items-center gap-0.5">
          <Users size={sz} className="text-blue-500" />
        </div>
      )
    case 'unavailable':
      return <Minus size={sz} className="text-gray-400" />
    default:
      return null
  }
}

/* ─────────────────────────────────────────────
   Legend panel
───────────────────────────────────────────── */
function Legend() {
  const items = [
    { icon: <Circle size={14} className="text-green-600" strokeWidth={2.5} />, label: '：利用可能' },
    { icon: <div className="flex items-center gap-0.5"><Clock size={12} className="text-gray-400" /><span className="text-[10px] text-gray-400">前</span></div>, label: '：公開前' },
    { icon: <Phone size={14} className="text-navy-600" />, label: '：電話受付' },
    { icon: <div className="flex items-center gap-0.5"><Clock size={12} className="text-gray-400" /><span className="text-[10px] text-gray-400">前</span></div>, label: '：受付前' },
    { icon: <Building2 size={14} className="text-navy-600" />, label: '：窓口受付' },
    { icon: <div className="flex items-center gap-0.5"><Clock size={12} className="text-gray-400" /><span className="text-[10px] text-gray-400">終</span></div>, label: '：公開終了' },
    { icon: <Target size={14} className="text-red-500" />, label: '：抽選申込可' },
    { icon: <div className="flex items-center gap-0.5"><Clock size={12} className="text-gray-400" /><span className="text-[10px] text-gray-400">終</span></div>, label: '：受付終了' },
    { icon: <Circle size={14} className="text-gray-400" strokeWidth={1.5} />, label: '：空き状況のみ' },
    { icon: <Minus size={14} className="text-gray-400" />, label: '：利用不可' },
    { icon: <span className="font-bold text-gray-700 text-sm">×</span>, label: '：空きなし' },
    { icon: <Users size={14} className="text-blue-500" />, label: '：一般開放' },
    { icon: <BedDouble size={14} className="text-teal-600" />, label: '：休館日' },
    { icon: <Wrench size={14} className="text-gray-500" />, label: '：設備保守' },
    { icon: <Target size={14} className="text-orange-400" />, label: '：抽選待ち' },
  ]

  return (
    <div className="border border-gray-300 rounded bg-white p-3 min-w-[200px]">
      <div className="font-semibold text-sm text-navy-800 mb-2 pb-1 border-b border-gray-200">凡例</div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-700">
            <span className="w-5 flex items-center justify-center flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main AvailabilityPage
───────────────────────────────────────────── */
export default function AvailabilityPage({ facility, room, filters, onDateClick }) {
  const [currentYear, setCurrentYear] = useState(TODAY.year)
  const [currentMonth, setCurrentMonth] = useState(TODAY.month)
  const [selectedDay, setSelectedDay] = useState(TODAY.day)

  const facilityName = facility?.name ?? 'ひかりプラザ・セントラル'
  const roomName = room?.name ?? 'メインホール'

  const timeLabel = [
    filters.timeSlots.morning && '午前',
    filters.timeSlots.afternoon && '午後',
    filters.timeSlots.evening && '夜間',
  ]
    .filter(Boolean)
    .join('・') || '午後'

  /* Build calendar grid */
  function buildCalendarGrid(year, month) {
    // First day of month (0=Sun)
    const firstDow = new Date(year, month - 1, 1).getDay()
    // Days in month
    const daysInMonth = new Date(year, month, 0).getDate()
    // Days in previous month
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate()

    const cells = []

    // Leading days from prev month
    for (let d = firstDow - 1; d >= 0; d--) {
      cells.push({ day: daysInPrevMonth - d, month: month - 1, year: month === 1 ? year - 1 : year, otherMonth: true })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, month, year, otherMonth: false })
    }

    // Trailing days to fill 5 rows (35 cells)
    const remaining = 35 - cells.length
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, month: month + 1, year: month === 12 ? year + 1 : year, otherMonth: true })
    }

    return cells
  }

  const cells = buildCalendarGrid(currentYear, currentMonth)

  function getStatus(cell) {
    const cellDate = new Date(cell.year, cell.month - 1, cell.day)
    const todayDate = new Date(TODAY.year, TODAY.month - 1, TODAY.day)
    if (cellDate < todayDate) return 'past'
    return generateDayStatus(cell.year, cell.month, cell.day)
  }

  function isToday(cell) {
    return (
      !cell.otherMonth &&
      cell.day === TODAY.day &&
      cell.month === TODAY.month &&
      cell.year === TODAY.year
    )
  }

  function isSelected(cell) {
    return !cell.otherMonth && cell.day === selectedDay && currentMonth === currentMonth
  }

  function handleCellClick(cell) {
    if (cell.otherMonth) return
    const status = getStatus(cell)
    if (status === 'past') return
    setSelectedDay(cell.day)
    if (status === 'available') {
      const dateStr = `${cell.year}年${cell.month}月${cell.day}日`
      onDateClick(dateStr)
    }
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

  const DOW_COLORS = ['text-red-500', 'text-navy-800', 'text-navy-800', 'text-navy-800', 'text-navy-800', 'text-navy-800', 'text-blue-600']

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      {/* Page title */}
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

      {/* Facility name banner */}
      <div className="bg-navy-100 border border-navy-200 rounded px-4 py-2 mb-4">
        <span className="text-navy-800 font-bold text-lg underline">{facilityName}</span>
      </div>

      {/* Active filter bar */}
      <div className="flex items-center justify-between bg-cream-50 border border-gray-200 rounded px-3 py-2 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-navy-700">
          <Search size={13} />
          <span>
            室場：<span className="text-navy-600 underline cursor-pointer">{roomName}</span>
            &ensp;、&ensp;利用時間帯：<span className="text-navy-600 underline cursor-pointer">{timeLabel}</span>
            &ensp;
            <ExternalLink size={11} className="inline text-gray-400" />
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <X size={14} />
        </button>
      </div>

      {/* Filter in-use badge */}
      <div className="flex items-center gap-3 mb-4">
        <button className="flex items-center gap-1.5 border border-navy-300 bg-white rounded px-3 py-1 text-xs text-navy-700 hover:bg-navy-50">
          <Search size={12} />
          絞り込み中
          <ExternalLink size={10} />
        </button>
        <button className="flex items-center gap-1 text-navy-600 text-xs hover:underline">
          <HelpCircle size={12} />
          使い方
        </button>
      </div>

      {/* Main content: Calendar + Legend */}
      <div className="flex gap-5 items-start">
        {/* Calendar */}
        <div className="flex-1 min-w-0">
          <div className="border border-gray-300 rounded overflow-hidden shadow-sm">
            {/* Month navigation */}
            <div className="flex items-center bg-navy-800 text-white">
              <button
                onClick={prevMonth}
                className="flex items-center gap-1 px-4 py-2.5 hover:bg-navy-700 transition-colors text-sm"
              >
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
                  {Array.from({ length: 24 }, (_, i) => {
                    const d = new Date(TODAY.year, TODAY.month - 1 + i)
                    return { year: d.getFullYear(), month: d.getMonth() + 1 }
                  }).map(({ year, month }) => (
                    <option key={`${year}-${month}`} value={`${year}-${month}`} className="text-black">
                      {year}年 {month}月
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={nextMonth}
                className="flex items-center gap-1 px-4 py-2.5 hover:bg-navy-700 transition-colors text-sm"
              >
                {currentMonth === 12 ? 1 : currentMonth + 1}月
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Day names header */}
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

            {/* Date grid */}
            <div className="grid grid-cols-7">
              {cells.map((cell, idx) => {
                const dow = idx % 7
                const status = getStatus(cell)
                const today = isToday(cell)
                const selected = isSelected(cell) && cell.day === selectedDay
                const isPast = status === 'past'
                const isClickable = !cell.otherMonth && !isPast

                let cellBg = ''
                if (cell.otherMonth) cellBg = 'bg-gray-100'
                else if (selected && today) cellBg = 'cal-cell-selected'
                else if (today) cellBg = 'cal-cell-today'
                else if (selected) cellBg = 'bg-navy-100'
                else cellBg = 'bg-white'

                const dayColor = cell.otherMonth
                  ? 'text-gray-400'
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
                      ${isClickable ? 'cal-cell' : ''}
                      ${isPast ? 'cursor-default' : ''}
                    `}
                  >
                    {/* Day number */}
                    <span className={`text-sm font-semibold mb-1 ${dayColor}`}>
                      {cell.day}
                    </span>

                    {/* Status icon */}
                    <div className="flex items-center justify-center flex-1">
                      <StatusMark status={status} size="md" />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Selected date bar */}
            {selectedDay && (
              <div className="bg-gold-300 text-navy-900 text-center py-1.5 text-sm font-semibold">
                {currentMonth}/{selectedDay}({DAY_NAMES[new Date(currentYear, currentMonth - 1, selectedDay).getDay()]})&nbsp;選択中
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <aside className="flex-shrink-0">
          <Legend />
        </aside>
      </div>
    </main>
  )
}
