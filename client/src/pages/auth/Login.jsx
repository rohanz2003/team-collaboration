import { useCallback, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import FormField from '../../components/ui/FormField'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { useForm } from '../../hooks/useForm'
import { useLogin, useAuth, useClearError } from '../../store/authStore'
import { validateEmail, validatePassword } from '../../utils/validators'
import { ROUTES } from '../../constants/routes'

const initialValues = { email: '', password: '' }
const rules = { email: validateEmail, password: validatePassword }

export default function Login() {
  const navigate = useNavigate()
  const login = useLogin()
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
        await login(values.email, values.password)
        navigate(ROUTES.DASHBOARD)
      } catch {
        // error handled in store
      }
    },
    [validate, login, values.email, values.password, navigate]
  )

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <Alert message={error} onClose={clearError} />
      <form onSubmit={handleSubmit} noValidate>
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
          placeholder="Enter your password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          touched={touched.password}
        />
        <div style={{ marginTop: 8 }}>
          <Button type="submit" loading={loading} disabled={loading}>
            Sign In
          </Button>
        </div>
      </form>
      <p style={{ marginTop: 20, fontSize: 14, color: '#718096' }}>
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} style={{ color: '#3182ce' }}>
          Create one
        </Link>
      </p>
    </AuthLayout>
  )
}
