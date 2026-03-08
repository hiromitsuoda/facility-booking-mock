import React, { useState } from 'react'
import {
  Search,
  X,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  FileText,
  LayoutGrid,
  Building2,
  Car,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'

/* ─── Mini calendar helpers ─── */
const _now = new Date()
const CAL_TODAY = {
  year: _now.getFullYear(),
  month: _now.getMonth() + 1,
  day: _now.getDate(),
}
const CAL_DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土']

function buildCalGrid(year, month) {
  const firstDow = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysInPrev = new Date(year, month - 1, 0).getDate()
  const cells = []
  for (let d = firstDow - 1; d >= 0; d--) {
    cells.push({ day: daysInPrev - d, month: month === 1 ? 12 : month - 1, year: month === 1 ? year - 1 : year, otherMonth: true })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, otherMonth: false })
  }
  const remaining = 35 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, month: month === 12 ? 1 : month + 1, year: month === 12 ? year + 1 : year, otherMonth: true })
  }
  return cells
}

const FACILITY = {
  name: 'ひかりプラザ・セントラル',
  city: 'ひかり市',
  imageUrl: null,
  rooms: [
    { id: 1, name: 'メインホール', available: true },
    { id: 2, name: 'IT研修室', available: true },
    { id: 3, name: '第1会議室', available: true },
    { id: 4, name: '第2会議室', available: true },
    { id: 5, name: '多目的ホール', available: true },
    { id: 6, name: '研修室A', available: true },
    { id: 7, name: '展示室', available: true },
    { id: 8, name: '和室「さくら」', available: true },
  ],
}

const INITIAL_VISIBLE = 4

