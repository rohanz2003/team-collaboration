import { useNavigate } from 'react-router-dom'
import WorkspaceSidebar from '../components/WorkspaceSidebar'
import ChatRoom from './ChatRoom'
import { useCurrentWorkspace } from '../store/workspaceStore'
import { ROUTES } from '../constants/routes'

export default function WorkspaceView() {
  const workspace = useCurrentWorkspace()
  const navigate = useNavigate()

  if (!workspace) {
    navigate(ROUTES.WORKSPACES, { replace: true })
    return null
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <WorkspaceSidebar />
      <ChatRoom />
    </div>
  )
}
