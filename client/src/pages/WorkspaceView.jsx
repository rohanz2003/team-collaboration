import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WorkspaceSidebar from '../components/WorkspaceSidebar'
import ChatRoom from './ChatRoom'
import CallHistory from '../components/CallHistory'
import { useCurrentWorkspace } from '../store/workspaceStore'
import { useAuth } from '../store/authStore'
import { ROUTES } from '../constants/routes'

export default function WorkspaceView() {
  const workspace = useCurrentWorkspace()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showCallHistory, setShowCallHistory] = useState(false)

  if (!workspace) {
    navigate(ROUTES.WORKSPACES, { replace: true })
    return null
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <WorkspaceSidebar onToggleCallHistory={() => setShowCallHistory((v) => !v)} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <ChatRoom />
        {showCallHistory && (
          <div style={{
            width: 340, borderLeft: '1px solid #e1e4e8', backgroundColor: '#f6f8fa',
            padding: 16, overflowY: 'auto', flexShrink: 0,
          }}>
            <CallHistory
              workspaceId={workspace._id}
              userId={user?._id}
              onClose={() => setShowCallHistory(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
