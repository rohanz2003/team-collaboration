export const validateEmail = (email) => {
  if (!email) return 'Email is required'
  const re = /^\S+@\S+\.\S+$/
  if (!re.test(email)) return 'Invalid email format'
  return ''
}

export const validatePassword = (password) => {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  return ''
}

export const validateName = (name) => {
  if (!name) return 'Name is required'
  if (name.trim().length < 2) return 'Name must be at least 2 characters'
  return ''
}

export const validateForm = (fields, rules) => {
  const errors = {}
  let isValid = true
  for (const [key, value] of Object.entries(fields)) {
    const error = rules[key]?.(value)
    if (error) {
      errors[key] = error
      isValid = false
    }
  }
  return { errors, isValid }
}
