import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: '#fff',
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
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
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
  },
  content: {
    flex: 1,
    maxWidth: 800,
    margin: '0 auto',
    padding: '60px 24px',
  },
  title: {
    fontSize: 36,
    fontWeight: 800,
    color: '#1a1a2e',
    margin: '0 0 12px',
    letterSpacing: '-1px',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 1.6,
    margin: '0 0 48px',
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1a1a2e',
    margin: '0 0 12px',
  },
  sectionText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 1.7,
    margin: 0,
  },
  techGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
    marginTop: 16,
  },
  techCard: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    border: '1px solid #e9edf2',
  },
  techName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1a2e',
    margin: '0 0 4px',
  },
  techDesc: {
    fontSize: 13,
    color: '#64748b',
    margin: 0,
  },
  footer: {
    padding: '24px 48px',
    borderTop: '1px solid #e9edf2',
    textAlign: 'center',
    fontSize: 13,
    color: '#94a3b8',
  },
}

const techStack = [
  { name: 'React + Vite', desc: 'Modern frontend with lightning-fast HMR' },
  { name: 'Node.js + Express', desc: 'Scalable REST API backend' },
  { name: 'MongoDB + Mongoose', desc: 'Flexible document database' },
  { name: 'Socket.IO', desc: 'Real-time bidirectional events' },
  { name: 'WebRTC', desc: 'Peer-to-peer video/audio/screen share' },
  { name: 'Redis (Upstash)', desc: 'In-memory caching layer' },
  { name: 'OpenAI API', desc: 'AI summarization & semantic search' },
  { name: 'Stripe', desc: 'Subscription billing platform' },
]

export default function About() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to={ROUTES.HOME} style={styles.logo}>
          <div style={styles.logoIcon}>TC</div>
          TeamCollab
        </Link>
        <nav style={styles.nav}>
          <Link to={ROUTES.HOME} style={styles.navLink}>Home</Link>
          <span style={styles.navLink}>Features</span>
          <span style={styles.navLink}>Pricing</span>
        </nav>
        <Link to={ROUTES.REGISTER} style={styles.btnPrimary}>Get Started</Link>
      </header>

      <div style={styles.content}>
        <h1 style={styles.title}>About TeamCollab</h1>
        <p style={styles.subtitle}>
          TeamCollab is a full-featured team collaboration platform designed for
          modern startups and remote teams. Built with cutting-edge technology
          to provide real-time communication, AI-powered productivity, and
          enterprise-grade security.
        </p>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>What We Built</h2>
          <p style={styles.sectionText}>
            Over 10 phases of development, we transformed a basic chat app into a
            production-ready SaaS product. The platform includes real-time messaging
            with reactions and threads, WebRTC video/audio calls, screen sharing,
            file uploads to Cloudinary, AI workspace assistant powered by OpenAI,
            semantic search, role-based access control, email invitations, in-app
            notifications, Stripe subscription billing, and Redis caching — all
            containerized with Docker and ready for cloud deployment.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Tech Stack</h2>
          <div style={styles.techGrid}>
            {techStack.map((t, i) => (
              <div key={i} style={styles.techCard}>
                <div style={styles.techName}>{t.name}</div>
                <div style={styles.techDesc}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Deployment</h2>
          <p style={styles.sectionText}>
            The backend runs on Render using Docker, the frontend is deployed on
            Vercel, the database is hosted on MongoDB Atlas, and caching is
            handled by Upstash Redis. The entire infrastructure is built for
            production scale from day one.
          </p>
        </div>
      </div>

      <footer style={styles.footer}>
        © 2026 TeamCollab. Built with ❤️
      </footer>
    </div>
  )
}
