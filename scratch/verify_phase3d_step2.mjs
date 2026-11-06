import { MOCK_ARCHIVED_INVOICES, MOCK_CORPORATE_CUSTOMERS } from '../src/lib/data/mock-admin-data.ts';
import { calculateRowBillQty, calculateBillingKpis } from '../src/lib/utils/billing-calculations.ts';

console.log('================================================================');
console.log('PHASE 3D - STEP 2: DETERMINISTIC VERIFICATION SUITE');
console.log('================================================================');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

// -----------------------------------------------------------------------------
// 1. Four unique invoice IDs and bill numbers
// -----------------------------------------------------------------------------
console.log('\n--- 1. Unique IDs & Bill Numbers ---');
assert(Array.isArray(MOCK_ARCHIVED_INVOICES), 'MOCK_ARCHIVED_INVOICES is an array');
assert(MOCK_ARCHIVED_INVOICES.length === 4, `Expected 4 invoices, received ${MOCK_ARCHIVED_INVOICES.length}`);

const ids = MOCK_ARCHIVED_INVOICES.map(inv => inv.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 4, `All 4 invoice IDs are distinct: ${ids.join(', ')}`);

const billNos = MOCK_ARCHIVED_INVOICES.map(inv => inv.billNo);
const uniqueBillNos = new Set(billNos);
assert(uniqueBillNos.size === 4, `All 4 bill numbers are distinct: ${billNos.join(', ')}`);

// -----------------------------------------------------------------------------
// 2. Billing periods, months, and correct day counts
// -----------------------------------------------------------------------------
console.log('\n--- 2. Billing Periods & Day Counts ---');
const expectedSpecs = [
  { id: 'inv-2026-10-hydac', month: 'October', year: 2026, days: 31, start: '2026-10-01', end: '2026-10-31', status: 'PENDING' },
  { id: 'inv-2026-10-lmw', month: 'October', year: 2026, days: 31, start: '2026-10-01', end: '2026-10-31', status: 'GENERATED' },
  { id: 'inv-2026-09-pricol', month: 'September', year: 2026, days: 30, start: '2026-09-01', end: '2026-09-30', status: 'PAID' },
  { id: 'inv-2026-09-hydac', month: 'September', year: 2026, days: 30, start: '2026-09-01', end: '2026-09-30', status: 'PAID' },
];

for (const spec of expectedSpecs) {
  const inv = MOCK_ARCHIVED_INVOICES.find(i => i.id === spec.id);
  assert(inv !== undefined, `Invoice with ID ${spec.id} exists`);
  if (!inv) continue;

  assert(inv.month === spec.month, `Invoice ${spec.id} month is ${spec.month}`);
  assert(inv.year === spec.year, `Invoice ${spec.id} year is ${spec.year}`);
  assert(inv.startDate === spec.start, `Invoice ${spec.id} startDate is ${spec.start}`);
  assert(inv.endDate === spec.end, `Invoice ${spec.id} endDate is ${spec.end}`);
  assert(inv.entries.length === spec.days, `Invoice ${spec.id} has exactly ${spec.days} daily entries (got ${inv.entries.length})`);
  assert(inv.kpis.totalDays === spec.days, `Invoice ${spec.id} KPI totalDays is ${spec.days} (got ${inv.kpis.totalDays})`);
}

// -----------------------------------------------------------------------------
// 3. Every daily entry belongs to its invoice's billing period
// -----------------------------------------------------------------------------
console.log('\n--- 3. Daily Entries Belonging to Billing Period ---');
for (const inv of MOCK_ARCHIVED_INVOICES) {
  let allDatesValid = true;
  for (let idx = 0; idx < inv.entries.length; idx++) {
    const entry = inv.entries[idx];
    const expectedDayNumber = idx + 1;
    if (entry.dayNumber !== expectedDayNumber) {
      allDatesValid = false;
      console.error(`Day number mismatch: expected ${expectedDayNumber}, got ${entry.dayNumber}`);
    }
    if (entry.dateString < inv.startDate || entry.dateString > inv.endDate) {
      allDatesValid = false;
      console.error(`Date ${entry.dateString} out of range [${inv.startDate}, ${inv.endDate}]`);
    }
  }
  assert(allDatesValid, `All ${inv.entries.length} daily entries for ${inv.billNo} (${inv.month} ${inv.year}) strictly fall in [${inv.startDate}, ${inv.endDate}]`);
}

