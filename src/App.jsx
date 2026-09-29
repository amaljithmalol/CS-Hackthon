import { Suspense, lazy, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollManager from './components/ScrollManager'
import ProtectedRoute from './components/ProtectedRoute'
import { LoadingBlock } from './components/LoadingSpinner'
import { useAuth } from './context/AuthContext'

import Home from './pages/Home'
import About from './pages/About'
import Donations from './pages/Donations'
import DonationDetails from './pages/DonationDetails'
import FoodMap from './pages/FoodMap'
import Impact from './pages/Impact'
import Contact from './pages/Contact'
import FoodSafety from './pages/FoodSafety'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Messages = lazy(() => import('./pages/Messages'))
const Notifications = lazy(() => import('./pages/Notifications'))
const HotelDashboard = lazy(() => import('./pages/HotelDashboard'))
const CreateDonation = lazy(() => import('./pages/CreateDonation'))
const HotelDonations = lazy(() => import('./pages/HotelDonations'))
const HotelImpact = lazy(() => import('./pages/HotelImpact'))
const NGODashboard = lazy(() => import('./pages/NGODashboard'))
const NGOAvailableFood = lazy(() => import('./pages/NGOAvailableFood'))
const NGORequests = lazy(() => import('./pages/NGORequests'))
const NGOCollections = lazy(() => import('./pages/NGOCollections'))
const NGOBeneficiaries = lazy(() => import('./pages/NGOBeneficiaries'))
const NGOVolunteers = lazy(() => import('./pages/NGOVolunteers'))
const NGOImpact = lazy(() => import('./pages/NGOImpact'))
const VolunteerDashboard = lazy(() => import('./pages/VolunteerDashboard'))
const VolunteerTasks = lazy(() => import('./pages/VolunteerTasks'))
const VolunteerMap = lazy(() => import('./pages/VolunteerMap'))
const VolunteerImpact = lazy(() => import('./pages/VolunteerImpact'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/AdminUsers'))
const AdminDonations = lazy(() => import('./pages/AdminDonations'))
const AdminApprovals = lazy(() => import('./pages/AdminApprovals'))
const AdminReports = lazy(() => import('./pages/AdminReports'))

function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}

export default function AppRoutes() {
  const location = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    document.title = 'FoodBridge — Connecting surplus food with people who need it'
  }, [location.pathname])

  return (
    <>
      <ScrollManager />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
            {/* Public */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/donations" element={<PublicLayout><Donations /></PublicLayout>} />
            <Route path="/donations/:id" element={<PublicLayout><DonationDetails /></PublicLayout>} />
            <Route path="/map" element={<PublicLayout><FoodMap /></PublicLayout>} />
            <Route path="/impact" element={<PublicLayout><Impact /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/food-safety" element={<PublicLayout><FoodSafety /></PublicLayout>} />
            <Route
              path="/privacy"
              element={<PublicLayout><Suspense fallback={<PageFallback />}><Privacy /></Suspense></PublicLayout>}
            />
            <Route
              path="/terms"
              element={<PublicLayout><Suspense fallback={<PageFallback />}><Terms /></Suspense></PublicLayout>}
            />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

            {/* Account */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PublicLayout><Suspense fallback={<PageFallback />}><Profile /></Suspense></PublicLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <PublicLayout><Suspense fallback={<PageFallback />}><Settings /></Suspense></PublicLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <PublicLayout><Suspense fallback={<PageFallback />}><Messages /></Suspense></PublicLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <PublicLayout><Suspense fallback={<PageFallback />}><Notifications /></Suspense></PublicLayout>
                </ProtectedRoute>
              }
            />

            {/* Hotel */}
            <Route path="/hotel/dashboard" element={<ProtectedRoute roles={['hotel']}><Suspense fallback={<PageFallback />}><HotelDashboard /></Suspense></ProtectedRoute>} />
            <Route path="/hotel/create-donation" element={<ProtectedRoute roles={['hotel']}><Suspense fallback={<PageFallback />}><CreateDonation /></Suspense></ProtectedRoute>} />
            <Route path="/hotel/donations" element={<ProtectedRoute roles={['hotel']}><Suspense fallback={<PageFallback />}><HotelDonations /></Suspense></ProtectedRoute>} />
            <Route path="/hotel/impact" element={<ProtectedRoute roles={['hotel']}><Suspense fallback={<PageFallback />}><HotelImpact /></Suspense></ProtectedRoute>} />

            {/* NGO */}
            <Route path="/ngo/dashboard" element={<ProtectedRoute roles={['ngo']}><Suspense fallback={<PageFallback />}><NGODashboard /></Suspense></ProtectedRoute>} />
            <Route path="/ngo/donations" element={<ProtectedRoute roles={['ngo']}><Suspense fallback={<PageFallback />}><NGOAvailableFood /></Suspense></ProtectedRoute>} />
            <Route path="/ngo/requests" element={<ProtectedRoute roles={['ngo']}><Suspense fallback={<PageFallback />}><NGORequests /></Suspense></ProtectedRoute>} />
            <Route path="/ngo/collections" element={<ProtectedRoute roles={['ngo']}><Suspense fallback={<PageFallback />}><NGOCollections /></Suspense></ProtectedRoute>} />
            <Route path="/ngo/beneficiaries" element={<ProtectedRoute roles={['ngo']}><Suspense fallback={<PageFallback />}><NGOBeneficiaries /></Suspense></ProtectedRoute>} />
            <Route path="/ngo/volunteers" element={<ProtectedRoute roles={['ngo']}><Suspense fallback={<PageFallback />}><NGOVolunteers /></Suspense></ProtectedRoute>} />
            <Route path="/ngo/impact" element={<ProtectedRoute roles={['ngo']}><Suspense fallback={<PageFallback />}><NGOImpact /></Suspense></ProtectedRoute>} />

            {/* Volunteer */}
            <Route path="/volunteer/dashboard" element={<ProtectedRoute roles={['volunteer']}><Suspense fallback={<PageFallback />}><VolunteerDashboard /></Suspense></ProtectedRoute>} />
            <Route path="/volunteer/tasks" element={<ProtectedRoute roles={['volunteer']}><Suspense fallback={<PageFallback />}><VolunteerTasks /></Suspense></ProtectedRoute>} />
            <Route path="/volunteer/map" element={<ProtectedRoute roles={['volunteer']}><Suspense fallback={<PageFallback />}><VolunteerMap /></Suspense></ProtectedRoute>} />
            <Route path="/volunteer/impact" element={<ProtectedRoute roles={['volunteer']}><Suspense fallback={<PageFallback />}><VolunteerImpact /></Suspense></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><Suspense fallback={<PageFallback />}><AdminDashboard /></Suspense></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><Suspense fallback={<PageFallback />}><AdminUsers /></Suspense></ProtectedRoute>} />
            <Route path="/admin/donations" element={<ProtectedRoute roles={['admin']}><Suspense fallback={<PageFallback />}><AdminDonations /></Suspense></ProtectedRoute>} />
            <Route path="/admin/approvals" element={<ProtectedRoute roles={['admin']}><Suspense fallback={<PageFallback />}><AdminApprovals /></Suspense></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><Suspense fallback={<PageFallback />}><AdminReports /></Suspense></ProtectedRoute>} />

            <Route path="/dashboard" element={<Navigate to={user ? `/${user.role}/dashboard` : '/login'} replace />} />
            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingBlock label="Loading…" />
    </div>
  )
}

