import assert from "node:assert/strict";
import {
  calculateRowBillQty,
  extractCombinedQuantity,
  applyPresetToAllNonSundays,
  generateMonthlyCalendar,
  calculateBillingKpis,
} from "@/lib/utils/billing-calculations";
import {
  computeExtractedRowBillQty,
  mergeTwoExtractedRecords,
  mergeDuplicateExtractedRecords,
  computeExtractionStats,
  buildReconciliationDiff,
  MOCK_NOVEMBER_2026_EXTRACTIONS,
} from "@/lib/services/extraction-service";

console.log("=== RUNNING PHASE 3C STEP 1.1 VERIFICATION TESTS ===\n");

// --- TEST 1: Combined meal notation extraction ---
console.log("TEST 1: Combined meal notation '65 Breakfast, Dinner'");
{
  assert.equal(extractCombinedQuantity("65 Breakfast, Dinner"), 65);
  assert.equal(extractCombinedQuantity("65 (B+D)"), 65);
  assert.equal(extractCombinedQuantity(""), null);
  assert.equal(extractCombinedQuantity(null), null);
  assert.equal(extractCombinedQuantity(undefined), null);

  const entry = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 5,
    tea: 10,
    particulars: "BREAKFAST & DINNER",
    combinedNotation: "65 Breakfast, Dinner",
  };
  const billQty = calculateRowBillQty(entry);
  console.log(`  -> calculateRowBillQty returned: ${billQty}`);
  assert.equal(billQty, 65, "Combined meal count must return 65, NOT 0 and NEVER doubled to 130");

  const extractedBillQty = computeExtractedRowBillQty(entry, "BREAKFAST & DINNER");
  console.log(`  -> computeExtractedRowBillQty returned: ${extractedBillQty}`);
  assert.equal(extractedBillQty, 65, "computeExtractedRowBillQty must match calculateRowBillQty");
}
console.log("PASS: Test 1\n");

// --- TEST 2: Combined + Combined duplicate date merge ---
console.log("TEST 2: Merging two combined records (65 + 20)");
{
  const rec1 = {
    id: "r1",
    date: "2026-11-04",
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 5,
    tea: 10,
    status: "COMBINED",
    confidence: 0.9,
    notes: "Batch 1",
    combinedNotation: "65 Breakfast, Dinner",
  };
  const rec2 = {
    id: "r2",
    date: "2026-11-04",
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 5,
    tea: 10,
    status: "COMBINED",
    confidence: 0.85,
    notes: "Batch 2",
    combinedNotation: "20 Breakfast, Dinner",
  };

  const merged = mergeTwoExtractedRecords(rec1, rec2);
  console.log(`  -> Merged notation: '${merged.combinedNotation}'`);
  console.log(`  -> Merged snacks: ${merged.snacks}, tea: ${merged.tea}`);

  const billQty = calculateRowBillQty(merged);
  console.log(`  -> calculateRowBillQty for merged: ${billQty}`);
  assert.equal(billQty, 85, "65 + 20 must equal 85");
  assert.equal(merged.snacks, 10, "Snacks must sum to 10");
  assert.equal(merged.tea, 20, "Tea must sum to 20");
}
console.log("PASS: Test 2\n");

// --- TEST 3: Individual shift meal counts ---
console.log("TEST 3: Individual shift meals (30 breakfast + 40 dinner)");
{
  const entry = {
    breakfast: 30,
    lunch: 0,
    dinner: 40,
    snacks: 5,
    tea: 10,
    particulars: "BREAKFAST & DINNER",
  };
  const billQty = calculateRowBillQty(entry);
  console.log(`  -> calculateRowBillQty returned: ${billQty}`);
  assert.equal(billQty, 70, "30 + 40 must equal 70");
}
console.log("PASS: Test 3\n");

// --- TEST 4: Audit-only pantry tallies (Snacks & Tea) excluded ---
console.log("TEST 4: Pantry items (5 snacks, 10 tea) strictly excluded from billQty");
{
  const entryOnlyPantry = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 50,
    tea: 100,
    particulars: "BREAKFAST & DINNER",
  };
  const billQty = calculateRowBillQty(entryOnlyPantry);
  console.log(`  -> calculateRowBillQty for pantry-only: ${billQty}`);
  assert.equal(billQty, 0, "Snacks and tea must NEVER contribute to billable meal quantity");
}
console.log("PASS: Test 4\n");

// --- TEST 5: Combined + Individual merge ---
console.log("TEST 5: Merging Combined (65) + Individual (10 bf + 15 din)");
{
  const recCombined = {
    id: "r1",
    date: "2026-11-04",
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 5,
    tea: 10,
    status: "COMBINED",
    confidence: 0.9,
    notes: "Main shift",
    combinedNotation: "65 Breakfast, Dinner",
  };
  const recIndividual = {
    id: "r2",
    date: "2026-11-04",
    breakfast: 10,
    lunch: 0,
    dinner: 15,
    snacks: 5,
    tea: 10,
    status: "CONFIDENT",
    confidence: 0.95,
    notes: "Extra crew",
  };

  const merged = mergeTwoExtractedRecords(recCombined, recIndividual);
  console.log(`  -> Merged notation: '${merged.combinedNotation}'`);
  console.log(`  -> Merged breakfast: ${merged.breakfast}, dinner: ${merged.dinner}`);
  console.log(`  -> Merged snacks: ${merged.snacks}, tea: ${merged.tea}`);

  const billQty = calculateRowBillQty(merged);
  console.log(`  -> calculateRowBillQty for merged: ${billQty}`);
  assert.equal(billQty, 90, "65 combined + 25 individual must equal 90");
  assert.equal(merged.snacks, 10);
  assert.equal(merged.tea, 20);

  // Reverse order merge
  const mergedRev = mergeTwoExtractedRecords(recIndividual, recCombined);
  assert.equal(calculateRowBillQty(mergedRev), 90, "Reverse merge order must also yield 90");
}
console.log("PASS: Test 5\n");

