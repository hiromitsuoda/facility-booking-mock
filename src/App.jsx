import React, { useState } from 'react'
import Header from './components/Header'
import FacilityListPage from './pages/FacilityListPage'
import AvailabilityPage from './pages/AvailabilityPage'
import AdminPage from './pages/AdminPage'
import ReservationModal from './components/ReservationModal'

export default function App() {
  const [currentPage, setCurrentPage] = useState('list')
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [reservationRefreshKey, setReservationRefreshKey] = useState(0)
  const [filters, setFilters] = useState({
    facility: 'ひかりプラザ・セントラル',
    date: '',
    timeSlots: { morning: false, afternoon: true, evening: false },
  })

  const breadcrumbs =
    currentPage === 'list'
      ? [{ label: 'ホーム', page: 'home' }, { label: '施設一覧・検索' }]
      : currentPage === 'availability'
      ? [
          { label: 'ホーム', page: 'home' },
          { label: '施設一覧・検索', page: 'list' },
          { label: '施設の空き状況' },
        ]
      : [
          { label: 'ホーム', page: 'home' },
          { label: '管理者画面' },
        ]

  const handleViewAvailability = (facility, room) => {
    setSelectedFacility(facility)
    setSelectedRoom(room)
    setCurrentPage('availability')
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    setShowModal(true)
  }

  const handleBreadcrumbClick = (page) => {
    if (page === 'list') {
      setCurrentPage('list')
      setSelectedFacility(null)
      setSelectedRoom(null)
    } else if (page === 'home') {
      setCurrentPage('list')
      setSelectedFacility(null)
      setSelectedRoom(null)
    }
  }

  const handleRefresh = () => setReservationRefreshKey((k) => k + 1)

  return (
    <div className="min-h-screen bg-cream-100">
      <Header
        breadcrumbs={breadcrumbs}
        onBreadcrumbClick={handleBreadcrumbClick}
        onAdminClick={() => setCurrentPage('admin')}
        isAdminPage={currentPage === 'admin'}
      />

      {currentPage === 'list' && (
        <FacilityListPage
          filters={filters}
          setFilters={setFilters}
          onViewAvailability={handleViewAvailability}
        />
      )}

      {currentPage === 'availability' && (
        <AvailabilityPage
          facility={selectedFacility}
          room={selectedRoom}
          filters={filters}
          onDateClick={handleDateClick}
          onBack={() => setCurrentPage('list')}
          refreshKey={reservationRefreshKey}
        />
      )}

      {currentPage === 'admin' && (
        <AdminPage onDeleted={handleRefresh} />
      )}

      {showModal && (
        <ReservationModal
          date={selectedDate}
          facility={selectedFacility}
          room={selectedRoom}
          filters={filters}
          onClose={() => setShowModal(false)}
          onReserved={handleRefresh}
        />
      )}
    </div>
  )
}
