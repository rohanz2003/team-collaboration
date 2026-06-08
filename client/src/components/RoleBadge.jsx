const ROLE_COLORS = {
  owner: { bg: '#fefcbf', color: '#975a16', label: 'Owner' },
  admin: { bg: '#e6fffa', color: '#276749', label: 'Admin' },
  member: { bg: '#f7fafc', color: '#4a5568', label: 'Member' },
}

export default function RoleBadge({ role, size = 'sm' }) {
  const config = ROLE_COLORS[role] || ROLE_COLORS.member

  const sizeStyles = size === 'sm'
    ? { padding: '1px 8px', fontSize: 11 }
    : { padding: '4px 14px', fontSize: 13 }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 20,
        fontWeight: 600,
        lineHeight: '20px',
        backgroundColor: config.bg,
        color: config.color,
        whiteSpace: 'nowrap',
        ...sizeStyles,
      }}
    >
      {config.label}
    </span>
  )
}
