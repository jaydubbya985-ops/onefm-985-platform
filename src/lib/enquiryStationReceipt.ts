/**
 * Station inbox is the receipt. A bounced confirmation must not pretend
 * the enquiry never left the form.
 */

export type EnquiryMailLeg = {
  ok: boolean
  id?: string
  error?: string
}

export type EnquiryStationReceipt = {
  statusCode: number
  body: {
    success: boolean
    emailedStation: boolean
    emailedConfirmation: boolean
    stationMessageId?: string
    confirmationMessageId?: string
    confirmationError?: string
    error?: string
  }
}

/** HTTP + JSON for send-enquiry. Station success is a received enquiry. */
export function enquiryStationReceipt(
  station: EnquiryMailLeg,
  confirmation: EnquiryMailLeg,
): EnquiryStationReceipt {
  if (!station.ok) {
    return {
      statusCode: 502,
      body: {
        success: false,
        emailedStation: false,
        emailedConfirmation: false,
        error: station.error ?? 'Station email failed',
      },
    }
  }

  if (!confirmation.ok) {
    return {
      statusCode: 200,
      body: {
        success: true,
        emailedStation: true,
        emailedConfirmation: false,
        stationMessageId: station.id,
        confirmationError: confirmation.error ?? 'Confirmation email failed',
      },
    }
  }

  return {
    statusCode: 200,
    body: {
      success: true,
      emailedStation: true,
      emailedConfirmation: true,
      stationMessageId: station.id,
      confirmationMessageId: confirmation.id,
    },
  }
}
