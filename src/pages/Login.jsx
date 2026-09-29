import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight, Leaf, Lock, Mail, ShieldCheck, Sparkles, Users } from 'lucide-react'
import Button from '../components/Button'
import Logo from '../components/Logo'
import { PasswordInput } from '../components/Input'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { homeRouteForRole } from '../services/auth'
import { hasErrors, validate, validators } from '../utils/validation'
import { ROLE_LABELS } from '../utils/constants'
import { cn } from '../utils/cn'

const HIGHLIGHTS = [
  { icon: Leaf, text: 'Reduce avoidable food waste every single day' },
  { icon: Users, text: 'Connect directly with verified NGOs and volunteers' },
  { icon: ShieldCheck, text: 'Transparent tracking from posted to distributed' },
  { icon: Sparkles, text: 'See the social and environmental impact you create' },
]

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const redirectTo = params.get('redirect') ?? location.state?.from

  const [values, setValues] = useState({ email: '', password: '', role: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (location.state?.from) {
      setFormError('Please sign in to continue to that page.')
    }
  }, [location.state])

  const rules = {
    email: validators.email,
    password: (v) => validators.required(v, 'Please enter your password.'),
    role: (v) => validators.required(v, 'Please choose your role.'),
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate(values, rules)
    setErrors(nextErrors)
    setFormError('')
    if (hasErrors(nextErrors)) return

    setLoading(true)
    try {
      const user = await login(values)
      toast.success(`Welcome back, ${user.organization_name ?? user.name}.`)
      navigate(redirectTo ?? homeRouteForRole(user.role), { replace: true })
    } catch (error) {
      setFormError(error?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-forest-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -top-24 -right-20 h-96 w-96 rounded-full bg-brand-600/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-amber-soft-500/15 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <Logo className="[&_span]:text-white" />
        </div>
        <div className="relative max-w-md space-y-6">
          <h2 className="text-3xl font-semibold text-white">
            Welcome back to the circle of people who refuse to waste food.
          </h2>
          <ul className="space-y-3">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.text} className="flex items-start gap-3 text-forest-100">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-300">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {item.text}
                </li>
              )
            })}
          </ul>
        </div>
        <p className="relative text-xs text-forest-300">
          FoodBridge · Connecting surplus food with people who need it.
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden">
            <Logo />
          </div>

          <h1 className="mt-8 text-2xl font-semibold sm:text-3xl lg:mt-0">Sign in to FoodBridge</h1>
          <p className="mt-2 text-sm text-forest-600">
            New here?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:underline">
              Create an account
            </Link>
          </p>

          {formError ? (
            <div
              className="mt-5 flex items-start gap-2 rounded-xl border border-danger-500/25 bg-danger-50 p-3.5 text-sm text-danger-700"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-forest-800">
                I am signing in as
              </label>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Select your role">
                {['hotel', 'ngo', 'volunteer', 'admin'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setValues((v) => ({ ...v, role }))}
                    aria-pressed={values.role === role}
                    className={cn(
                      'rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                      values.role === role
                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-brand-500/25 ring-2'
                        : 'border-forest-200 bg-white text-forest-600 hover:border-brand-300',
                    )}
                  >
                    {ROLE_LABELS[role]}
                  </button>
                ))}
              </div>
              {errors.role ? (
                <p className="mt-1.5 text-xs font-medium text-danger-600" role="alert">
                  {errors.role}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-forest-800">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-forest-400" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                  placeholder="you@example.com"
                  className={cn('input-base pl-10', errors.email && 'border-danger-400')}
                  aria-invalid={errors.email ? 'true' : undefined}
                />
              </div>
              {errors.email ? (
                <p className="mt-1.5 text-xs font-medium text-danger-600" role="alert">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div>
              <PasswordInput
                id="password"
                label="Password"
                autoComplete="current-password"
                value={values.password}
                onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
                placeholder="••••••••"
                error={errors.password}
                required
              />
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() =>
                    toast.info('Password reset is handled by your authentication provider once a backend is connected.')
                  }
                  className="text-xs font-semibold text-brand-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Sign in
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-forest-500">
            <Lock className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
            Sessions use short-lived tokens. Passwords are never stored in your browser.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
