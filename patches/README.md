# Patched dependencies

Voyager patches a few deps via pnpm `patchedDependencies` (`pnpm-workspace.yaml`).
Each is **exact-pinned** in `package.json` (no `^`) so a routine upgrade can't
orphan a version-keyed patch (`ERR_PNPM_UNUSED_PATCH`). To bump a patched dep,
regenerate its patch first, then bump the pin.

The notable one is **editate**, maintained as a soft fork; the rest are small
one-off edits.

## editate — soft fork

`editate` is a thin **soft fork** at
[aeharding/editate](https://github.com/aeharding/editate). Goal: upstream every
change and keep this patch shrinking toward zero.

**Source of truth:** branch
[`voyager`](https://github.com/aeharding/editate/tree/voyager) = the pinned
upstream tag + each not-yet-upstream fix as a clean, cherry-pickable commit, plus
repro stories (`stories/repro/`) and e2e (`e2e/`). The `editate@<ver>.patch` here
is that branch built and diffed against the npm-published tag.

| Fix            | Commit    | What                                                                                                                                                             | Upstream                                                    |
| -------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| composition    | `fb286b4` | finalize an active IME composition before a programmatic edit — else the edit lands in the composing region and is reverted at `compositionend` (Android GBoard) | issue [#372] · PR [#373] (open) · repro story merged [#371] |
| selection-sync | `06ea47d` | `editor.selection = …` moves the DOM caret, not just the model — fixes the rich editor caret jumping to start on iOS refocus                                     | issue [#386] · repro PR [#387] (open) · fix PR TODO         |

When a fix ships in an upstream **release**, drop its commit from `voyager` on
the next bump (the rebase auto-skips it).

### Regenerate (bump editate → `X`)

1. Fork (`~/editate`; remotes `origin`=inokawa, `fork`=aeharding):
   `git rebase --onto <X-tag> <old-tag> voyager`, drop anything now upstream,
   then `npm run build && npm test && npm run e2e`.
2. Voyager: bump the `editate` pin, then `pnpm patch editate@X`, copy the fork's
   built `lib/index.js` + `lib/index.cjs` into the edit dir,
   `pnpm patch-commit <dir>`, `prettier -w pnpm-workspace.yaml`.

> The `.patch` is a large minified diff — the local vite build renames variables
> differently than the npm-published build, so it's not byte-for-byte (it still
> applies correctly). **Review the fork's source commits, not the `.patch`.**

[#371]: https://github.com/inokawa/editate/pull/371
[#372]: https://github.com/inokawa/editate/issues/372
[#373]: https://github.com/inokawa/editate/pull/373
[#386]: https://github.com/inokawa/editate/issues/386
[#387]: https://github.com/inokawa/editate/pull/387

## Other patches

- **@capacitor/keyboard** — 3 iOS-native edits to
  `ios/Sources/KeyboardPlugin/Keyboard.m` (keyboard-height timing; needs a device
  test). Regenerate via `pnpm patch @capacitor/keyboard@X` + reapply the edits.
- **@capacitor/haptics**, **openapi-fetch** — small one-off patches; see the
  files in `patches/`.
