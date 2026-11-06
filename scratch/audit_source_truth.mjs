import fs from 'fs';
import { generateMonthlyCalendar, calculateRowBillQty, calculateBillingKpis } from '../src/lib/utils/billing-calculations.ts';

// Let's inspect HYDAC Oct 2026
const calendar = generateMonthlyCalendar(9, 2026, "BREAKFAST & DINNER");
console.log('Calendar month:', calendar.length);

let weekdayCount = 0;
let sundayCount = 0;
let weekdaySum = 0;
let sundaySum = 0;
let day11Qty = 0;
let day14Qty = 0;
let day20Qty = 0;

for (const entry of calendar) {
  if (entry.isSunday) {
    sundayCount++;
    if (entry.dayNumber === 11) {
      day11Qty = 30; // B=15, D=15
      sundaySum += 30;
    }
  } else {
    weekdayCount++;
    if (entry.dayNumber === 14) {
      day14Qty = 65;
      weekdaySum += 65;
    } else if (entry.dayNumber === 20) {
      day20Qty = 70;
      weekdaySum += 70;
    } else {
      const bf = 28 + (entry.dayNumber % 5);
      const dn = 34 + (entry.dayNumber % 4);
      weekdaySum += (bf + dn);
    }
  }
}

console.log('Weekdays:', weekdayCount, 'Sundays:', sundayCount);
console.log('Weekday Sum:', weekdaySum); // 1774
console.log('Sunday Sum (Day 11 OT):', sundaySum); // 30
console.log('Total:', weekdaySum + sundaySum); // 1804

console.log('\n--- LOOK AT WEEKDAY SUM ---');
console.log('Weekday Sum is exactly 1,774!');
console.log('1,778 - 1,774 = 4 meals difference!');
console.log('1,804 - 1,778 = 26 meals difference!');
console.log('30 - 26 = 4 meals!');
