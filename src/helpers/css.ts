type Falsey = undefined | null | "" | false;
type CssVariables = Falsey | Record<string, unknown>;

export function sv(variables: CssVariables) {
  if (!variables) return;

  const style: Record<string, unknown> = {};

  for (const thing in variables) {
    const value = variables[thing];
    if (value == null || value === "" || value === false) continue;
    style[`--sv-${thing}`] = variables[thing];
  }

  return style;
}

// https://github.com/jalalazimi/classwind/blob/main/src/index.ts
export function cx(...args: (string | Falsey)[]) {
  let result = "";
  const len = args.length;

  for (let i = 0; i < len; i++) {
    const className = args[i];

    if (!className) continue;

    result = (result && (result += " ")) + className;
  }

  return result;
}
