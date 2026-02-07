import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'MultiTasks - Gestionnaire de tâches multi-rôles'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 24,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 60,
            }}
          >
            ✓
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: 20,
          }}
        >
          MultiTasks
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 32,
            color: '#94a3b8',
            marginBottom: 40,
          }}
        >
          Gestionnaire de tâches multi-rôles
        </div>

        <div
          style={{
            display: 'flex',
            gap: 24,
          }}
        >
          {['Workspaces', 'Matrice IA', 'Export PDF'].map((feature) => (
            <div
              key={feature}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 24px',
                borderRadius: 9999,
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                fontSize: 20,
              }}
            >
              {feature}
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            fontSize: 24,
            color: '#64748b',
          }}
        >
          multitasks.fr
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