// --- TEST 6: Sunday rules ---
console.log("TEST 6: Sunday non-operational vs Sunday with overtime");
{
  const sundayNormal = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    particulars: "SUNDAY",
    isSunday: true,
  };
  assert.equal(calculateRowBillQty(sundayNormal), 0, "Normal Sunday must be 0");

  const sundayOvertime = {
    breakfast: 20,
    lunch: 0,
    dinner: 25,
    particulars: "SUNDAY",
    isSunday: true,
  };
  assert.equal(calculateRowBillQty(sundayOvertime), 45, "Sunday with overtime must be 45");

  const sundayLunchOvertime = {
    breakfast: 0,
    lunch: 35,
    dinner: 0,
    particulars: "SUNDAY",
    isSunday: true,
  };
  assert.equal(calculateRowBillQty(sundayLunchOvertime), 35, "Sunday with lunch overtime must be 35");
}
console.log("PASS: Test 6\n");

// --- TEST 7: Resilience across table edits & preset propagation ---
console.log("TEST 7: Resilience across table updates, preset resets, and KPI calculation");
{
  // Build a calendar for November 2026
  const calendar = generateMonthlyCalendar(10, 2026, "BREAKFAST & DINNER");
  
  // Day 4 has combined notation: 65 meals
  calendar[3] = {
    ...calendar[3],
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 5,
    tea: 10,
    combinedNotation: "65 Breakfast, Dinner",
    billQty: calculateRowBillQty({ combinedNotation: "65 Breakfast, Dinner" }),
  };
  assert.equal(calendar[3].billQty, 65);

  // Simulate user editing remarks on day 4
  const editedRow = {
    ...calendar[3],
    remarks: "Verified supervisor sheet",
  };
  editedRow.billQty = calculateRowBillQty(editedRow);
  console.log(`  -> Day 4 billQty after remarks edit: ${editedRow.billQty}`);
  assert.equal(editedRow.billQty, 65, "billQty must remain 65 after editing remarks");

  // Simulate applying preset to all non-Sundays
  calendar[3] = editedRow;
  const updatedCalendar = applyPresetToAllNonSundays(calendar, "BREAKFAST & DINNER");
  console.log(`  -> Day 4 billQty after applyPresetToAllNonSundays: ${updatedCalendar[3].billQty}`);
  assert.equal(updatedCalendar[3].billQty, 65, "billQty must remain 65 after applying presets");

  // Simulate regenerate with retainExisting = true
  const regenerated = generateMonthlyCalendar(10, 2026, "BREAKFAST & DINNER", updatedCalendar, true);
  console.log(`  -> Day 4 billQty after generateMonthlyCalendar(retainExisting): ${regenerated[3].billQty}`);
  assert.equal(regenerated[3].billQty, 65, "billQty must remain 65 after calendar regenerate with retainExisting");
  assert.equal(regenerated[3].combinedNotation, "65 Breakfast, Dinner");

  // Verify KPI calculation includes Day 4 as 65
  const kpis = calculateBillingKpis(regenerated, 70);
  console.log(`  -> Total billQty in KPIs: ${kpis.totalBillQty}`);
  assert.equal(kpis.totalBillQty, 65);
  assert.equal(kpis.totalAmount, 65 * 70);
}
console.log("PASS: Test 7\n");

// --- TEST 8: Mock records, stats, and reconciliation diff ---
console.log("TEST 8: Mock data verification, stats, and reconciliation diff");
{
  const stats = computeExtractionStats(MOCK_NOVEMBER_2026_EXTRACTIONS);
  console.log("  -> Mock extraction stats:", stats);
  assert.equal(stats.combinedCount, 1, "Mock data must have exactly 1 combined record");
  assert.equal(stats.zeroCount, 2, "Mock data must have 2 Sunday zero counts");

  const calendar = generateMonthlyCalendar(10, 2026, "BREAKFAST & DINNER");
  const { diffRows, summary } = buildReconciliationDiff(MOCK_NOVEMBER_2026_EXTRACTIONS, calendar);
  console.log(`  -> Reconciliation summary totalExtracted: ${summary.totalExtracted}`);
  assert.equal(summary.totalExtracted, 10);
  
  // Row 4 in mock data
  const row4Diff = diffRows.find((r) => r.date === "2026-11-04");
  assert(row4Diff, "Row 4 diff must exist");
  assert.equal(row4Diff.extractedRecord.combinedNotation, "65 Breakfast, Dinner");
}
console.log("PASS: Test 8\n");

console.log("==================================================");
console.log("ALL 8 VERIFICATION TEST SUITES PASSED SUCCESSFULLY!");
console.log("==================================================");
