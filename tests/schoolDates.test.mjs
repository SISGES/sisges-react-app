import assert from "node:assert/strict";
import test from "node:test";
import { loadUtility } from "./loadUtility.mjs";

const { brDateToIso, formatBrDateInput, isoDateToBr, formatIsoDatePtBr } =
  await loadUtility("brDate");
const { parseApiDateTime } = await loadUtility("parseApiDateTime");

test("school forms mask partial input and preserve valid calendar days", () => {
  for (const [input, expected] of [
    ["2", "2"],
    ["2902", "29/02"],
    ["29x0220249", "29/02/2024"],
  ]) {
    assert.equal(formatBrDateInput(input), expected);
  }
  for (const day of ["29/02/2024", "31/12/2026", "01/01/2027"]) {
    assert.equal(isoDateToBr(brDateToIso(day)), day);
  }
  for (const invalid of [
    "29/02/2025",
    "31/04/2026",
    "00/01/2026",
    "01/13/2026",
    "1/2/24",
    "",
  ]) {
    assert.equal(brDateToIso(invalid), "");
  }
  assert.equal(formatIsoDatePtBr(null), "—");
});

test("feed timestamps with a missing zone, UTC or an explicit offset agree", () => {
  const instant = Date.UTC(2026, 10, 8, 1, 5);
  for (const timestamp of [
    "2026-11-08T01:05:00",
    "2026-11-08T01:05:00Z",
    "2026-11-07T22:05:00-03:00",
  ]) {
    assert.equal(parseApiDateTime(timestamp).getTime(), instant);
  }
  assert.ok(Number.isNaN(parseApiDateTime("").getTime()));
});
