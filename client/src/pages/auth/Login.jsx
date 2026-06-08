import { useCallback, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import FormField from '../../components/ui/FormField'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { useForm } from '../../hooks/useForm'
import { useLogin, useAuth, useClearError } from '../../store/authStore'
import { validateEmail, validatePassword } from '../../utils/validators'
import { ROUTES } from '../../constants/routes'

const initialValues = { email: '', password: '' }
const rules = { email: validateEmail, password: validatePassword }

const features = [
  { icon: '💬', title: 'Real-time Chat', desc: 'Instant messaging with typing indicators and read receipts' },
  { icon: '📁', title: 'File Sharing', desc: 'Drag & drop files, images, and documents' },
  { icon: '🎥', title: 'Video Calls', desc: 'HD video calls with screen sharing' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Smart summaries, action items, and answers' },
]

export default function Login() {
  const navigate = useNavigate()
  const login = useLogin()
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
        await login(values.email, values.password)
        navigate(ROUTES.DASHBOARD)
      } catch {}
    },
    [validate, login, values.email, values.password, navigate]
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
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
            Welcome back
          </h1>
          <p style={{ color: '#64748b', margin: '0 0 28px', fontSize: 15 }}>
            Sign in to your account to continue
          </p>

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
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="password" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
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

            <div style={{ marginTop: 8 }}>
              <Button type="submit" loading={loading} disabled={loading}>
                Sign In
              </Button>
            </div>
          </form>

          <p style={{ marginTop: 20, fontSize: 14, color: '#64748b', textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} style={{ color: '#6366f1', fontWeight: 600 }}>
              Create one
            </Link>
          </p>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e9edf2', textAlign: 'center' }}>
            <Link to={ROUTES.HOME} style={{ fontSize: 13, color: '#94a3b8' }}>← Back to home</Link>
          </div>
        </div>
      </div>

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
          top: '-20%',
          right: '-20%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Team Collaboration, Simplified
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
            All your team communication in one place. Chat, share files, call, and stay organized.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 380 }}>
          {features.map((f, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 14,
              padding: '14px 18px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{f.icon}</span>
              <div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{f.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1, marginTop: 40, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>R</div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>J</div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>S</div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>A</div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
            Trusted by remote teams worldwide
          </p>
        </div>
      </div>
    </div>
  )
}
