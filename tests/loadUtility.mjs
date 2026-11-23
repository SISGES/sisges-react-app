import { readFileSync } from "node:fs";
import ts from "typescript";

export async function loadUtility(name) {
  const source = readFileSync(
    new URL(`../src/utils/${name}.ts`, import.meta.url),
    "utf8",
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2020 },
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
}
