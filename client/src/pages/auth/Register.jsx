import { useCallback, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import FormField from '../../components/ui/FormField'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { useForm } from '../../hooks/useForm'
import { useRegister, useAuth, useClearError } from '../../store/authStore'
import { validateEmail, validatePassword, validateName } from '../../utils/validators'
import { ROUTES } from '../../constants/routes'

const initialValues = { name: '', email: '', password: '' }
const rules = { name: validateName, email: validateEmail, password: validatePassword }

const benefits = [
  { icon: '💬', title: 'Unlimited Messaging', desc: 'Real-time chat with your entire team' },
  { icon: '📁', title: 'File Sharing', desc: 'Share images, docs, and more instantly' },
  { icon: '🎥', title: 'Video & Audio Calls', desc: 'Face-to-face meetings with screen sharing' },
  { icon: '🤖', title: 'AI-Powered', desc: 'Smart summaries and action items' },
]

export default function Register() {
  const navigate = useNavigate()
  const register = useRegister()
  const { loading, error } = useAuth()
  const clearError = useClearError()
  const [showPassword, setShowPassword] = useState(false)
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
      } catch {}
    },
    [validate, register, values.name, values.email, values.password, navigate]
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-15%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Join TeamCollab Today
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
            Get started free. No credit card required. Upgrade anytime.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 380 }}>
          {benefits.map((b, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 14,
              padding: '12px 16px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{b.icon}</span>
              <div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 1 }}>{b.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1, marginTop: 32, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>★★★★★</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0, fontStyle: 'italic' }}>
            "The best team collaboration tool we've used"
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>C</div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>E</div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>M</div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>T</div>
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        backgroundColor: '#fff',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Link to={ROUTES.HOME} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, textDecoration: 'none' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
            }}>
              TC
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.5px' }}>TeamCollab</span>
          </Link>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            Create account
          </h1>
          <p style={{ color: '#64748b', margin: '0 0 28px', fontSize: 15 }}>
            Get started with a free account — no credit card needed
          </p>

          <Alert message={error} onClose={clearError} />

          <form onSubmit={handleSubmit} noValidate>
            <FormField
              label="Full Name"
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
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="password" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 14px',
                    borderRadius: 10,
                    border: `1.5px solid ${touched.password && errors.password ? '#ef4444' : '#e2e8f0'}`,
                    fontSize: 14,
                    outline: 'none',
                    backgroundColor: '#fff',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: '#94a3b8',
                    padding: 4,
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {touched.password && errors.password && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>{errors.password}</p>
              )}
            </div>

            <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.5 }}>
              By creating an account, you agree to our{' '}
              <span style={{ color: '#6366f1', cursor: 'pointer' }}>Terms of Service</span> and{' '}
              <span style={{ color: '#6366f1', cursor: 'pointer' }}>Privacy Policy</span>.
            </p>

            <Button type="submit" loading={loading} disabled={loading}>
              Create Account
            </Button>
          </form>

          <p style={{ marginTop: 20, fontSize: 14, color: '#64748b', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} style={{ color: '#6366f1', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e9edf2', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>✨ 50 AI queries/mo free</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>🔒 Secure & private</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
