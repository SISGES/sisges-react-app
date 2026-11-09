import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(
  new URL("../src/utils/eventDateTime.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2020 },
});
const { eventDateTimeToIso } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("event timestamps preserve local time and include the timezone required by the API", () => {
  const original = process.env.TZ;
  try {
    for (const [zone, expected] of [
      ["America/Sao_Paulo", "2040-09-09T22:05:00.000Z"],
      ["UTC", "2040-09-09T19:05:00.000Z"],
      ["Asia/Kolkata", "2040-09-09T13:35:00.000Z"],
    ]) {
      process.env.TZ = zone;
      const result = eventDateTimeToIso("2040-09-09", "19:05");
      assert.equal(result, expected, zone);
      assert.equal(new Date(result).getHours(), 19);
      assert.equal(new Date(result).getMinutes(), 5);
    }
    process.env.TZ = "America/Sao_Paulo";
    assert.equal(
      eventDateTimeToIso("2040-09-09", "23:59"),
      "2040-09-10T02:59:00.000Z",
    );
    for (const [date, time] of [
      ["2040-02-31", "19:05"],
      ["2040-09-09", "24:00"],
      ["2040-09-09", "08:"],
      ["", ""],
    ]) {
      assert.throws(() => eventDateTimeToIso(date, time));
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});
