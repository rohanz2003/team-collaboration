import { useCurrentWorkspace, useChannels, useCurrentChannel, useSetChannel } from '../store/workspaceStore'

export default function ChannelList() {
  const workspace = useCurrentWorkspace()
  const channels = useChannels()
  const currentChannel = useCurrentChannel()
  const setChannel = useSetChannel()

  if (!workspace) return null

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#718096', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Channels in {workspace.name}
      </h3>
      {channels.length === 0 && (
        <p style={{ color: '#a0aec0', fontSize: 14 }}>No channels yet. Create one from the sidebar.</p>
      )}
      {channels.map((ch) => (
        <div
          key={ch._id}
          onClick={() => setChannel(ch)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 8,
            cursor: 'pointer',
            backgroundColor: currentChannel?._id === ch._id ? '#ebf8ff' : 'transparent',
            color: currentChannel?._id === ch._id ? '#2b6cb0' : '#4a5568',
            fontWeight: currentChannel?._id === ch._id ? 600 : 400,
            marginBottom: 4,
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => { if (currentChannel?._id !== ch._id) e.currentTarget.style.backgroundColor = '#f7fafc' }}
          onMouseLeave={(e) => { if (currentChannel?._id !== ch._id) e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <span style={{ fontSize: 18, color: '#a0aec0' }}>#</span>
          {ch.name}
        </div>
      ))}
    </div>
  )
}
