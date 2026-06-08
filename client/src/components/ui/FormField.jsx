import { memo } from 'react'

function FormField({ label, name, type = 'text', value, onChange, onBlur, error, touched, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        htmlFor={name}
        style={{
          display: 'block',
          marginBottom: 4,
          fontWeight: 500,
          color: '#2d3748',
        }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: `1px solid ${touched && error ? '#e53e3e' : '#cbd5e0'}`,
          borderRadius: 6,
          fontSize: 15,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
      />
      {touched && error && (
        <p style={{ color: '#e53e3e', fontSize: 13, margin: '4px 0 0' }}>{error}</p>
      )}
    </div>
  )
}

export default memo(FormField)
