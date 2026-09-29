import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ImagePlus, Info, Package, Sparkles, Truck, UtensilsCrossed, X } from 'lucide-react'
import Button from './Button'
import { Input, Select, Textarea, Checkbox, Field } from './Input'
import { CATEGORIES, COMMON_ALLERGENS, DIET_TYPES, getCategory } from '../utils/constants'
import { hasErrors, validate, validators } from '../utils/validation'
import { addHours, toInputDateTime } from '../utils/formatDate'

const IMAGE_MAX_BYTES = 1.5 * 1024 * 1024

const initialValues = {
  food_name: '',
  category: 'cooked-meals',
  quantity: '',
  unit: 'kg',
  meals: '',
  description: '',
  preparation_time: toInputDateTime(new Date()),
  consume_before: toInputDateTime(addHours(new Date(), 3)),
  pickup_address: '',
  pickup_start: toInputDateTime(new Date()),
  pickup_end: toInputDateTime(addHours(new Date(), 2)),
  diet: 'Vegetarian',
  allergens: ['None'],
  packaging_available: true,
  special_instructions: '',
  image: '',
}

export default function DonationForm({
  initialData,
  onSubmit,
  submitLabel = 'Publish Food Donation',
  onCancel,
  submitting = false,
}) {
  const [values, setValues] = useState(() => ({ ...initialValues, ...(initialData ?? {}) }))
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [preview, setPreview] = useState(initialData?.image ?? '')
  const fileRef = useRef(null)

  useEffect(() => {
    if (!initialData) return
    setValues((current) => ({ ...current, ...initialData }))
    setPreview(initialData.image ?? '')
  }, [initialData])

  const rules = useMemo(
    () => ({
      food_name: (v) => validators.required(v, 'Please enter the food name.') || validators.minLength(v, 3),
      category: (v) => validators.required(v, 'Please choose a food category.'),
      quantity: (v) => validators.number(v, { min: 0, label: 'Quantity' }),
      meals: (v) => validators.number(v, { min: 1, max: 2000, label: 'Number of meals' }),
      description: (v) => validators.minLength(v, 10, 'Please add a short description (at least 10 characters).'),
      preparation_time: (v) => validators.required(v, 'Please provide the preparation time.'),
      consume_before: (v) =>
        validators.required(v, 'Please provide the consume-before time.') ||
        (values.preparation_time && new Date(v) < new Date(values.preparation_time)
          ? 'Consume-before time must be after the preparation time.'
          : null),
      pickup_address: (v) => validators.minLength(v, 8, 'Please enter the full pickup address.'),
      pickup_start: (v) => validators.required(v, 'Please choose the pickup start time.'),
      pickup_end: (v) =>
        validators.required(v, 'Please choose the pickup end time.') ||
        (values.pickup_start && new Date(v) <= new Date(values.pickup_start)
          ? 'The pickup window must end after it starts.'
          : null),
    }),
    [values.pickup_start, values.preparation_time],
  )

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }))
    if (touched[field]) {
      setErrors((current) => ({ ...current, [field]: rules[field] ? rules[field](value) : null }))
    }
  }

  const handleBlur = (field) => {
    setTouched((current) => ({ ...current, [field]: true }))
    setErrors((current) => ({ ...current, [field]: rules[field] ? rules[field](values[field]) : null }))
  }

  const handleFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > IMAGE_MAX_BYTES) {
      setErrors((current) => ({ ...current, image: 'Please choose an image smaller than 1.5 MB.' }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result)
      setField('image', reader.result)
      setErrors((current) => ({ ...current, image: null }))
    }
    reader.onerror = () => {
      setErrors((current) => ({ ...current, image: 'We could not read that image. Please try another file.' }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate(values, rules)
    setErrors(nextErrors)
    setTouched(Object.keys(rules).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
    if (hasErrors(nextErrors)) {
      const firstField = Object.keys(nextErrors)[0]
      document.querySelector(`[name="${firstField}"]`)?.focus?.()
      return
    }
    onSubmit?.(values)
  }

  const toggleAllergen = (allergen) => {
    setField(
      'allergens',
      allergen === 'None'
        ? ['None']
        : values.allergens.includes(allergen)
          ? values.allergens.filter((a) => a !== allergen).concat('None').filter((a, i, arr) => arr.indexOf(a) === i)
          : values.allergens.filter((a) => a !== 'None').concat(allergen),
    )
  }

  const suggestedImage = getCategory(values.category).image

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <FormSection
        icon={UtensilsCrossed}
        title="Food details"
        description="Tell NGOs and volunteers exactly what food is available."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Food name"
            name="food_name"
            required
            placeholder="e.g. Vegetable Biriyani"
            value={values.food_name}
            onChange={(e) => setField('food_name', e.target.value)}
            onBlur={() => handleBlur('food_name')}
            error={touched.food_name ? errors.food_name : undefined}
          />
          <Select
            label="Food category"
            name="category"
            required
            value={values.category}
            onChange={(e) => setField('category', e.target.value)}
          >
            {CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </Select>
          <Input
            label="Quantity"
            name="quantity"
            type="number"
            min="0"
            step="0.5"
            required
            placeholder="e.g. 14"
            value={values.quantity}
            onChange={(e) => setField('quantity', e.target.value)}
            onBlur={() => handleBlur('quantity')}
            error={touched.quantity ? errors.quantity : undefined}
            wrapperClassName="sm:col-span-1"
          />
          <Select label="Unit" name="unit" value={values.unit} onChange={(e) => setField('unit', e.target.value)}>
            <option value="kg">Kilograms (kg)</option>
            <option value="litres">Litres</option>
            <option value="pieces">Pieces</option>
            <option value="portions">Portions</option>
            <option value="packs">Packs</option>
            <option value="boxes">Boxes</option>
          </Select>
          <Input
            label="Number of meals"
            name="meals"
            type="number"
            min="1"
            required
            placeholder="e.g. 40"
            hint="Roughly how many people this will feed."
            value={values.meals}
            onChange={(e) => setField('meals', e.target.value)}
            onBlur={() => handleBlur('meals')}
            error={touched.meals ? errors.meals : undefined}
          />
          <Input
            label="Preparation time"
            name="preparation_time"
            type="datetime-local"
            required
            value={values.preparation_time}
            onChange={(e) => setField('preparation_time', e.target.value)}
            onBlur={() => handleBlur('preparation_time')}
            error={touched.preparation_time ? errors.preparation_time : undefined}
          />
          <Textarea
            label="Food description"
            name="description"
            required
            rows={3}
            placeholder="How was it prepared? Is it served with chapati, rice or bread?"
            value={values.description}
            onChange={(e) => setField('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            error={touched.description ? errors.description : undefined}
            wrapperClassName="sm:col-span-2"
          />
        </div>
      </FormSection>

      <FormSection
        icon={Truck}
        title="Pickup details"
        description="Share where and when an NGO or volunteer can collect the food."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Pickup address"
            name="pickup_address"
            required
            placeholder="Street, landmark, city"
            value={values.pickup_address}
            onChange={(e) => setField('pickup_address', e.target.value)}
            onBlur={() => handleBlur('pickup_address')}
            error={touched.pickup_address ? errors.pickup_address : undefined}
            wrapperClassName="sm:col-span-2"
          />
          <Input
            label="Pickup start"
            name="pickup_start"
            type="datetime-local"
            required
            value={values.pickup_start}
            onChange={(e) => setField('pickup_start', e.target.value)}
            onBlur={() => handleBlur('pickup_start')}
            error={touched.pickup_start ? errors.pickup_start : undefined}
          />
          <Input
            label="Pickup end (deadline)"
            name="pickup_end"
            type="datetime-local"
            required
            value={values.pickup_end}
            onChange={(e) => setField('pickup_end', e.target.value)}
            onBlur={() => handleBlur('pickup_end')}
            error={touched.pickup_end ? errors.pickup_end : undefined}
          />
          <Input
            label="Consume before"
            name="consume_before"
            type="datetime-local"
            required
            hint="Food must be distributed safely after this time."
            value={values.consume_before}
            onChange={(e) => setField('consume_before', e.target.value)}
            onBlur={() => handleBlur('consume_before')}
            error={touched.consume_before ? errors.consume_before : undefined}
            wrapperClassName="sm:col-span-2"
          />
        </div>
      </FormSection>

      <FormSection
        icon={Sparkles}
        title="Additional information"
        description="Clear labelling helps recipients make safe and suitable choices."
      >
        <div className="space-y-5">
          <Field label="Food type" required>
            <div className="flex flex-wrap gap-2">
              {DIET_TYPES.map((diet) => (
                <button
                  key={diet}
                  type="button"
                  onClick={() => setField('diet', diet)}
                  aria-pressed={values.diet === diet}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    values.diet === diet
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-forest-200 bg-white text-forest-700 hover:border-brand-300 hover:bg-brand-50'
                  }`}
                >
                  {diet}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Contains allergens" hint="Select every allergen present so recipients are informed.">
            <div className="flex flex-wrap gap-2">
              {COMMON_ALLERGENS.map((allergen) => {
                const active = values.allergens.includes(allergen)
                return (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => toggleAllergen(allergen)}
                    aria-pressed={active}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                      active
                        ? 'border-amber-soft-400 bg-amber-soft-50 text-amber-soft-700'
                        : 'border-forest-200 bg-white text-forest-600 hover:border-amber-soft-300'
                    }`}
                  >
                    {allergen}
                  </button>
                )
              })}
            </div>
          </Field>

          <Checkbox
            label="Food-grade packaging is available"
            description="Sealed containers help volunteers transport hot or cold food safely."
            checked={values.packaging_available}
            onChange={(e) => setField('packaging_available', e.target.checked)}
          />

          <Textarea
            label="Special instructions"
            name="special_instructions"
            rows={3}
            placeholder="e.g. Use the rear entrance, ask for the duty manager, insulated bags preferred."
            value={values.special_instructions}
            onChange={(e) => setField('special_instructions', e.target.value)}
          />
        </div>
      </FormSection>

      <FormSection
        icon={ImagePlus}
        title="Food image"
        description="A clear photo helps volunteers identify the donation quickly."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-40 w-full overflow-hidden rounded-xl border border-forest-100 bg-forest-50 sm:w-56">
            <img
              src={preview || suggestedImage}
              alt="Preview of the food donation"
              className="h-full w-full object-cover"
            />
            {preview && preview !== suggestedImage ? (
              <button
                type="button"
                onClick={() => {
                  setPreview('')
                  setField('image', '')
                }}
                className="absolute top-2 right-2 rounded-lg bg-white/90 p-1.5 text-forest-600 shadow-soft transition hover:bg-white"
                aria-label="Remove uploaded image"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
          <div className="flex-1 space-y-3">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="sr-only" id="food-image" />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
              Upload image
            </Button>
            <p className="text-xs text-forest-500">PNG or JPG, up to 1.5 MB. A category image is used by default.</p>
            {errors.image ? (
              <p className="flex items-center gap-1.5 text-xs font-medium text-danger-600" role="alert">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                {errors.image}
              </p>
            ) : null}
          </div>
        </div>
      </FormSection>

      <div className="flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-forest-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
          By publishing, you confirm this food is safe, suitably stored and accurately described. See our{' '}
          <a href="/food-safety" className="font-semibold text-brand-700 underline">
            food safety guidelines
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" loading={submitting}>
            <Package className="h-4 w-4" aria-hidden="true" />
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-forest-100 bg-white p-5 shadow-soft sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-0.5 text-sm text-forest-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}
