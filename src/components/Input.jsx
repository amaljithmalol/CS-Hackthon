import { forwardRef, useId } from 'react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../utils/cn'

export function Field({ label, hint, error, required, htmlFor, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-forest-800">
          {label}
          {required ? <span className="ml-0.5 text-danger-500">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-danger-600" role="alert">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-forest-500">{hint}</p>
      ) : null}
    </div>
  )
}

export const Input = forwardRef(function Input(
  { label, hint, error, required, className, wrapperClassName, icon: Icon, id, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId} className={wrapperClassName}>
      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-forest-400"
            aria-hidden="true"
          />
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn('input-base', Icon && 'pl-9', error && 'border-danger-400 focus:border-danger-500 focus:ring-danger-500/20', className)}
          {...props}
        />
      </div>
    </Field>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, hint, error, required, className, wrapperClassName, id, rows = 4, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId} className={wrapperClassName}>
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={error ? 'true' : undefined}
        className={cn('input-base resize-y', error && 'border-danger-400 focus:border-danger-500 focus:ring-danger-500/20', className)}
        {...props}
      />
    </Field>
  )
})

export const Select = forwardRef(function Select(
  { label, hint, error, required, className, wrapperClassName, id, children, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId} className={wrapperClassName}>
      <select
        ref={ref}
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        className={cn('input-base cursor-pointer appearance-none bg-[length:1.1rem] pr-10', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364957e'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
        }}
        {...props}
      >
        {children}
      </select>
    </Field>
  )
})

export function PasswordInput({ label, hint, error, required, wrapperClassName, id, ...props }) {
  const [visible, setVisible] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId} className={wrapperClassName}>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? 'true' : undefined}
          className={cn('input-base pr-11', error && 'border-danger-400 focus:border-danger-500 focus:ring-danger-500/20')}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-2 text-forest-400 transition hover:bg-forest-50 hover:text-forest-700"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </Field>
  )
}

export function Checkbox({ label, description, id, className, ...props }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <input
        id={inputId}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-forest-300 text-brand-600 accent-brand-600 focus:ring-brand-500"
        {...props}
      />
      <label htmlFor={inputId} className="cursor-pointer text-sm text-forest-700">
        {label}
        {description ? <span className="mt-0.5 block text-xs text-forest-500">{description}</span> : null}
      </label>
    </div>
  )
}

export function RadioCard({ name, value, checked, onChange, title, description, icon: Icon, disabled }) {
  const id = `${name}-${value}`
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition',
        checked ? 'border-brand-500 bg-brand-50/70 ring-brand-500/30 ring-2' : 'border-forest-200 bg-white hover:border-brand-300',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="mt-1 h-4 w-4 shrink-0 accent-brand-600"
      />
      {Icon ? <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" /> : null}
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-forest-900">{title}</span>
        {description ? <span className="mt-0.5 block text-xs text-forest-500">{description}</span> : null}
      </span>
    </label>
  )
}

export default Input
