export type FieldValidationResult = {
    isValid: boolean
    message: string
  }
  
  export type FormErrors = Record<string, string>
  
  export const cleanText = (value: string | null | undefined) => {
    return String(value ?? '').trim()
  }
  
  export const onlyDigits = (value: string | number | null | undefined) => {
    return String(value ?? '').replace(/\D/g, '')
  }
  
  /* =========================
     CAMPO REQUERIDO
  ========================= */
  
  export const validateRequired = (
    value: string | null | undefined,
    label = 'Campo'
  ): FieldValidationResult => {
    if (!cleanText(value)) {
      return {
        isValid: false,
        message: `${label} es requerido.`,
      }
    }
  
    return {
      isValid: true,
      message: '',
    }
  }
  
  /* =========================
     CORREO
  ========================= */
  
  export const validateEmail = (
    value: string | null | undefined,
    label = 'Correo electrónico'
  ): FieldValidationResult => {
    const email = cleanText(value)
  
    if (!email) {
      return {
        isValid: false,
        message: `${label} es requerido.`,
      }
    }
  
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        isValid: false,
        message: `${label} no tiene un formato válido.`,
      }
    }
  
    return {
      isValid: true,
      message: '',
    }
  }
  
  /* =========================
     TELÉFONO NICARAGUA
     Acepta:
     88888888
     8888-8888
     +505 8888-8888
     50588888888
  
     Normaliza a:
     8888-8888
  ========================= */
  
  export const normalizeNicaraguaPhone = (
    value: string | null | undefined
  ) => {
    let digits = onlyDigits(value)
  
    if (digits.startsWith('505') && digits.length === 11) {
      digits = digits.slice(3)
    }
  
    return digits.slice(0, 8)
  }
  
  export const formatNicaraguaPhone = (
    value: string | null | undefined
  ) => {
    const digits = normalizeNicaraguaPhone(value)
  
    if (digits.length <= 4) return digits
  
    return `${digits.slice(0, 4)}-${digits.slice(4)}`
  }
  
  export const validateNicaraguaPhone = (
    value: string | null | undefined,
    label = 'Teléfono'
  ): FieldValidationResult => {
    const digits = normalizeNicaraguaPhone(value)
  
    if (!digits) {
      return {
        isValid: false,
        message: `${label} es requerido.`,
      }
    }
  
    if (digits.length !== 8) {
      return {
        isValid: false,
        message: `${label} debe tener 8 dígitos.`,
      }
    }
  
    if (!/^[2578]/.test(digits)) {
      return {
        isValid: false,
        message: `${label} debe iniciar con 2, 5, 7 u 8.`,
      }
    }
  
    return {
      isValid: true,
      message: '',
    }
  }
  
  /* =========================
     CÉDULA NICARAGÜENSE
     Formato:
     000-000000-0000A
  ========================= */
  
  export const normalizeCedulaNI = (
    value: string | null | undefined
  ) => {
    return String(value ?? '')
      .trim()
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, '')
      .slice(0, 14)
  }
  
  export const formatCedulaNI = (
    value: string | null | undefined
  ) => {
    const clean = normalizeCedulaNI(value)
  
    const part1 = clean.slice(0, 3)
    const part2 = clean.slice(3, 9)
    const part3 = clean.slice(9, 13)
    const letter = clean.slice(13, 14)
  
    let formatted = part1
  
    if (part2) formatted += `-${part2}`
    if (part3) formatted += `-${part3}`
    if (letter) formatted += letter
  
    return formatted
  }
  
  export const validateCedulaNI = (
    value: string | null | undefined,
    label = 'Cédula'
  ): FieldValidationResult => {
    const cedula = formatCedulaNI(value)
  
    if (!cleanText(value)) {
      return {
        isValid: false,
        message: `${label} es requerida.`,
      }
    }
  
    if (!/^\d{3}-\d{6}-\d{4}[A-Z]$/.test(cedula)) {
      return {
        isValid: false,
        message: `${label} debe tener el formato 000-000000-0000A.`,
      }
    }
  
    return {
      isValid: true,
      message: '',
    }
  }
  
  /* =========================
     CONTRASEÑA
     Solo se usa si el formulario tiene contraseña
  ========================= */
  
  export const validatePassword = (
    value: string | null | undefined,
    label = 'Contraseña'
  ): FieldValidationResult => {
    const password = String(value ?? '')
  
    if (!password) {
      return {
        isValid: false,
        message: `${label} es requerida.`,
      }
    }
  
    if (password.length < 6) {
      return {
        isValid: false,
        message: `${label} debe tener al menos 6 caracteres.`,
      }
    }
  
    return {
      isValid: true,
      message: '',
    }
  }

  export const validateNewPassword = (
    value: string | null | undefined,
    label = 'Contraseña'
  ): FieldValidationResult => {
    const password = String(value ?? '')

    if (!password) {
      return {
        isValid: false,
        message: `${label} es requerida.`,
      }
    }

    if (password.length < 8) {
      return {
        isValid: false,
        message: `${label} debe tener al menos 8 caracteres.`,
      }
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return {
        isValid: false,
        message: `${label} debe incluir al menos una letra y un número.`,
      }
    }

    return {
      isValid: true,
      message: '',
    }
  }
  
  export const validatePasswordConfirmation = (
    password: string | null | undefined,
    confirmPassword: string | null | undefined
  ): FieldValidationResult => {
    if (!String(confirmPassword ?? '')) {
      return {
        isValid: false,
        message: 'Confirma tu contraseña.',
      }
    }
  
    if (String(password ?? '') !== String(confirmPassword ?? '')) {
      return {
        isValid: false,
        message: 'Las contraseñas no coinciden.',
      }
    }
  
    return {
      isValid: true,
      message: '',
    }
  }
  
  /* =========================
     HELPERS
  ========================= */
  
  export const addFieldError = (
    errors: FormErrors,
    field: string,
    validation: FieldValidationResult
  ) => {
    if (!validation.isValid) {
      errors[field] = validation.message
    }
  
    return errors
  }
  
  export const hasFormErrors = (errors: FormErrors) => {
    return Object.keys(errors).length > 0
  }