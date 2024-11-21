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

export function cx(...classes: (string | Falsey)[]) {
  return classes.filter(Boolean).join(" ");
}
