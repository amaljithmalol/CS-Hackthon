import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function PageHeader({ eyebrow, title, description, breadcrumbs = [], action, className }) {
  return (
    <div className={`border-b border-forest-100 bg-white ${className ?? ''}`}>
      <div className="container-page py-8 sm:py-10">
        {breadcrumbs.length ? (
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex flex-wrap items-center gap-1 text-xs font-medium text-forest-500">
              {breadcrumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                  {index > 0 ? <ChevronRight className="h-3 w-3 text-forest-300" aria-hidden="true" /> : null}
                  {crumb.to ? (
                    <Link to={crumb.to} className="transition hover:text-brand-600">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-forest-700">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-2"
          >
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h1 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">{title}</h1>
            {description ? <p className="max-w-2xl text-sm text-forest-600 sm:text-base">{description}</p> : null}
          </motion.div>
          {action ? <div className="flex shrink-0 flex-wrap gap-3">{action}</div> : null}
        </div>
      </div>
    </div>
  )
}
