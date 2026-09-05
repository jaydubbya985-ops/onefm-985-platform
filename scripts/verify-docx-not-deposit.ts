import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { generateProposalDocx } from '../src/lib/docxExport.ts'

const blob = await generateProposalDocx({
  customerName: 'Jo',
  companyName: 'FOOTT Waste Solutions',
  industry: 'waste',
  email: 'jo@example.com',
  phone: '03 0000 0000',
  campaignGoal: 'GVL season',
  budget: 'quoted',
  duration: 'quoted',
  tierName: 'Quoted inventory',
  tierPrice: 0,
  sections: [{ title: 'About', content: 'ONE FM 98.5' }],
  addOns: [],
  total: 0,
})

const buf = Buffer.from(await blob.arrayBuffer())
writeFileSync('/tmp/proposal-not-deposit.docx', buf)
const xml = execFileSync('unzip', ['-p', '/tmp/proposal-not-deposit.docx', 'word/document.xml'], {
  encoding: 'utf8',
})

if (/50%\s*deposit/i.test(xml)) {
  throw new Error('leftover 50% deposit still in proposal Word')
}
if (/Deposits are non-refundable/i.test(xml)) {
  throw new Error('leftover non-refundable deposit still in proposal Word')
}
if (!/does not invent deposit percentages/.test(xml)) {
  throw new Error('sourced no-deposit-percentage line missing')
}
if (!/admin@fm985.com.au/.test(xml)) {
  throw new Error('station email missing from payment terms')
}

console.log('verify-docx-not-deposit: leftover 50% deposit gone; terms ask for written quote')
