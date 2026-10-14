"use client"

export type QuoteCustomerValues = {
  name: string
  taxId: string
  phone: string
  email: string
  city: string
  address: string
  notes: string
  privacyAccepted: boolean
}

type Props = {
  values: QuoteCustomerValues
  errors?: Record<string, string | undefined>
  disabled?: boolean
  onChange: (
    field: keyof QuoteCustomerValues,
    value: string | boolean,
  ) => void
}

const fieldClass = (hasError?: boolean) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-sm leading-6 text-[#1F2E53] outline-none transition focus:border-[#38A0A2] focus:ring-2 focus:ring-[#38A0A2]/10 sm:text-base ${
    hasError ? "border-red-500" : "border-[#DCE6EA]"
  }`

export default function QuoteCustomerForm({
  values,
  errors = {},
  disabled = false,
  onChange,
}: Props) {
  const error = (field: string) =>
    errors[field] ? (
      <p className="mt-1 text-sm font-medium text-red-600">{errors[field]}</p>
    ) : null

  return (
    <div>
      <div className="mb-7">
        <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#38A0A2]">
          BTL Marketing · Cotización
        </p>
        <h2 className="mt-2 text-3xl font-black text-[#1F2E53]">
          Solicitar cotización
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#6B7A90] md:text-base">
          Completa la siguiente información y uno de nuestros asesores se pondrá en contacto contigo.
        </p>
      </div>

      <section>
        <h3 className="border-b border-[#E7EEF1] pb-3 text-base font-black text-[#1F2E53]">
          Datos personales
        </h3>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-[#1F2E53]">
              Nombre completo *
            </label>
            <input
              type="text"
              value={values.name}
              disabled={disabled}
              autoComplete="name"
              placeholder="Ej: Juan Pérez López"
              onChange={(e) => onChange("name", e.target.value)}
              className={fieldClass(Boolean(errors.name))}
            />
            {error("name")}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#1F2E53]">
              Cédula o identificación fiscal *
            </label>
            <input
              type="text"
              value={values.taxId}
              disabled={disabled}
              maxLength={16}
              placeholder="001-010190-0000A"
              onChange={(e) => onChange("taxId", e.target.value)}
              className={fieldClass(Boolean(errors.taxId))}
            />
            {error("taxId")}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#1F2E53]">
              Teléfono *
            </label>
            <div
              className={`flex overflow-hidden rounded-xl border bg-white transition focus-within:border-[#38A0A2] focus-within:ring-2 focus-within:ring-[#38A0A2]/10 ${
                errors.phone ? "border-red-500" : "border-[#DCE6EA]"
              }`}
            >
              <span className="flex items-center border-r border-[#DCE6EA] bg-[#F5F9FB] px-4 text-sm font-bold text-[#52637A]">
                +505
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={values.phone}
                disabled={disabled}
                maxLength={9}
                autoComplete="tel"
                placeholder="8888-8888"
                onChange={(e) => onChange("phone", e.target.value)}
                className="w-full bg-white px-4 py-3 text-sm text-[#1F2E53] outline-none sm:text-base"
              />
            </div>
            {error("phone")}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-[#1F2E53]">
              Correo electrónico *
            </label>
            <input
              type="email"
              value={values.email}
              disabled={disabled}
              autoComplete="email"
              placeholder="nombre@correo.com"
              onChange={(e) => onChange("email", e.target.value)}
              className={fieldClass(Boolean(errors.email))}
            />
            {error("email")}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="border-b border-[#E7EEF1] pb-3 text-base font-black text-[#1F2E53]">
          Ubicación
        </h3>

        <div className="mt-5 grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-[#1F2E53]">
              Ciudad *
            </label>
            <input
              type="text"
              value={values.city}
              disabled={disabled}
              autoComplete="address-level2"
              placeholder="Ej: Managua"
              onChange={(e) => onChange("city", e.target.value)}
              className={fieldClass(Boolean(errors.city))}
            />
            {error("city")}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#1F2E53]">
              Dirección *
            </label>
            <input
              type="text"
              value={values.address}
              disabled={disabled}
              autoComplete="street-address"
              placeholder="Ej: Colonia Centroamérica, casa #123"
              onChange={(e) => onChange("address", e.target.value)}
              className={fieldClass(Boolean(errors.address))}
            />
            {error("address")}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="border-b border-[#E7EEF1] pb-3 text-base font-black text-[#1F2E53]">
          Detalles de la solicitud
        </h3>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-bold text-[#1F2E53]">
            Observaciones
          </label>
          <textarea
            rows={5}
            value={values.notes}
            disabled={disabled}
            placeholder="Agrega detalles adicionales sobre tu cotización."
            onChange={(e) => onChange("notes", e.target.value)}
            className={fieldClass(Boolean(errors.notes))}
          />
          {error("notes")}
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#1F2E53]">
          <input
            type="checkbox"
            checked={values.privacyAccepted}
            disabled={disabled}
            onChange={(e) =>
              onChange("privacyAccepted", e.target.checked)
            }
            className="mt-1 h-4 w-4 accent-[#21577B]"
          />
          <span>
            Acepto que mis datos personales sean guardados de acuerdo con la Política de privacidad
          </span>
        </label>
        {error("privacyAccepted")}

        <p className="mt-4 text-xs text-[#8492A6]">* Campos obligatorios</p>
      </section>
    </div>
  )
}
