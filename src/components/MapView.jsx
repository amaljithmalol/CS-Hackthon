import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { motion } from 'framer-motion'
import { Building2, HeartHandshake, LocateFixed, Navigation, Package, Utensils, UserRound } from 'lucide-react'
import Button from './Button'
import { cn } from '../utils/cn'
import { formatDistance } from '../utils/geo'
import { timeRemaining } from '../utils/formatDate'
import { ACTIVE_STATUSES } from '../utils/constants'

export const KOZHIKODE_CENTER = [11.2588, 75.7804]

const MARKER_STYLES = {
  donation: { color: '#12894c', ring: '#ffffff', size: 34, Icon: Utensils },
  ngo: { color: '#f68f16', ring: '#ffffff', size: 30, Icon: HeartHandshake },
  hotel: { color: '#0f6d3f', ring: '#ffffff', size: 30, Icon: Building2 },
  volunteer: { color: '#3b82f6', ring: '#ffffff', size: 28, Icon: UserRound },
  pickup: { color: '#0f472f', ring: '#ffffff', size: 28, Icon: Package },
}

function makeIcon(type, label) {
  const style = MARKER_STYLES[type] ?? MARKER_STYLES.donation
  const size = style.size
  return L.divIcon({
    className: '',
    html: `<span class="fb-marker" style="width:${size}px;height:${size}px;background:${style.color};border-color:${style.ring}">${label ?? ''}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 + 4],
  })
}

function Recenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, zoom ?? map.getZoom())
  }, [center, zoom, map])
  return null
}

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (!points || points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 14)
      return
    }
    map.fitBounds(L.latLngBounds(points).pad(0.18))
  }, [points, map])
  return null
}

function MapEvents({ onMapClick }) {
  useMapEvents({
    click: () => onMapClick?.(),
  })
  return null
}

function Legend({ types }) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-[500] flex flex-col gap-1.5 rounded-xl border border-forest-100 bg-white/95 p-3 shadow-lift backdrop-blur">
      {types.map((type) => {
        const style = MARKER_STYLES[type]
        const Icon = style.Icon
        return (
          <span key={type} className="flex items-center gap-2 text-xs font-medium text-forest-700">
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: style.color }}
            >
              <Icon className="h-3 w-3" aria-hidden="true" />
            </span>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        )
      })}
    </div>
  )
}

/**
 * Leaflet + OpenStreetMap view.
 * Accepts donations plus optional NGO / volunteer / hotel points.
 */
export default function MapView({
  donations = [],
  points = [],
  activeTypes = ['donation', 'ngo', 'volunteer'],
  center = KOZHIKODE_CENTER,
  zoom = 13,
  height = 'h-[520px]',
  onRequest,
  userLocation = null,
  className,
  showLegend = true,
}) {
  const [selected, setSelected] = useState(null)

  const markers = useMemo(() => {
    const list = []
    if (activeTypes.includes('donation')) {
      donations
        .filter((d) => ACTIVE_STATUSES.includes(d.status))
        .forEach((d) => {
          list.push({
            key: `d-${d.id}`,
            type: 'donation',
            position: [d.latitude, d.longitude],
            label: String(d.meals ?? ''),
            title: d.food_name,
            data: d,
          })
        })
    }
    points.forEach((p) => {
      if (!activeTypes.includes(p.type)) return
      list.push({ key: p.key ?? `${p.type}-${p.id}`, type: p.type, position: [p.latitude, p.longitude], title: p.name, data: p })
    })
    return list
  }, [donations, points, activeTypes])

  const positions = useMemo(() => markers.map((m) => m.position), [markers])
  const legendTypes = showLegend ? activeTypes.filter((t) => MARKER_STYLES[t]) : []

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-forest-100 shadow-soft', height, className)}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
        attributionControl
        aria-label="Map of food donations and partners"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} zoom={zoom} />
        {positions.length > 1 ? <FitBounds points={positions} /> : null}
        <MapEvents onMapClick={() => setSelected(null)} />

        {markers.map((marker) => (
          <Marker
            key={marker.key}
            position={marker.position}
            icon={makeIcon(marker.type, marker.label)}
            eventHandlers={{
              click: () => setSelected(marker.key),
              popupopen: () => setSelected(marker.key),
            }}
          >
            <Popup>
              <PopupContent
                marker={marker}
                onRequest={onRequest}
                onClose={() => setSelected(null)}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {legendTypes.length ? <Legend types={legendTypes} /> : null}

      <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-forest-100 bg-white text-forest-600 shadow-soft transition hover:bg-forest-50"
          aria-label="Clear map selection"
        >
          <LocateFixed className="h-4 w-4" aria-hidden="true" />
        </button>
        {userLocation ? (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={makeIcon('volunteer', '')} />
        ) : null}
      </div>

      {selected ? <span className="sr-only">Selected: {markers.find((m) => m.key === selected)?.title}</span> : null}
    </div>
  )
}

function PopupContent({ marker, onRequest, onClose }) {
  const data = marker.data
  if (marker.type === 'donation') {
    const deadline = timeRemaining(data.pickup_end)
    return (
      <div className="p-4">
        <img
          src={data.image}
          alt=""
          className="mb-3 h-28 w-full rounded-lg object-cover"
        />
        <p className="text-[11px] font-semibold tracking-wide text-brand-700 uppercase">{data.category_label}</p>
        <h3 className="mt-0.5 text-sm font-bold text-forest-900">{data.food_name}</h3>
        <p className="mt-0.5 text-xs text-forest-500">
          {data.donor?.name}
          {data.donor?.verified ? ' · Verified' : ''}
        </p>
        <dl className="mt-3 space-y-1 text-xs text-forest-700">
          <div className="flex justify-between gap-2">
            <dt className="text-forest-500">Quantity</dt>
            <dd className="font-semibold">
              {data.meals} meals · {data.quantity} {data.unit}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-forest-500">Location</dt>
            <dd className="max-w-[9rem] truncate text-right font-medium">{data.donor?.area ?? data.pickup_address}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-forest-500">Pickup</dt>
            <dd className="font-semibold text-amber-soft-700">{deadline.label}</dd>
          </div>
        </dl>
        <div className="mt-3 flex gap-2">
          {onRequest && data.status === 'posted' ? (
            <Button size="sm" className="flex-1" onClick={() => onRequest(data)}>
              Request
            </Button>
          ) : null}
          <Button size="sm" variant="subtle" className="flex-1" to={`/donations/${data.id}`}>
            Details
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <p className="text-[11px] font-semibold tracking-wide text-brand-700 uppercase">{marker.type}</p>
      <h3 className="mt-0.5 text-sm font-bold text-forest-900">{data.name ?? marker.title}</h3>
      {data.organization ? <p className="text-xs text-forest-500">{data.organization}</p> : null}
      {data.address ? <p className="mt-1 text-xs text-forest-600">{data.address}</p> : null}
      {data.donations !== undefined ? (
        <p className="mt-2 text-xs text-forest-700">
          <span className="font-semibold">{data.donations}</span> active donations nearby
        </p>
      ) : null}
      {data.availability ? <p className="mt-1 text-xs text-forest-700">Available: {data.availability}</p> : null}
      <div className="mt-3 flex gap-2">
        {data.link ? (
          <Button size="sm" variant="subtle" className="flex-1" to={data.link}>
            Open
          </Button>
        ) : null}
        <Button size="sm" variant="ghost" className="flex-1" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}

export { makeIcon, MARKER_STYLES }
export const formatMapDistance = formatDistance
export const MapHint = ({ children }) => (
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center gap-1.5 text-xs text-forest-500"
  >
    <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
    {children}
  </motion.p>
)