export default function FacilityListPage({ filters, setFilters, onViewAvailability }) {
  const [filterOpen, setFilterOpen] = useState(true)
  const [facilityInput, setFacilityInput] = useState('')
  const [showAllRooms, setShowAllRooms] = useState(false)

  // Mini calendar state
  const [calYear, setCalYear] = useState(CAL_TODAY.year)
  const [calMonth, setCalMonth] = useState(CAL_TODAY.month)
  const [calSelected, setCalSelected] = useState(null) // {year, month, day}

  function calPrevMonth() {
    if (calMonth === 1) { setCalMonth(12); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
    setCalSelected(null)
  }
  function calNextMonth() {
    if (calMonth === 12) { setCalMonth(1); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
    setCalSelected(null)
  }
  const calMaxDate = new Date(CAL_TODAY.year, CAL_TODAY.month - 1 + 2, CAL_TODAY.day)

  function isCalDisabled(cell) {
    if (cell.otherMonth) return true
    const d = new Date(cell.year, cell.month - 1, cell.day)
    const today = new Date(CAL_TODAY.year, CAL_TODAY.month - 1, CAL_TODAY.day)
    if (d < today || d > calMaxDate) return true
    if (d.getDay() === 2) return true // 火曜休館
    return false
  }

  function handleCalSelect(cell) {
    if (isCalDisabled(cell)) return
    const selected = { year: cell.year, month: cell.month, day: cell.day }
    setCalSelected(selected)
    onViewAvailability(FACILITY, null, selected)
  }
  const calCells = buildCalGrid(calYear, calMonth)

  const visibleRooms = showAllRooms
    ? FACILITY.rooms
    : FACILITY.rooms.slice(0, INITIAL_VISIBLE)

  const activeFilterTags = []
  if (filters.facility) activeFilterTags.push(`施設: ${filters.facility}`)
  if (filters.timeSlots.morning) activeFilterTags.push('利用時間帯: 午前')
  if (filters.timeSlots.afternoon) activeFilterTags.push('利用時間帯: 午後')
  if (filters.timeSlots.evening) activeFilterTags.push('利用時間帯: 夜間')

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      {/* Page title */}
      <div className="flex items-center justify-between mb-4 border-b-2 border-dashed border-navy-200 pb-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-navy-800">
          <LayoutGrid size={26} className="text-navy-700" />
          施設一覧・検索
        </h1>
        <button className="flex items-center gap-1 text-navy-600 text-sm hover:text-navy-400">
          <HelpCircle size={16} />
          <span>ヘルプ</span>
          <ExternalLink size={12} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-5">
        {/* ===== Left: Filter Panel ===== */}
        <aside className="w-full md:w-72 md:flex-shrink-0">
          <div className="rounded overflow-hidden border border-gray-300 shadow-sm">
            {/* Panel header */}
            <div className="bg-navy-700 text-white flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-1.5 font-semibold text-sm">
                <Search size={14} />
                絞り込み条件
              </div>
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className="flex items-center gap-1 text-xs hover:text-gold-300 transition-colors"
              >
                {filterOpen ? (
                  <>閉じる <ChevronUp size={13} /></>
                ) : (
                  <>開く <ChevronDown size={13} /></>
                )}
              </button>
            </div>

            {filterOpen && (
              <div className="bg-cream-50 p-3 space-y-4">
                {/* Active filter tags */}
                {activeFilterTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 bg-white border border-gray-200 rounded p-2 text-xs">
                    <span className="text-navy-700 underline cursor-pointer">
                      {activeFilterTags.join('、')}
                    </span>
                    <button
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          facility: '',
                          timeSlots: { morning: false, afternoon: false, evening: false },
                        }))
                      }
                      className="ml-auto text-gray-400 hover:text-gray-600"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}

                {/* 目的・場所 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-navy-700">
                    <LayoutGrid size={13} />
                    <span>目的・場所</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1.5">
                    {filters.facility && (
                      <span className="flex items-center gap-1 bg-navy-100 text-navy-800 rounded px-1.5 py-0.5 text-xs">
                        {filters.facility}
                        <button
                          onClick={() => setFilters((f) => ({ ...f, facility: '' }))}
                          className="hover:text-red-500"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    )}
                    <input
                      className="flex-1 outline-none text-xs bg-transparent min-w-0"
                      placeholder={filters.facility ? '' : '施設・エリアを入力'}
                      value={facilityInput}
                      onChange={(e) => setFacilityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && facilityInput) {
                          setFilters((f) => ({ ...f, facility: facilityInput }))
                          setFacilityInput('')
                        }
                      }}
                    />
                    <button
                      onClick={() => setFilters((f) => ({ ...f, facility: '' }))}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={13} />
                    </button>
                    <ChevronDown size={13} className="text-gray-400" />
                  </div>
                </div>

                {/* 利用日時 — インラインカレンダー */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-navy-700">
                    <Calendar size={13} />
                    <span>利用日時</span>
                  </div>

                  {/* ── 7列グリッドカレンダー ── */}
                  <div className="bg-white border border-gray-300 rounded overflow-hidden">
                    {/* 月ナビ */}
                    <div className="flex items-center bg-navy-700 text-white">
                      <button onClick={calPrevMonth} className="px-2 py-1.5 hover:bg-navy-600 transition-colors">
                        <ChevronLeft size={12} />
                      </button>
                      <div className="flex-1 text-center text-xs font-semibold py-1.5">
                        {calYear}年 {calMonth}月
                      </div>
                      <button onClick={calNextMonth} className="px-2 py-1.5 hover:bg-navy-600 transition-colors">
                        <ChevronRight size={12} />
                      </button>
                    </div>

                    {/* 曜日ヘッダー */}
                    <div className="grid grid-cols-7 bg-navy-600">
                      {CAL_DAY_NAMES.map((d, i) => (
                        <div
                          key={d}
                          className={`text-center text-[9px] font-semibold py-1 ${
                            i === 0 ? 'text-red-300' : i === 6 ? 'text-blue-200' : 'text-white'
                          }`}
                        >
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* 日付グリッド（7列×5行） */}
                    <div className="grid grid-cols-7">
                      {calCells.map((cell, idx) => {
                        const dow = idx % 7
                        const disabled = isCalDisabled(cell)
                        const isTuesday = !cell.otherMonth && new Date(cell.year, cell.month - 1, cell.day).getDay() === 2
                        const isToday = !cell.otherMonth && cell.year === CAL_TODAY.year && cell.month === CAL_TODAY.month && cell.day === CAL_TODAY.day
                        const isSelected = calSelected && !cell.otherMonth && cell.year === calSelected.year && cell.month === calSelected.month && cell.day === calSelected.day

                        let cls = 'text-[11px] min-h-[36px] py-1 text-center border-b border-r border-gray-100 leading-none transition-colors flex items-center justify-center '
                        if (disabled && isTuesday) {
                          cls += 'bg-red-50 text-red-300 cursor-default '
                        } else if (disabled) {
                          cls += 'text-gray-300 cursor-default '
                        } else if (isSelected) {
                          cls += 'bg-navy-700 text-white font-bold cursor-pointer '
                        } else if (isToday) {
                          cls += 'bg-yellow-100 font-bold cursor-pointer '
                          cls += dow === 0 ? 'text-red-500 ' : dow === 6 ? 'text-blue-600 ' : 'text-navy-800 '
                        } else {
                          cls += 'hover:bg-navy-50 cursor-pointer '
                          cls += dow === 0 ? 'text-red-500 ' : dow === 6 ? 'text-blue-600 ' : 'text-navy-800 '
                        }

                        return (
                          <button
                            key={idx}
                            disabled={disabled}
                            onClick={() => handleCalSelect(cell)}
                            className={cls}
                          >
                            {cell.day}
                          </button>
                        )
                      })}
                    </div>

                    {/* 選択中の日付表示 */}
                    {calSelected && (
                      <div className="bg-navy-50 border-t border-navy-200 px-2 py-1.5 text-[11px] text-navy-700 font-semibold text-center">
                        {calSelected.year}年{calSelected.month}月{calSelected.day}日 を選択中
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    日付をクリックするとその日の空き状況を表示します
                  </p>

                  {/* Time slot checkboxes */}
                  <div className="flex items-center gap-4 pl-1">
                    {['morning', 'afternoon', 'evening'].map((slot) => {
                      const labels = { morning: '午前', afternoon: '午後', evening: '夜間' }
                      return (
                        <label key={slot} className="flex items-center gap-1 text-xs cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="accent-navy-700"
                            checked={filters.timeSlots[slot]}
                            onChange={() =>
                              setFilters((f) => ({
                                ...f,
                                timeSlots: {
                                  ...f.timeSlots,
                                  [slot]: !f.timeSlots[slot],
                                },
                              }))
                            }
                          />
                          <span>{labels[slot]}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Other conditions link */}
                <div className="text-center">
                  <button className="flex items-center gap-1 text-navy-600 text-xs hover:underline mx-auto">
                    <Search size={12} />
                    ほかの条件検索
                    <ExternalLink size={10} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ===== Right: Facility List ===== */}
        <section className="flex-1 min-w-0">
          {/* Count row */}
          <div className="flex items-center justify-between bg-navy-100 border border-navy-200 rounded px-3 py-2 mb-3 text-sm">
            <span className="text-navy-800">
              件数&nbsp;<strong>{1}</strong>件&nbsp;
              <span className="text-gray-500">(空場{FACILITY.rooms.length}件)</span>
            </span>
            <button className="text-navy-600 text-xs hover:underline">
              全室場の空きを一括で確認
            </button>
          </div>

          {/* Multi-room comparison note */}
          <div className="text-right text-xs mb-3">
            <button className="flex items-center gap-1 text-navy-600 hover:underline ml-auto">
              <HelpCircle size={12} />
              複数室場(10件以内)の空きを一括で確認・比較できます。
            </button>
          </div>

          {/* Facility card */}
          <div className="bg-white border border-gray-200 rounded shadow-sm mb-1">
            {/* Facility header */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-100">
              {/* Building image placeholder */}
              <div className="w-24 h-20 rounded-full overflow-hidden border-2 border-navy-200 flex-shrink-0 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Building2 size={30} />
                  <div className="text-[9px] mt-0.5 font-semibold tracking-wide">PLAZA</div>
                </div>
              </div>

              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-0.5">{FACILITY.city}</div>
                <h2 className="text-xl font-bold text-navy-800 mb-3">{FACILITY.name}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewAvailability(FACILITY, null)}
                    className="flex items-center gap-1.5 bg-navy-700 hover:bg-navy-600 text-white text-sm px-3 py-1.5 rounded transition-colors"
                  >
                    <CalendarDays size={14} />
                    空き状況
                  </button>
                  <button className="flex items-center gap-1.5 border border-navy-300 text-navy-700 hover:bg-navy-50 text-sm px-3 py-1.5 rounded transition-colors">
                    <FileText size={14} />
                    案内
                  </button>
                </div>
              </div>

              <div className="self-start text-right">
                <button className="flex items-center gap-1 text-navy-600 text-xs hover:underline">
                  HP <ExternalLink size={10} />
                </button>
              </div>
            </div>

            {/* Room list */}
            <div>
              {visibleRooms.map((room, idx) => (
                <div
                  key={room.id}
                  className={`flex items-center gap-3 px-4 py-2.5 border-b border-dashed border-gray-100 hover:bg-cream-50 transition-colors ${
                    idx === visibleRooms.length - 1 && !showAllRooms && FACILITY.rooms.length > INITIAL_VISIBLE
                      ? ''
                      : ''
                  }`}
                >
                  {/* Status dot */}
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>

                  {/* Room name */}
                  <button
                    onClick={() => onViewAvailability(FACILITY, room)}
                    className="flex-1 text-left text-navy-600 hover:underline text-sm"
                  >
                    {room.name}
                  </button>

                  {/* 空き状況 button */}
                  <button
                    onClick={() => onViewAvailability(FACILITY, room)}
                    className="flex items-center gap-1.5 bg-navy-700 hover:bg-navy-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
                  >
                    <CalendarDays size={12} />
                    空き状況
                  </button>
                </div>
              ))}

              {/* Show more button */}
              {!showAllRooms && FACILITY.rooms.length > INITIAL_VISIBLE && (
                <div className="px-4 py-3">
                  <button
                    onClick={() => setShowAllRooms(true)}
                    className="flex items-center gap-2 border border-gray-300 rounded px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronDown size={14} />
                    残りの室場を表示 ({FACILITY.rooms.length - INITIAL_VISIBLE}件)
                    <span className="text-gray-400">···</span>
                  </button>
                </div>
              )}

              {showAllRooms && (
                <div className="px-4 py-3">
                  <button
                    onClick={() => setShowAllRooms(false)}
                    className="flex items-center gap-2 border border-gray-300 rounded px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronUp size={14} />
                    閉じる
                  </button>
                </div>
              )}
            </div>

            {/* Parking note */}
            <div className="flex items-center justify-end gap-1 px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
              <Car size={13} />
              <span>有：駐車場あり</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
