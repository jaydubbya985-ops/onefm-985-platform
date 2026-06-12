// Re-export unified Xero module (ContractManager import path preserved)
export {
  buildXeroCsv,
  buildXeroLinesFromContracts,
  downloadXeroCsv,
  summarizeXeroExport,
  summariseXeroExport,
  validateXeroExport,
  toXeroDate,
  type XeroExportableInvoice,
  type XeroExportSummary,
  type XeroInvoiceLine,
  type XeroValidationResult,
  type XeroValidationIssue,
} from '../invoices/xeroExport'
