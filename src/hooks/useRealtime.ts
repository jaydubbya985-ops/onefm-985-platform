import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { DbOpsProposal } from '@/lib/supabase'

interface RealtimeState {
  viewers: number
  lastUpdate: DbOpsProposal | null
  isSubscribed: boolean
}

export function useRealtime(table: string = 'proposals') {
  const [state, setState] = useState<RealtimeState>({
    viewers: 0,
    lastUpdate: null,
    isSubscribed: false,
  })

  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)

  const subscribe = useCallback(
    (filter?: string) => {
      const ch = supabase
        .channel(`realtime:${table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: filter || undefined,
          },
          (payload: RealtimePostgresChangesPayload<DbOpsProposal>) => {
            setState((prev) => ({
              ...prev,
              lastUpdate: payload.new as DbOpsProposal,
              viewers: Math.floor(Math.random() * 3) + 1,
            }))
          }
        )
        .subscribe((status) => {
          setState((prev) => ({
            ...prev,
            isSubscribed: status === 'SUBSCRIBED',
          }))
        })

      setChannel(ch)
      return ch
    },
    [table]
  )

  const unsubscribe = useCallback(() => {
    if (channel) {
      supabase.removeChannel(channel)
      setChannel(null)
      setState({
        viewers: 0,
        lastUpdate: null,
        isSubscribed: false,
      })
    }
  }, [channel])

  useEffect(() => {
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [channel])

  return {
    ...state,
    subscribe,
    unsubscribe,
  }
}
