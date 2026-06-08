import { memo } from 'react'

function FormField({ label, name, type = 'text', placeholder, value, onChange, onBlur, error, touched }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: '#24292f',
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}
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
          padding: '8px 12px',
          borderRadius: 6,
          border: `1.5px solid ${touched && error ? '#cf222e' : '#d0d7de'}`,
          fontSize: 14,
          outline: 'none',
          backgroundColor: '#fff',
          fontFamily: 'inherit',
          color: '#0d1117',
        }}
      />
      {touched && error && (
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#cf222e' }}>{error}</p>
      )}
    </div>
  )
}

export default memo(FormField)
