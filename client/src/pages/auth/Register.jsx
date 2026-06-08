import { useCallback, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import FormField from '../../components/ui/FormField'
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

  useEffect(() => { return () => clearError() }, [clearError])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      await register(values.name, values.email, values.password)
      navigate(ROUTES.DASHBOARD)
    } catch {}
  }, [validate, register, values.name, values.email, values.password, navigate])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 48,
        backgroundColor: '#0d1117',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(9,105,218,0.08) 0%, transparent 60%)',
        }} />
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(9,105,218,0.05) 0%, transparent 50%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 24,
          }}>
            Free plan · No credit card
          </div>

          <h2 style={{ color: '#fff', fontSize: 32, fontWeight: 600, margin: '0 0 12px', letterSpacing: '-0.5px', lineHeight: 1.3 }}>
            Start collaborating<br />in minutes
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, maxWidth: 340, lineHeight: 1.6, margin: '0 0 40px' }}>
            Create your free account. Upgrade anytime for unlimited access.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: '50 AI queries per month', desc: 'Smart summaries and action items' },
              { label: 'Real-time collaboration', desc: 'Chat, share files, and call your team' },
              { label: 'Enterprise security', desc: 'End-to-end encrypted communication' },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 12,
                padding: '12px 16px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: '#3fb950',
                  marginTop: 6,
                  flexShrink: 0,
                }} />
                <div>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 1 }}>{f.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 12, alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((r) => (
              <span key={r} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>★</span>
            ))}
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginLeft: 8, fontStyle: 'italic' }}>
              "Best team platform we've used"
            </span>
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        backgroundColor: '#f6f8fa',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <Link to={ROUTES.HOME} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, textDecoration: 'none' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              backgroundColor: '#0d1117',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
            }}>
              TC
            </div>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#0d1117' }}>TeamCollab</span>
          </Link>

          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#0d1117', margin: '0 0 4px' }}>
            Create account
          </h1>
          <p style={{ color: '#656d76', margin: '0 0 28px', fontSize: 14 }}>
            Free, no credit card required
          </p>

          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #d0d7de',
            borderRadius: 8,
            padding: 24,
          }}>
            <Alert message={error} onClose={clearError} />
            <form onSubmit={handleSubmit} noValidate>
              <FormField
                label="Full name"
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
              <p style={{ fontSize: 12, color: '#656d76', margin: '0 0 12px', lineHeight: 1.5 }}>
                By creating an account, you agree to our{' '}
                <span style={{ color: '#0969da', cursor: 'pointer' }}>Terms</span> and{' '}
                <span style={{ color: '#0969da', cursor: 'pointer' }}>Privacy Policy</span>.
              </p>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: loading ? '#d0d7de' : '#0969da',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          </div>

          <p style={{ marginTop: 20, fontSize: 13, color: '#656d76', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} style={{ color: '#0969da', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
