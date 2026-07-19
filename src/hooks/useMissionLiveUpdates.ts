import { useEffect } from 'react'
import { Client } from '@stomp/stompjs'
import { API_BASE_URL } from '../api/client'
import { getToken } from '../api/authStore'

const STOMP_URL = `${API_BASE_URL.replace(/^http/, 'ws')}/api/ws`

export function useMissionLiveUpdates(missionId: string | undefined, onUpdate: () => void) {
  useEffect(() => {
    if (!missionId) return

    const client = new Client({
      brokerURL: STOMP_URL,
      connectHeaders: {
        Authorization: `Bearer ${getToken() ?? ''}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/missions/${missionId}`, () => {
          onUpdate()
        })
      },
    })

    client.activate()
    return () => {
      void client.deactivate()
    }
  }, [missionId, onUpdate])
}
