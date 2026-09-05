/**
 * Fail if a bounced confirmation pretends the station never got the enquiry.
 * Run: npx vite-node scripts/verify-enquiry-station-receipt.ts
 */
import { enquiryStationReceipt } from '../src/lib/enquiryStationReceipt'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-enquiry-station-receipt FAIL: ${message}`)
    process.exit(1)
  }
}

const leftover = enquiryStationReceipt(
  { ok: true, id: 're_station' },
  { ok: false, error: 'Resend 502' },
)
assert(leftover.statusCode === 200, `station-received must be HTTP 200, got ${leftover.statusCode}`)
assert(leftover.body.success === true, 'station-received must set success so the form does not say nothing was sent')
assert(leftover.body.emailedStation === true, 'station inbox is the receipt')
assert(leftover.body.emailedConfirmation === false, 'do not invent a confirmation send')
assert(leftover.body.stationMessageId === 're_station', 'keep the Resend id for the station send')
assert(leftover.body.confirmationError === 'Resend 502', 'keep the confirmation error text')

const both = enquiryStationReceipt(
  { ok: true, id: 're_station' },
  { ok: true, id: 're_confirm' },
)
assert(both.statusCode === 200 && both.body.success === true, 'both legs still succeed')
assert(both.body.emailedConfirmation === true, 'confirmation id only when that send worked')
assert(both.body.confirmationMessageId === 're_confirm', 'confirmation message id')

const stationDown = enquiryStationReceipt(
  { ok: false, error: 'Resend 502' },
  { ok: false },
)
assert(stationDown.statusCode === 502, `station fail must stay 502, got ${stationDown.statusCode}`)
assert(stationDown.body.success === false, 'station fail is not a received enquiry')
assert(stationDown.body.emailedStation === false, 'do not invent a station send')
assert(stationDown.body.error === 'Resend 502', 'keep the station error')

console.log('verify-enquiry-station-receipt OK')
