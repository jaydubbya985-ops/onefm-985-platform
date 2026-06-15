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
  Breakfast: '#D4AF37',
  Music: '#9B5DE5',
  Community: '#2EC4B6',
  Sport: '#E51636',
  Multicultural: '#FF6B6B',
  Country: '#D4AF37',
}

export function WeeklySchedule() {
  const today = new Date().getDay()
  const defaultDay = DAY_TABS.find((d) => d.index === today)?.index ?? 1
  const [activeDay, setActiveDay] = useState(defaultDay)
  const slots = slotsForDay(activeDay)

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {DAY_TABS.map((day) => (
          <button
            key={day.index}
            type="button"
            onClick={() => setActiveDay(day.index)}
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
            slots.map((slot, i) => (
              <li
                key={`${slot.startHour}-${slot.name}-${i}`}
                className="glass-card px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <span className="font-label text-muted text-xs flex items-center gap-1.5 sm:w-28 shrink-0">
                  <Clock size={12} />
                  {formatSlotTime(slot)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body-small text-one-white font-medium truncate">{slot.name}</p>
                  <p className="font-body-small text-muted text-xs truncate">with {slot.host}</p>
                </div>
                <span
                  className="font-label text-[10px] px-2 py-0.5 rounded-full shrink-0 self-start sm:self-center"
                  style={{
                    color: CATEGORY_COLORS[slot.category] ?? '#2EC4B6',
                    backgroundColor: `${CATEGORY_COLORS[slot.category] ?? '#2EC4B6'}18`,
                  }}
                >
                  {slot.category}
                </span>
              </li>
            ))
          )}
        </motion.ul>
      </AnimatePresence>

      <p className="font-body-small text-muted text-xs mt-4">
        Source:{' '}
        <a
          href="https://fm985.com.au/guide/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-one-gold hover:underline"
        >
          fm985.com.au/guide/
        </a>
        {' · '}
        <Link to="/broadcast" className="text-one-gold hover:underline inline-flex items-center gap-1">
          Open broadcast explorer <ArrowRight size={12} />
        </Link>
      </p>
    </div>
  )
}
