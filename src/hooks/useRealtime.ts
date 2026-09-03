import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { DbOpsProposal } from '@/lib/supabase'

export interface DeskPresence {
  live: boolean
  isSubscribed: boolean
  lastCompany: string | null
}

/** Never invent a live viewer count. Gov-truth forbids live-now theatre. */
export function deskPresenceLabel(presence: DeskPresence): string {
  if (!presence.live) {
    return 'Realtime is off in DEMO mode. Desk updates stay on this browser.'
  }
  if (!presence.isSubscribed) {
    return 'Realtime is not connected. Refresh or check ops-config.'
  }
  if (presence.lastCompany) {
    return `Last proposal update: ${presence.lastCompany}.`
  }
  return 'Desk is listening for proposal changes. Presence is not counted.'
}

export function useRealtime(table: string = 'ops_proposals') {
  const live = isSupabaseConfigured()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [lastCompany, setLastCompany] = useState<string | null>(null)

  useEffect(() => {
    if (!live) {
      setIsSubscribed(false)
      setLastCompany(null)
      return
    }

    const ch = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        (payload: RealtimePostgresChangesPayload<DbOpsProposal>) => {
          const row = payload.new as DbOpsProposal | undefined
          const company = row?.company?.trim()
          if (company) setLastCompany(company)
        },
      )
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(ch)
    }
  }, [live, table])

  return {
    live,
    isSubscribed,
    lastCompany,
    label: deskPresenceLabel({ live, isSubscribed, lastCompany }),
  }
}
