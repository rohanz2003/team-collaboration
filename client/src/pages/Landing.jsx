import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 48px',
    borderBottom: '1px solid #e9edf2',
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 22,
    fontWeight: 800,
    color: '#1a1a2e',
    letterSpacing: '-0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  },
  navLink: {
    fontSize: 14,
    fontWeight: 500,
    color: '#475569',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'color 0.15s',
  },
  headerBtns: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  btnOutline: {
    padding: '8px 20px',
    borderRadius: 8,
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#fff',
    color: '#475569',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.15s',
  },
  btnPrimary: {
    padding: '8px 20px',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'opacity 0.15s',
  },
  hero: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0f0ff 100%)',
    textAlign: 'center',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 16px',
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    color: '#6366f1',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: 800,
    color: '#1a1a2e',
    margin: '0 0 20px',
    lineHeight: 1.1,
    letterSpacing: '-1.5px',
    maxWidth: 720,
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: 18,
    color: '#64748b',
    lineHeight: 1.6,
    margin: '0 0 40px',
    maxWidth: 540,
  },
  heroBtns: {
    display: 'flex',
    gap: 16,
  },
  btnLarge: {
    padding: '14px 32px',
    borderRadius: 10,
    border: 'none',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.15s',
  },
  btnLargePrimary: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
  },
  btnLargeOutline: {
    backgroundColor: '#fff',
    color: '#475569',
    border: '1.5px solid #e2e8f0',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 32,
    maxWidth: 1100,
    margin: '0 auto',
    padding: '80px 48px',
  },
  featureCard: {
    padding: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    border: '1px solid #e9edf2',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1a1a2e',
    margin: '0 0 8px',
  },
  featureDesc: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 1.6,
    margin: 0,
  },
  footer: {
    padding: '32px 48px',
    borderTop: '1px solid #e9edf2',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 13,
    color: '#94a3b8',
  },
  footerLinks: {
    display: 'flex',
    gap: 24,
  },
  footerLink: {
    color: '#64748b',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: 13,
  },
}

const features = [
  {
    icon: '💬',
    bg: '#eef2ff',
    title: 'Real-time Chat',
    desc: 'Instant messaging with typing indicators, reactions, threads, and file sharing — just like Slack or Discord.',
  },
  {
    icon: '📹',
    bg: '#f0fdf4',
    title: 'Video & Audio Calls',
    desc: 'Peer-to-peer WebRTC video calls with screen sharing. No extra software needed.',
  },
  {
    icon: '🤖',
    bg: '#fefce8',
    title: 'AI Assistant',
    desc: 'Built-in AI that summarizes channels, extracts action items, and answers questions from your chat history.',
  },
  {
    icon: '🔐',
    bg: '#fef2f2',
    title: 'Enterprise Security',
    desc: 'Role-based access control, email invites, JWT authentication, and granular permissions for every workspace.',
  },
  {
    icon: '📊',
    bg: '#f5f3ff',
    title: 'Workspace Management',
    desc: 'Create workspaces, organize channels, manage members, and control access with Owner/Admin/Member roles.',
  },
  {
    icon: '💎',
    bg: '#ecfeff',
    title: 'Pro Features',
    desc: 'Unlimited AI queries, semantic search across messages, higher file upload limits, and priority support.',
  },
]

const icons = ['🎯', '⚡', '🎨']

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>TC</div>
          TeamCollab
        </div>
        <nav style={styles.nav}>
          <Link to="/about" style={styles.navLink}>About</Link>
          <span style={styles.navLink}>Features</span>
          <span style={styles.navLink}>Pricing</span>
        </nav>
        <div style={styles.headerBtns}>
          <Link to={ROUTES.LOGIN} style={styles.btnOutline}>Log in</Link>
          <Link to={ROUTES.REGISTER} style={styles.btnPrimary}>Get Started Free</Link>
        </div>
      </header>

      <section style={styles.hero}>
        <div style={styles.heroBadge}>
          <span>✦</span>
          Now with AI-powered workspace assistant
        </div>
        <h1 style={styles.heroTitle}>
          Collaborate smarter with{' '}
          <span style={styles.heroGradient}>real-time</span> teamwork
        </h1>
        <p style={styles.heroSub}>
          The all-in-one platform for teams — chat, call, share files, and
          summarize your work with AI. Built for modern startups.
        </p>
        <div style={styles.heroBtns}>
          <button
            onClick={() => navigate(ROUTES.REGISTER)}
            style={{ ...styles.btnLarge, ...styles.btnLargePrimary }}
          >
            Start Free Trial
          </button>
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            style={{ ...styles.btnLarge, ...styles.btnLargeOutline }}
          >
            Sign In
          </button>
        </div>
      </section>

      <section style={styles.features}>
        {features.map((f, i) => (
          <div
            key={i}
            style={styles.featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = ''
            }}
          >
            <div style={{ ...styles.featureIcon, backgroundColor: f.bg }}>
              {f.icon}
            </div>
            <h3 style={styles.featureTitle}>{f.title}</h3>
            <p style={styles.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </section>

      <footer style={styles.footer}>
        <span>© 2026 TeamCollab. Built with ❤️</span>
        <div style={styles.footerLinks}>
          <Link to="/about" style={styles.footerLink}>About</Link>
          <span style={styles.footerLink}>Privacy</span>
          <span style={styles.footerLink}>Terms</span>
          <span style={styles.footerLink}>Contact</span>
        </div>
      </footer>
    </div>
  )
}
