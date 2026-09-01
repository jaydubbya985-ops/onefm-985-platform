import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'
import { FULL_SCHEDULE, type ScheduleSlot } from '@/data/programGuide'

const DAY_TABS = [
  { index: 1, label: 'Mon' },
  { index: 2, label: 'Tue' },
  { index: 3, label: 'Wed' },
  { index: 4, label: 'Thu' },
  { index: 5, label: 'Fri' },
  { index: 6, label: 'Sat' },
  { index: 0, label: 'Sun' },
] as const

const WEEKDAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

/** Guide day/hour in Australia/Melbourne — not the viewer's local clock. */
function melbourneDayAndHour(now = new Date()): { day: number; hour: number } {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Melbourne',
    weekday: 'long',
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now)
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Monday'
  const hour = Number(parts.find((p) => p.type === 'hour')?.value)
  return { day: WEEKDAY_INDEX[weekday] ?? 1, hour: Number.isFinite(hour) ? hour : 0 }
}

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
  const { day: today, hour: currentHour } = melbourneDayAndHour()
  const defaultDay = DAY_TABS.find((d) => d.index === today)?.index ?? 1
  const [activeDay, setActiveDay] = useState(defaultDay)
  const slots = slotsForDay(activeDay)

  const isLiveSlot = (slot: ScheduleSlot) =>
    activeDay === today && slot.startHour <= currentHour && currentHour < slot.endHour

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {DAY_TABS.map((day) => (
          <button
            key={day.index}
            type="button"
            onClick={() => setActiveDay(day.index)}
            data-cursor-label={day.label.toUpperCase()}
            className={`font-label text-xs px-4 py-2 rounded-full border transition-all ${
              activeDay === day.index
                ? 'bg-one-gold text-one-navy border-one-gold'
                : 'text-one-white border-one-border hover:border-one-gold/40'
            }`}
          >
            {day.label}
            {day.index === today && (
              <span className="ml-1.5 text-[9px] opacity-80">today</span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.ul
          key={activeDay}
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
              const live = isLiveSlot(slot)
              const accentColor = CATEGORY_COLORS[slot.category] ?? '#B6FF00'
              return (
                <motion.li
                  key={`${slot.startHour}-${slot.name}-${i}`}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
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
                    <div className="flex items-center gap-2">
                      <p className="font-body-small text-one-white font-medium truncate">{slot.name}</p>
                      {live && (
                        <span className="flex items-center gap-1 font-label text-[9px] text-one-red shrink-0">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-one-red opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-one-red" />
                          </span>
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="font-body-small text-muted text-xs truncate">with {slot.host}</p>
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
