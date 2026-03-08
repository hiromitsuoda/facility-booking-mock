import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土']

const _now = new Date()
const TODAY = {
  year: _now.getFullYear(),
  month: _now.getMonth() + 1,
  day: _now.getDate(),
}

function buildGrid(year, month) {
  const firstDow = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysInPrev = new Date(year, month - 1, 0).getDate()
  const cells = []

  for (let d = firstDow - 1; d >= 0; d--) {
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    cells.push({ day: daysInPrev - d, month: prevMonth, year: prevYear, otherMonth: true })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, otherMonth: false })
  }
  const remaining = 35 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    cells.push({ day: d, month: nextMonth, year: nextYear, otherMonth: true })
  }
  return cells
}

export default function MiniCalendar({
  year,
  month,
  selectedDay,
  reservedKeys,
  filters,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}) {
  const cells = buildGrid(year, month)

  function isReservedDate(cell) {
    if (cell.otherMonth) return false
    const mm = String(cell.month).padStart(2, '0')
    const dd = String(cell.day).padStart(2, '0')
    const isoDate = `${cell.year}-${mm}-${dd}`
    const activeSlots = [
      filters.timeSlots.morning && 'morning',
      filters.timeSlots.afternoon && 'afternoon',
      filters.timeSlots.evening && 'evening',
    ].filter(Boolean)
    return activeSlots.some((slot) => reservedKeys.has(`${isoDate}_${slot}`))
  }

  const maxDate = new Date(TODAY.year, TODAY.month - 1 + 2, TODAY.day)

  function isPastDate(cell) {
    if (cell.otherMonth) return true
    const d = new Date(cell.year, cell.month - 1, cell.day)
    const today = new Date(TODAY.year, TODAY.month - 1, TODAY.day)
    // 過去・2か月超・火曜日は選択不可
    if (d < today || d > maxDate) return true
    if (d.getDay() === 2) return true // 火曜休館
    return false
  }

  return (
    <div className="border border-gray-300 rounded shadow-sm bg-white overflow-hidden w-44 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center bg-navy-700 text-white">
        <button
          onClick={onPrevMonth}
          className="px-2 py-1.5 hover:bg-navy-600 transition-colors"
          aria-label="前月"
        >
          <ChevronLeft size={12} />
        </button>
        <div className="flex-1 text-center text-xs font-semibold py-1.5">
          {year}年 {month}月
        </div>
        <button
          onClick={onNextMonth}
          className="px-2 py-1.5 hover:bg-navy-600 transition-colors"
          aria-label="翌月"
        >
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 bg-navy-600">
        {DAY_NAMES.map((d, i) => (
          <div
            key={d}
            className={`text-center text-[9px] py-0.5 font-semibold ${
              i === 0 ? 'text-red-300' : i === 6 ? 'text-blue-200' : 'text-white'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          const dow = idx % 7
          const past = isPastDate(cell)
          const reserved = isReservedDate(cell)
          const isSelected =
            !cell.otherMonth &&
            cell.day === selectedDay &&
            cell.month === month &&
            cell.year === year
          const isToday =
            !cell.otherMonth &&
            cell.day === TODAY.day &&
            cell.month === TODAY.month &&
            cell.year === TODAY.year

          let cellClass = 'text-[10px] py-1 text-center border-b border-r border-gray-100 transition-colors leading-none '

          if (cell.otherMonth || past) {
            cellClass += 'text-gray-300 cursor-default '
          } else if (isSelected) {
            cellClass += 'bg-navy-700 text-white font-bold cursor-pointer '
          } else if (isToday) {
            cellClass += 'bg-yellow-100 font-bold cursor-pointer '
            cellClass += reserved ? 'text-red-500 ' : (dow === 0 ? 'text-red-500 ' : dow === 6 ? 'text-blue-600 ' : 'text-navy-800 ')
          } else {
            cellClass += 'hover:bg-navy-50 cursor-pointer '
            if (reserved) {
              cellClass += 'text-red-500 font-semibold '
            } else if (dow === 0) {
              cellClass += 'text-red-500 '
            } else if (dow === 6) {
              cellClass += 'text-blue-600 '
            } else {
              cellClass += 'text-navy-800 '
            }
          }

          return (
            <button
              key={idx}
              disabled={cell.otherMonth || past}
              onClick={() => !cell.otherMonth && !past && onSelectDate(cell.year, cell.month, cell.day)}
              className={cellClass}
            >
              {cell.day}
              {reserved && !cell.otherMonth && !past && (
                <div className="w-1 h-1 rounded-full bg-red-400 mx-auto mt-0.5" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="px-2 py-1.5 border-t border-gray-100 flex items-center gap-2 text-[9px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
          予約済み
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-navy-700 inline-block" />
          選択中
        </span>
      </div>
    </div>
  )
}
