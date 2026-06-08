import { useCallback, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import FormField from '../../components/ui/FormField'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { useForm } from '../../hooks/useForm'
import { useRegister, useAuth, useClearError } from '../../store/authStore'
import { validateEmail, validatePassword, validateName } from '../../utils/validators'
import { ROUTES } from '../../constants/routes'

const initialValues = { name: '', email: '', password: '' }
const rules = { name: validateName, email: validateEmail, password: validatePassword }

export default function Register() {
  const navigate = useNavigate()
  const register = useRegister()
  const { loading, error } = useAuth()
  const clearError = useClearError()
  const { values, errors, touched, handleChange, handleBlur, validate } =
    useForm(initialValues, rules)

  useEffect(() => {
    return () => clearError()
  }, [clearError])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!validate()) return
      try {
        await register(values.name, values.email, values.password)
        navigate(ROUTES.DASHBOARD)
      } catch {
        // error handled in store
      }
    },
    [validate, register, values.name, values.email, values.password, navigate]
  )

  return (
    <AuthLayout title="Create account" subtitle="Get started with a free account">
      <Alert message={error} onClose={clearError} />
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Name"
          name="name"
          placeholder="Your full name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.name}
          touched={touched.name}
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          touched={touched.email}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="Min. 6 characters"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          touched={touched.password}
        />
        <div style={{ marginTop: 8 }}>
          <Button type="submit" loading={loading} disabled={loading}>
            Create Account
          </Button>
        </div>
      </form>
      <p style={{ marginTop: 20, fontSize: 14, color: '#718096' }}>
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} style={{ color: '#3182ce' }}>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
