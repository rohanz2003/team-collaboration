import { useState, useCallback } from 'react'

export function useForm(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))
  }, [])

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    if (validationRules?.[name]) {
      const error = validationRules[name](values[name])
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }, [validationRules, values])

  const validate = useCallback(() => {
    const newErrors = {}
    let isValid = true

    for (const [key, rule] of Object.entries(validationRules || {})) {
      const error = rule(values[key])
      if (error) {
        newErrors[key] = error
        isValid = false
      }
    }

    setErrors(newErrors)
    setTouched(
      Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    )
    return isValid
  }, [validationRules, values])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    resetForm,
    setValues,
  }
}
