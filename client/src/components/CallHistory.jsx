import { useState, useEffect, useCallback } from 'react'
import { callApi } from '../api/call'

const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const formatTime = (date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CallHistory({ workspaceId, userId, compact, onClose }) {
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await callApi.getHistory(workspaceId, compact ? 10 : 50)
      setCalls(res.data.calls || [])
      setTotal(res.data.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load call history')
    } finally {
      setLoading(false)
    }
  }, [workspaceId, compact])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const getOther = (call) => {
    if (!userId) return null
    const isCaller = call.caller?._id === userId
    return isCaller ? call.receiver : call.caller
  }

  const isOutgoing = (call) => {
    return call.caller?._id === userId
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#656d76', fontSize: 13 }}>
        Loading call history...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#cf222e', fontSize: 13 }}>
        {error}
      </div>
    )
  }

  return (
    <div>
      {onClose && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0d1117' }}>
            Call History
            {total > 0 && <span style={{ fontWeight: 400, color: '#656d76', fontSize: 12, marginLeft: 6 }}>({total})</span>}
          </h3>
          <button
            onClick={onClose}
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: '#656d76', padding: 4, borderRadius: 4,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708Z"/>
            </svg>
          </button>
        </div>
      )}

      {!onClose && (
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0d1117' }}>
            Call History
            {total > 0 && <span style={{ fontWeight: 400, color: '#656d76', fontSize: 12, marginLeft: 6 }}>({total})</span>}
          </h3>
        </div>
      )}

      {calls.length === 0 ? (
        <div style={{
          padding: 24, textAlign: 'center', color: '#656d76', fontSize: 13,
          backgroundColor: '#fff', border: '1px solid #e1e4e8', borderRadius: 8,
        }}>
          No calls yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {calls.map((call) => {
            const other = getOther(call)
            const outgoing = isOutgoing(call)
            return (
              <div
                key={call._id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', backgroundColor: '#fff',
                  border: '1px solid #e1e4e8', borderRadius: 8,
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  backgroundColor: '#f6f8fa', border: '1px solid #d0d7de',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: '#656d76',
                }}>
                  <svg width="14" height="14" viewBox="0 0 640 512" fill={call.callType === 'video' ? '#6366f1' : '#656d76'}>
                    {call.callType === 'video' ? (
                      <path d="M392.9 64H103.1C77.7 64 57 84.7 57 110.1V401.9c0 25.4 20.7 46.1 46.1 46.1h289.8c25.4 0 46.1-20.7 46.1-46.1V110.1c0-25.4-20.7-46.1-46.1-46.1zm54.1 227.5l88.9 81.7c6.1 5.6 15.1 5.7 21.3.4l56.8-48.2c7.6-6.4 7.6-18.1 0-24.5L523 291.5l68.2-67.4c7.6-6.4 7.6-18.1 0-24.5l-56.8-48.2c-6.2-5.2-15.2-5.1-21.3.4l-88.9 81.7-4.9-3.2V155.2l119.9-110.2c9.9-9.1 9.9-24.2 0-33.3L564.9 1.9c-8.4-7.7-21.1-7.7-29.5 0L387.8 111.6H133.5L68.2 1.9c-8.4-7.7-21.1-7.7-29.5 0L4.9 11.7c-9.9 9.1-9.9 24.2 0 33.3L124.8 155.2v201.5L4.9 466.9c-9.9 9.1-9.9 24.2 0 33.3l33.9 31.1c8.4 7.7 21.1 7.7 29.5 0l195.1-178.9h.4l.4-.3 195.1 179.2c8.4 7.7 21.1 7.7 29.5 0l33.9-31.1c9.9-9.1 9.9-24.2 0-33.3L447 356.7v-48.5l-4.9 3.2z"/>
                    ) : (
                      <path d="M192 384c-35.3 0-64-28.7-64-64V192c0-35.3 28.7-64 64-64s64 28.7 64 64v128c0 35.3-28.7 64-64 64zm-64 64c0 35.3 28.7 64 64 64s64-28.7 64-64v-3.1c62.7-10.4 112-64.9 112-130.9V192c0-70.7-57.3-128-128-128S112 121.3 112 192v122.1c0 66 49.3 120.5 112 130.9V448zM0 192c0-106 86-192 192-192s192 86 192 192v122.1c0 88.4-71.6 160.4-160 161.9V488c0 13.3-10.7 24-24 24s-24-10.7-24-24v-12.1c-88.4-1.5-160-73.5-160-161.9V192z"/>
                    )}
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: 13, fontWeight: 600, color: '#0d1117',
                    }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%',
                        backgroundColor: '#0969da', display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 9, fontWeight: 700, flexShrink: 0,
                      }}>
                        {other?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                      {other?.name || 'Unknown'}
                    </span>
                    <span style={{
                      fontSize: 11, color: outgoing ? '#656d76' : '#0969da',
                      fontWeight: 500,
                    }}>
                      {outgoing ? 'Outgoing' : 'Incoming'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 12, color: '#656d76' }}>
                      {formatDuration(call.duration)}
                    </span>
                    <span style={{ fontSize: 10, color: '#d0d7de' }}>·</span>
                    <span style={{ fontSize: 12, color: '#656d76' }}>
                      {formatTime(call.createdAt)}
                    </span>
                    {call.workspace?.name && (
                      <>
                        <span style={{ fontSize: 10, color: '#d0d7de' }}>·</span>
                        <span style={{ fontSize: 11, color: '#656d76', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {call.workspace.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
