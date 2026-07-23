const FeeChallan = require('../model/FeeChallan');

/**
 * Generate unique challan number: CH-YYYY-0001 (never duplicates).
 */
async function generateUniqueChallanNo() {
  const year = new Date().getFullYear();
  const prefix = `CH-${year}-`;

  // Find highest sequence for this year
  const latest = await FeeChallan.findOne({
    challanNo: new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
  })
    .sort({ createdAt: -1 })
    .select('challanNo');

  let nextSeq = 1;
  if (latest?.challanNo) {
    const parts = latest.challanNo.split('-');
    const seq = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(seq)) nextSeq = seq + 1;
  }

  for (let attempt = 0; attempt < 100; attempt++) {
    const candidate = `${prefix}${String(nextSeq + attempt).padStart(4, '0')}`;
    const exists = await FeeChallan.findOne({ challanNo: candidate });
    if (!exists) return candidate;
  }

  return `${prefix}${Date.now()}`;
}

module.exports = { generateUniqueChallanNo };
