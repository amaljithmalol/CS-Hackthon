const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const platformMonthly = [
  { month: 'Jan', meals: 640, kg: 480, donations: 62 },
  { month: 'Feb', meals: 780, kg: 590, donations: 74 },
  { month: 'Mar', meals: 910, kg: 720, donations: 88 },
  { month: 'Apr', meals: 1040, kg: 810, donations: 96 },
  { month: 'May', meals: 1180, kg: 940, donations: 108 },
  { month: 'Jun', meals: 1260, kg: 1010, donations: 119 },
  { month: 'Jul', meals: 1420, kg: 1160, donations: 128 },
  { month: 'Aug', meals: 1510, kg: 1240, donations: 134 },
  { month: 'Sep', meals: 1680, kg: 1390, donations: 148 },
  { month: 'Oct', meals: 1820, kg: 1520, donations: 156 },
  { month: 'Nov', meals: 2040, kg: 1690, donations: 171 },
  { month: 'Dec', meals: 2300, kg: 1920, donations: 188 },
]

export const categoryBreakdown = [
  { name: 'Cooked Meals', value: 32, color: '#12894c' },
  { name: 'Rice & Biryani', value: 22, color: '#f68f16' },
  { name: 'Bakery', value: 14, color: '#e0b23c' },
  { name: 'Fruits', value: 11, color: '#3ec87b' },
  { name: 'Vegetables', value: 9, color: '#0f6d3f' },
  { name: 'Packaged Food', value: 7, color: '#3b82f6' },
  { name: 'Beverages', value: 5, color: '#64957e' },
]

export const roleBreakdown = [
  { name: 'Hotels / Restaurants', value: 326, color: '#12894c' },
  { name: 'NGOs', value: 87, color: '#f68f16' },
  { name: 'Volunteers', value: 415, color: '#3b82f6' },
  { name: 'Admins', value: 4, color: '#64957e' },
]

export const cityBreakdown = [
  { city: 'Kozhikode', donations: 2140, meals: 6820, co2: 9800 },
  { city: 'Mahe', donations: 890, meals: 2410, co2: 4200 },
  { city: 'Thalassery', donations: 760, meals: 1980, co2: 3600 },
  { city: 'Kannur', donations: 640, meals: 1720, co2: 3100 },
  { city: 'Wayanad', donations: 420, meals: 1140, co2: 2400 },
  { city: 'Kottayam', donations: 380, meals: 980, co2: 2100 },
]

export const statusBreakdown = [
  { name: 'Completed', value: 7420, color: '#12894c' },
  { name: 'In progress', value: 318, color: '#f68f16' },
  { name: 'Available', value: 214, color: '#3b82f6' },
  { name: 'Cancelled', value: 96, color: '#cbd5e1' },
]

export const hotelMonthly = [
  { month: MONTHS[0], meals: 90, kg: 62 },
  { month: MONTHS[1], meals: 120, kg: 84 },
  { month: MONTHS[2], meals: 165, kg: 118 },
  { month: MONTHS[3], meals: 205, kg: 150 },
  { month: MONTHS[4], meals: 240, kg: 176 },
  { month: MONTHS[5], meals: 268, kg: 198 },
  { month: MONTHS[6], meals: 300, kg: 224 },
  { month: MONTHS[7], meals: 310, kg: 232 },
  { month: MONTHS[8], meals: 288, kg: 214 },
  { month: MONTHS[9], meals: 296, kg: 220 },
  { month: MONTHS[10], meals: 302, kg: 226 },
  { month: MONTHS[11], meals: 330, kg: 248 },
]

export const ngoMonthly = [
  { month: MONTHS[0], meals: 210, kg: 150 },
  { month: MONTHS[1], meals: 260, kg: 190 },
  { month: MONTHS[2], meals: 300, kg: 225 },
  { month: MONTHS[3], meals: 360, kg: 270 },
  { month: MONTHS[4], meals: 415, kg: 310 },
  { month: MONTHS[5], meals: 470, kg: 350 },
  { month: MONTHS[6], meals: 520, kg: 390 },
  { month: MONTHS[7], meals: 560, kg: 420 },
  { month: MONTHS[8], meals: 545, kg: 410 },
  { month: MONTHS[9], meals: 590, kg: 440 },
  { month: MONTHS[10], meals: 630, kg: 470 },
  { month: MONTHS[11], meals: 690, kg: 520 },
]

export const volunteerMonthly = [
  { month: MONTHS[0], tasks: 14, meals: 180 },
  { month: MONTHS[1], meals: 205, tasks: 16 },
  { month: MONTHS[2], meals: 240, tasks: 18 },
  { month: MONTHS[3], meals: 275, tasks: 20 },
  { month: MONTHS[4], meals: 310, tasks: 22 },
  { month: MONTHS[5], meals: 330, tasks: 24 },
  { month: MONTHS[6], meals: 360, tasks: 26 },
  { month: MONTHS[7], meals: 385, tasks: 27 },
  { month: MONTHS[8], meals: 400, tasks: 28 },
  { month: MONTHS[9], meals: 420, tasks: 30 },
  { month: MONTHS[10], meals: 455, tasks: 32 },
  { month: MONTHS[11], meals: 490, tasks: 34 },
]

export const volunteerLeaderboard = [
  { name: 'Farhan P', area: 'Mavoor', tasks: 47, meals: 610, rating: 4.9 },
  { name: 'Nikhil Raj', area: 'Mananchira', tasks: 34, meals: 520, rating: 4.8 },
  { name: 'Meera Krishnan', area: 'Kallayi', tasks: 28, meals: 430, rating: 4.9 },
  { name: 'Anjali Menon', area: 'Chevayoor', tasks: 21, meals: 315, rating: 4.7 },
  { name: 'Divya Suresh', area: 'Thamarassery', tasks: 12, meals: 190, rating: 4.6 },
]

export const donorLeaderboard = [
  { name: 'Green Leaf Restaurant', meals: 1420, kg: 1035, city: 'Kozhikode' },
  { name: 'Spice Garden Hotel', meals: 1210, kg: 890, city: 'Kozhikode' },
  { name: 'Malabar Kitchen', meals: 1040, kg: 760, city: 'Kozhikode' },
  { name: 'City Food Hub', meals: 970, kg: 705, city: 'Kozhikode' },
  { name: 'Coastline Restaurant', meals: 640, kg: 470, city: 'Kozhikode' },
]

export const foodSafetyTips = [
  {
    title: 'Only donate safe, suitable food',
    body: 'Food offered for donation must be wholesome, well presented and fit for human consumption. Discard anything spoiled, mouldy, burnt or previously served to customers.',
  },
  {
    title: 'Store food correctly',
    body: 'Hot food should be held above 60°C and cold food below 5°C until collection. Transport in clean, food-grade, closed containers.',
  },
  {
    title: 'Share preparation and expiry details',
    body: 'Accurate preparation time and consume-before time help NGOs and volunteers judge suitability and plan distribution.',
  },
  {
    title: 'Declare allergens clearly',
    body: 'Mention gluten, dairy, nuts, soy, eggs, seafood or any spice that may be present so recipients can make informed choices.',
  },
  {
    title: 'Collect within the stated window',
    body: 'Volunteers should arrive inside the pickup window. Late collection can reduce the safe shelf life of prepared food.',
  },
  {
    title: 'Never donate unsafe or spoiled food',
    body: 'Spoiled, expired or contaminated food must never be offered. When in doubt, do not list it — a wasted listing is safer than an unsafe meal.',
  },
]
