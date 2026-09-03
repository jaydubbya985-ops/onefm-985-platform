import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'
import {
  FULL_SCHEDULE,
  getCurrentLiveShow,
  getMelbourneWeekday,
  slotIsCurrentGuide,
  type ScheduleSlot,
} from '@/data/programGuide'
import { formatWithPresenter } from '@/lib/liveNow'

const DAY_TABS = [
  { index: 1, label: 'Mon', full: 'Monday' },
  { index: 2, label: 'Tue', full: 'Tuesday' },
  { index: 3, label: 'Wed', full: 'Wednesday' },
  { index: 4, label: 'Thu', full: 'Thursday' },
  { index: 5, label: 'Fri', full: 'Friday' },
  { index: 6, label: 'Sat', full: 'Saturday' },
  { index: 0, label: 'Sun', full: 'Sunday' },
] as const

function formatSlotTime(slot: ScheduleSlot): string {
  const fmt = (h: number) => {
    if (h === 0 || h === 24) return '12am'
    if (h === 12) return '12pm'
    return h < 12 ? `${h}am` : `${h - 12}pm`
  }
  return `${fmt(slot.startHour)} – ${fmt(slot.endHour)}`
}

function slotsForDay(day: number): ScheduleSlot[] {
  return FULL_SCHEDULE.filter((s) => s.day === day && s.name !== 'Overnight Mix').sort(
    (a, b) => a.startHour - b.startHour,
  )
}

const CATEGORY_COLORS: Record<string, string> = {
  Breakfast: '#F2F2F2',
  Music: '#9B5DE5',
  Community: '#B6FF00',
  Sport: '#E51636',
  Multicultural: '#FF6B6B',
  Country: '#F2F2F2',
}

export function WeeklySchedule() {
  const today = getMelbourneWeekday()
  const liveShow = getCurrentLiveShow()
  const defaultDay = DAY_TABS.find((d) => d.index === today)?.index ?? 1
  const [activeDay, setActiveDay] = useState(defaultDay)
  const slots = slotsForDay(activeDay)
  const liveRowRef = useRef<HTMLLIElement | null>(null)

  useEffect(() => {
    if (activeDay !== today) return
    liveRowRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeDay, today])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Program guide days">
        {DAY_TABS.map((day) => {
          const selected = activeDay === day.index
          return (
            <button
              key={day.index}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={day.index === today ? `${day.full}, today` : day.full}
              onClick={() => setActiveDay(day.index)}
              data-cursor-label={day.label.toUpperCase()}
              className={`font-label text-xs px-4 py-2 rounded-full border transition-all ${
                selected
                  ? 'bg-one-gold text-one-navy border-one-gold'
                  : 'text-one-white border-one-border hover:border-one-gold/40'
              }`}
            >
              <span className="sm:hidden">{day.label}</span>
              <span className="hidden sm:inline">{day.full}</span>
              {day.index === today && (
                <span className="ml-1.5 text-[9px] opacity-80">today</span>
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.ul
          key={activeDay}
          role="tabpanel"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-2"
        >
          {slots.length === 0 ? (
            <li className="font-body-small text-muted py-8 text-center">No scheduled programs this day.</li>
          ) : (
            slots.map((slot, i) => {
              const live = slotIsCurrentGuide(slot)
              const withHost = formatWithPresenter(slot.host)
              const accentColor = CATEGORY_COLORS[slot.category] ?? '#B6FF00'
              return (
                <motion.li
                  key={`${slot.startHour}-${slot.name}-${i}`}
                  ref={live ? liveRowRef : undefined}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
                  aria-current={live ? 'true' : undefined}
                  className="glass-card pl-0 pr-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 overflow-hidden relative group"
                  style={live ? {
                    boxShadow: `inset 0 0 0 1px ${accentColor}35`,
                    background: `linear-gradient(to right, ${accentColor}14 0%, ${accentColor}04 50%, transparent 100%)`,
                  } : {}}
                >
                  <div aria-hidden className="explore-tile-scan" />
                  <div
                    className="absolute left-0 top-0 bottom-0 shrink-0 rounded-l"
                    style={{ backgroundColor: accentColor, width: live ? '4px' : '3px' }}
                  />
                  <span className="font-label text-muted text-xs flex items-center gap-1.5 sm:w-28 shrink-0 pl-4">
                    <Clock size={12} />
                    {formatSlotTime(slot)}
                  </span>
                  <div className="flex-1 min-w-0 pl-4 sm:pl-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-body-small text-one-white font-medium truncate">{slot.name}</p>
                      {live && (
                        <span className="flex items-center gap-1 font-label text-[9px] text-one-red shrink-0">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-one-red opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-one-red" />
                          </span>
                          LIVE · {liveShow.remainingLabel}
                        </span>
                      )}
                    </div>
                    {withHost ? (
                      <p className="font-body-small text-muted text-xs truncate">{withHost}</p>
                    ) : null}
                  </div>
                  <span
                    className="font-label text-[10px] px-2 py-0.5 rounded-full shrink-0 self-start sm:self-center"
                    style={{
                      color: accentColor,
                      backgroundColor: `${accentColor}18`,
                    }}
                  >
                    {slot.category}
                  </span>
                  {live && (
                    <Link
                      to="/listen"
                      data-cursor-label="LISTEN"
                      className="font-label text-[10px] uppercase tracking-wider text-one-red shrink-0 self-start sm:self-center hover:underline"
                    >
                      Listen now
                    </Link>
                  )}
                </motion.li>
              )
            })
          )}
        </motion.ul>
      </AnimatePresence>

      <p className="font-body-small text-muted text-xs mt-4">
        Source:{' '}
        <a
          href="https://fm985.com.au/guide/"
          target="_blank"
          rel="noopener noreferrer"
          data-cursor-label="OPEN"
          className="text-one-gold link-hover"
        >
          fm985.com.au/guide/
        </a>
        {' · '}
        <Link to="/broadcast" data-cursor-label="EXPLORE" className="text-one-gold link-hover inline-flex items-center gap-1">
          Open broadcast explorer <ArrowRight size={12} />
        </Link>
      </p>
    </div>
  )
}
