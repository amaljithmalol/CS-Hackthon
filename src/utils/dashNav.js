import {
  BarChart3,
  ClipboardList,
  HandHeart,
  HeartHandshake,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Map,
  MessageSquare,
  Package,
  PlusCircle,
  Settings,
  ShieldCheck,
  Truck,
  User,
  Users,
  UtensilsCrossed,
} from 'lucide-react'

export const hotelNav = [
  { to: '/hotel/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview', end: true },
  { to: '/hotel/create-donation', label: 'Create Donation', icon: PlusCircle, group: 'Donations' },
  { to: '/hotel/donations', label: 'Active & History', icon: Package, group: 'Donations' },
  { to: '/messages', label: 'Messages', icon: MessageSquare, group: 'Donations' },
  { to: '/hotel/impact', label: 'Impact', icon: BarChart3, group: 'Account' },
  { to: '/profile', label: 'Profile', icon: User, group: 'Account' },
  { to: '/settings', label: 'Settings', icon: Settings, group: 'Account' },
]

export const ngoNav = [
  { to: '/ngo/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview', end: true },
  { to: '/ngo/donations', label: 'Available Food', icon: UtensilsCrossed, group: 'Donations' },
  { to: '/ngo/requests', label: 'My Requests', icon: ClipboardList, group: 'Donations' },
  { to: '/ngo/collections', label: 'Active Collections', icon: Truck, group: 'Donations' },
  { to: '/ngo/beneficiaries', label: 'Beneficiaries', icon: HandHeart, group: 'Impact' },
  { to: '/ngo/volunteers', label: 'Volunteers', icon: Users, group: 'Impact' },
  { to: '/ngo/impact', label: 'Impact', icon: BarChart3, group: 'Impact' },
  { to: '/messages', label: 'Messages', icon: MessageSquare, group: 'Account' },
  { to: '/profile', label: 'Profile', icon: User, group: 'Account' },
  { to: '/settings', label: 'Settings', icon: Settings, group: 'Account' },
]

export const volunteerNav = [
  { to: '/volunteer/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview', end: true },
  { to: '/volunteer/tasks', label: 'Pickup Tasks', icon: ListChecks, group: 'Tasks' },
  { to: '/volunteer/tasks?tab=nearby', label: 'Nearby Donations', icon: Inbox, group: 'Tasks' },
  { to: '/volunteer/map', label: 'Map', icon: Map, group: 'Tasks' },
  { to: '/volunteer/impact', label: 'Impact', icon: BarChart3, group: 'Account' },
  { to: '/messages', label: 'Messages', icon: MessageSquare, group: 'Account' },
  { to: '/profile', label: 'Profile', icon: User, group: 'Account' },
  { to: '/settings', label: 'Settings', icon: Settings, group: 'Account' },
]

export const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview', end: true },
  { to: '/admin/donations', label: 'Donation Monitor', icon: Package, group: 'Operations' },
  { to: '/admin/approvals', label: 'Approvals', icon: ShieldCheck, group: 'Operations' },
  { to: '/admin/reports', label: 'Reports & Issues', icon: Inbox, group: 'Operations' },
  { to: '/admin/users', label: 'Users & Roles', icon: Users, group: 'Community' },
  { to: '/impact', label: 'Public Impact', icon: BarChart3, group: 'Community' },
  { to: '/messages', label: 'Messages', icon: MessageSquare, group: 'Community' },
  { to: '/profile', label: 'Profile', icon: User, group: 'Account' },
  { to: '/settings', label: 'Settings', icon: Settings, group: 'Account' },
]

export const roleHome = {
  hotel: '/hotel/dashboard',
  ngo: '/ngo/dashboard',
  volunteer: '/volunteer/dashboard',
  admin: '/admin/dashboard',
}

export const roleIcon = { hotel: UtensilsCrossed, ngo: HeartHandshake, volunteer: HandHeart, admin: ShieldCheck }
