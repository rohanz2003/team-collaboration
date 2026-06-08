import { useState, useCallback, useRef } from 'react'
import { uploadFile } from '../utils/uploadFile'

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip', 'application/x-zip-compressed',
  'text/plain', 'text/csv',
]

const MAX_SIZE = 10 * 1024 * 1024

export default function FileUpload({ onFileSent, channelId }) {
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const [caption, setCaption] = useState('')

  const handleSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`File type ${file.type} is not supported`)
      return
    }

    if (file.size > MAX_SIZE) {
      setError('File must be under 10MB')
      return
    }

    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file))
    } else {
      setPreview(null)
    }
  }, [])

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !channelId) return
    setUploading(true)
    setError('')

    try {
      const { url, fileName, fileType } = await uploadFile(selectedFile, setProgress)
      onFileSent?.({
        channelId,
        fileUrl: url,
        fileName,
        fileType,
        text: caption.trim() || undefined,
      })
      setSelectedFile(null)
      setPreview(null)
      setCaption('')
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [selectedFile, channelId, caption, onFileSent])

  const handleCancel = useCallback(() => {
    setSelectedFile(null)
    setPreview(null)
    setError('')
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        onChange={handleSelect}
        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt,.csv"
        style={{ display: 'none' }}
      />

      {!selectedFile && (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          title="Attach file"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            padding: '6px 8px',
            borderRadius: 6,
            color: '#718096',
            lineHeight: 1,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f7fafc' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          +
        </button>
      )}

      {selectedFile && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            padding: 12,
            backgroundColor: '#f7fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="preview"
              style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 48, height: 48, borderRadius: 6, backgroundColor: '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: '#718096', textAlign: 'center', padding: 4,
                wordBreak: 'break-all',
              }}
            >
              {selectedFile.name}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#2d3748' }}>{selectedFile.name}</div>
            <div style={{ fontSize: 11, color: '#a0aec0' }}>
              {(selectedFile.size / 1024).toFixed(1)} KB
            </div>
            {uploading && progress > 0 && (
              <div
                style={{
                  width: '100%', height: 4, backgroundColor: '#e2e8f0',
                  borderRadius: 2, marginTop: 4, overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`, height: '100%',
                    backgroundColor: '#3182ce', transition: 'width 0.3s',
                  }}
                />
              </div>
            )}
          </div>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            style={{
              padding: '6px 10px', border: '1px solid #cbd5e0', borderRadius: 6,
              fontSize: 13, outline: 'none', width: 160,
            }}
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              padding: '6px 16px', borderRadius: 6, border: 'none',
              backgroundColor: uploading ? '#cbd5e0' : '#3182ce',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: uploading ? 'not-allowed' : 'pointer',
            }}
          >
            {uploading ? `${progress}%` : 'Upload'}
          </button>
          <button
            onClick={handleCancel}
            disabled={uploading}
            style={{
              padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
              backgroundColor: '#fff', color: '#718096', fontSize: 13,
              cursor: uploading ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            position: 'absolute', bottom: '100%', left: 0, right: 0,
            padding: '8px 12px', backgroundColor: '#fff5f5',
            color: '#c53030', fontSize: 13, borderTop: '1px solid #fed7d7',
          }}
        >
          {error}
        </div>
      )}
    </div>
  )
}
