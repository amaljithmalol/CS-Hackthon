import * as Icons from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../utils/cn'
import { CATEGORIES } from '../utils/constants'

export default function FoodCategory({ active, onChange, className, counts = {} }) {
  return (
    <div className={cn('w-full', className)}>
      <div
        className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1"
        role="group"
        aria-label="Filter by food category"
      >
        <CategoryChip
          label="All categories"
          active={active === 'all'}
          onClick={() => onChange('all')}
          index={0}
        />
        {CATEGORIES.map((category, index) => {
          const Icon = Icons[category.icon] ?? Icons.PackageOpen
          return (
            <CategoryChip
              key={category.id}
              label={category.label}
              icon={Icon}
              count={counts[category.id]}
              active={active === category.id}
              onClick={() => onChange(category.id)}
              index={index + 1}
            />
          )
        })}
      </div>
    </div>
  )
}

function CategoryChip({ label, icon: Icon, active, onClick, count, index = 0 }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition duration-200',
        active
          ? 'border-brand-600 bg-brand-600 text-white shadow-soft'
          : 'border-forest-200 bg-white text-forest-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700',
      )}
    >
      {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {label}
      {count ? (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
            active ? 'bg-white/20 text-white' : 'bg-forest-100 text-forest-600',
          )}
        >
          {count}
        </span>
      ) : null}
    </motion.button>
  )
}