// -----------------------------------------------------------------------------
// 4. KPI billable quantities match the central calculation engine
// -----------------------------------------------------------------------------
console.log('\n--- 4. Central Calculation Engine Reconciliation ---');
for (const inv of MOCK_ARCHIVED_INVOICES) {
  // Re-run calculateRowBillQty on every single entry
  let engineRowSum = 0;
  for (const entry of inv.entries) {
    const recalculatedRowQty = calculateRowBillQty(entry);
    assert(
      entry.billQty === recalculatedRowQty,
      `Row ${entry.dateString} billQty (${entry.billQty}) matches engine calculation (${recalculatedRowQty})`
    );
    engineRowSum += recalculatedRowQty;
  }

  // Re-run calculateBillingKpis
  const recalculatedKpis = calculateBillingKpis(inv.entries, inv.rate, inv.rateSource);
  assert(
    inv.kpis.totalBillQty === engineRowSum,
    `Invoice ${inv.billNo} KPI totalBillQty (${inv.kpis.totalBillQty}) equals sum of row quantities (${engineRowSum})`
  );
  assert(
    inv.kpis.totalBillQty === recalculatedKpis.totalBillQty,
    `Invoice ${inv.billNo} totalBillQty matches calculateBillingKpis (${recalculatedKpis.totalBillQty})`
  );
  assert(
    inv.kpis.totalSundays === recalculatedKpis.totalSundays,
    `Invoice ${inv.billNo} totalSundays matches calculateBillingKpis (${recalculatedKpis.totalSundays})`
  );
}

// -----------------------------------------------------------------------------
// 5. Total amount equals quantity x rate
// -----------------------------------------------------------------------------
console.log('\n--- 5. Total Amount = Total Quantity x Rate ---');
for (const inv of MOCK_ARCHIVED_INVOICES) {
  const expectedAmount = inv.kpis.totalBillQty * inv.rate;
  assert(
    inv.kpis.totalAmount === expectedAmount,
    `Invoice ${inv.billNo} totalAmount (₹${inv.kpis.totalAmount}) exactly equals ${inv.kpis.totalBillQty} × ₹${inv.rate} = ₹${expectedAmount}`
  );
  assert(
    typeof inv.kpis.amountInWords === 'string' && inv.kpis.amountInWords.startsWith('Rupees '),
    `Invoice ${inv.billNo} amount in words is valid: "${inv.kpis.amountInWords}"`
  );
}

// -----------------------------------------------------------------------------
// 6. Status distribution includes all three statuses
// -----------------------------------------------------------------------------
console.log('\n--- 6. Status Distribution ---');
const statuses = MOCK_ARCHIVED_INVOICES.map(inv => inv.status);
assert(statuses.includes('PAID'), 'Includes PAID status (PRICOL Sep 2026 & HYDAC Sep 2026)');
assert(statuses.includes('PENDING'), 'Includes PENDING status (HYDAC Oct 2026)');
assert(statuses.includes('GENERATED'), 'Includes GENERATED status (LMW Oct 2026)');

for (const inv of MOCK_ARCHIVED_INVOICES) {
  if (inv.status === 'PAID') {
    assert(
      Boolean(inv.paymentDate && inv.paymentReference),
      `PAID invoice ${inv.billNo} has paymentDate (${inv.paymentDate}) and paymentReference (${inv.paymentReference})`
    );
    assert(
      inv.paymentReference.startsWith('DEMO-'),
      `PAID invoice ${inv.billNo} paymentReference is clearly fictitious: ${inv.paymentReference}`
    );
  } else {
    assert(
      inv.paymentDate === undefined && inv.paymentReference === undefined,
      `${inv.status} invoice ${inv.billNo} correctly omits payment reference and date`
    );
  }
}

