import { memo } from 'react'

function FormField({ label, name, type = 'text', placeholder, value, onChange, onBlur, error, touched }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        htmlFor={name}
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: '#374151',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 10,
          border: `1.5px solid ${touched && error ? '#ef4444' : '#e2e8f0'}`,
          fontSize: 14,
          outline: 'none',
          transition: 'border-color 0.15s',
          backgroundColor: '#fff',
          fontFamily: 'inherit',
        }}
      />
      {touched && error && (
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>{error}</p>
      )}
    </div>
  )
}

export default memo(FormField)
