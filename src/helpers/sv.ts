import { Falsey } from "lodash";

type CssVariables = Falsey | Record<string, unknown>;

export default function sv(variables: CssVariables) {
  if (!variables) return {};
  const style: Record<string, unknown> = {};

  for (const thing in variables) {
    if (!variables[thing]) continue;
    style[`--sv-${thing}`] = variables[thing];
  }

  return style;
}