// -----------------------------------------------------------------------------
// 7. Customer snapshot independence (deep copy / no mutation leak)
// -----------------------------------------------------------------------------
console.log('\n--- 7. Customer Snapshot Independence ---');
const hydacMaster = MOCK_CORPORATE_CUSTOMERS.find(c => c.shortCode === 'HYDAC');
const hydacOctInvoice = MOCK_ARCHIVED_INVOICES.find(i => i.id === 'inv-2026-10-hydac');

assert(hydacMaster !== undefined, 'HYDAC customer master exists');
assert(hydacOctInvoice !== undefined, 'HYDAC Oct invoice exists');

// Verify initial match
assert(
  hydacOctInvoice.customer.name === hydacMaster.name,
  'Invoice customer snapshot initially matches master name'
);

// Mutate master temporarily to test decoupling
const originalName = hydacMaster.name;
hydacMaster.name = 'TEMPORARY_MUTATED_NAME_FOR_TEST';

assert(
  hydacOctInvoice.customer.name === originalName,
  `Customer snapshot in invoice is unaffected by master mutation (snapshot: "${hydacOctInvoice.customer.name}", master: "${hydacMaster.name}")`
);

// Restore master
hydacMaster.name = originalName;
assert(
  hydacMaster.name === originalName,
  'Customer master safely restored after snapshot independence verification'
);

// -----------------------------------------------------------------------------
// 8. Non-billable tea and snacks audit exclusion
// -----------------------------------------------------------------------------
console.log('\n--- 8. Non-billable Snacks & Tea Audit Exclusion ---');
const hydacSep = MOCK_ARCHIVED_INVOICES.find(i => i.id === 'inv-2026-09-hydac');
let daysWithSnacksOrTea = 0;
for (const entry of hydacSep.entries) {
  if ((entry.tea || 0) > 0 || (entry.snacks || 0) > 0) {
    daysWithSnacksOrTea++;
    const rowQty = entry.billQty;
    // Calculate what rowQty would be if snacks/tea were accidentally added
    const accidentalQty = (entry.breakfast || 0) + (entry.dinner || 0) + (entry.tea || 0) + (entry.snacks || 0);
    if (!entry.combinedNotation && !entry.isSunday) {
      assert(
        rowQty < accidentalQty,
        `Date ${entry.dateString}: billQty (${rowQty}) strictly excludes tea (${entry.tea}) and snacks (${entry.snacks})`
      );
    }
  }
}
assert(daysWithSnacksOrTea > 0, `Verified snacks and tea audit entries across ${daysWithSnacksOrTea} days`);

// -----------------------------------------------------------------------------
// 9. Combined notation rule in daily entries
// -----------------------------------------------------------------------------
console.log('\n--- 9. Combined Notation Headcount Rule ---');
const hydacOct = MOCK_ARCHIVED_INVOICES.find(i => i.id === 'inv-2026-10-hydac');
const combinedEntry = hydacOct.entries.find(e => e.dayNumber === 14);
assert(combinedEntry !== undefined, 'Found combined entry on Oct 14');
assert(
  combinedEntry.combinedNotation === '65 Breakfast, Dinner',
  `Oct 14 notation is "65 Breakfast, Dinner"`
);
assert(
  combinedEntry.billQty === 65,
  `Oct 14 billQty is exactly 65 (not doubled to 130)`
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${totalTests - passedTests}`);
console.log('================================================================');

if (passedTests === totalTests) {
  console.log('🎉 ALL PHASE 3D STEP 2 VERIFICATION CHECKS PASSED PERFECTLY!\n');
} else {
  process.exit(1);
}
