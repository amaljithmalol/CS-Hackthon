export const APP = {
  name: 'FoodBridge',
  tagline: 'Connecting surplus food with people who need it.',
  altTagline: 'Save Food. Serve People. Build a Better Community.',
  email: 'hello@foodbridge.org',
  phone: '+91 80000 12345',
  address: 'FoodBridge Community Office, Marine Drive, Kozhikode, Kerala 673001',
}

export const ROLES = {
  HOTEL: 'hotel',
  NGO: 'ngo',
  VOLUNTEER: 'volunteer',
  ADMIN: 'admin',
}

/** Stable empty list, so `data?.items ?? EMPTY_LIST` keeps useMemo deps referentially equal. */
export const EMPTY_LIST = []

export const ROLE_LABELS = {
  hotel: 'Hotel / Restaurant',
  ngo: 'NGO',
  volunteer: 'Volunteer',
  admin: 'Admin',
}

export const ROLE_SHORT = {
  hotel: 'Hotel',
  ngo: 'NGO',
  volunteer: 'Volunteer',
  admin: 'Admin',
}

export const CATEGORIES = [
  { id: 'cooked-meals', label: 'Cooked Meals', icon: 'UtensilsCrossed', image: '/images/biriyani.svg' },
  { id: 'rice', label: 'Rice', icon: 'Wheat', image: '/images/fried-rice.svg' },
  { id: 'bread', label: 'Bread', icon: 'Sandwich', image: '/images/chapati.svg' },
  { id: 'bakery', label: 'Bakery', icon: 'Croissant', image: '/images/bakery.svg' },
  { id: 'fruits', label: 'Fruits', icon: 'Apple', image: '/images/fruits.svg' },
  { id: 'vegetables', label: 'Vegetables', icon: 'Carrot', image: '/images/vegetables.svg' },
  { id: 'packaged-food', label: 'Packaged Food', icon: 'Package', image: '/images/packaged.svg' },
  { id: 'beverages', label: 'Beverages', icon: 'CupSoda', image: '/images/beverages.svg' },
  { id: 'other', label: 'Other', icon: 'PackageOpen', image: '/images/food.svg' },
]

export const CATEGORY_MAP = CATEGORIES.reduce((acc, c) => ({ ...acc, [c.id]: c }), {})

export function getCategory(id) {
  return CATEGORY_MAP[id] ?? CATEGORY_MAP.other
}

/** Ordered donation lifecycle — drives the tracking timeline everywhere. */
export const DONATION_STATUSES = [
  { id: 'posted', label: 'Posted', hint: 'Donation is visible to nearby NGOs and volunteers.' },
  { id: 'requested', label: 'Request Accepted', hint: 'An NGO or volunteer has claimed this donation.' },
  { id: 'assigned', label: 'Volunteer Assigned', hint: 'A volunteer is assigned to collect the food.' },
  { id: 'collecting', label: 'Food Being Collected', hint: 'Volunteer is on the way to the pickup point.' },
  { id: 'collected', label: 'Food Collected', hint: 'Food has been picked up and is being transported.' },
  { id: 'delivered', label: 'Delivered', hint: 'Food has reached the distribution point.' },
  {id: 'completed', label: 'Completed', hint: 'Donation distributed. Thank you!' },
]

export const STATUS_INDEX = DONATION_STATUSES.reduce((acc, s, i) => ({ ...acc, [s.id]: i }), {})

export const ACTIVE_STATUSES = ['posted', 'requested', 'assigned', 'collecting', 'collected', 'delivered']

export const STATUS_TONE = {
  posted: 'info',
  requested: 'warning',
  assigned: 'warning',
  collecting: 'warning',
  collected: 'brand',
  delivered: 'brand',
  completed: 'success',
  cancelled: 'muted',
  expired: 'muted',
}

export const STATUS_LABEL = {
  posted: 'Available',
  requested: 'Request Accepted',
  assigned: 'Volunteer Assigned',
  collecting: 'Being Collected',
  collected: 'Collected',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

export const VERIFICATION = {
  pending: { label: 'Pending review', tone: 'warning' },
  verified: { label: 'Verified', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
}

export const DIET_TYPES = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain', 'Contains Both']

export const COMMON_ALLERGENS = [
  'Gluten / Wheat',
  'Dairy',
  'Nuts',
  'Soy',
  'Eggs',
  'Seafood',
  'Sesame',
  'Mustard',
  'Spices (hot)',
  'None',
]

export const PICKUP_STATUS = {
  unassigned: 'Unassigned',
  assigned: 'Assigned',
  enroute: 'En route',
  picked: 'Picked up',
  delivered: 'Delivered',
}

export const CITIES = [
  'Kozhikode',
  'Mahe',
  'Thalassery',
  'Kannur',
  'Wayanad',
  'Kottayam',
  'Kochi',
  'Thrissur',
]

export const AVAILABILITY = [
  { id: 'all', label: 'All status' },
  { id: 'posted', label: 'Available now' },
  { id: 'active', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
]

/** Rough CO2 factors (kg CO2e avoided per kg of food diverted). Illustrative only. */
export const CO2_PER_KG = 2.5
export const MEALS_PER_KG = 1.4
