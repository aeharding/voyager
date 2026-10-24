# Daily security maintenance

The `security` workflow runs daily at 13:17 UTC. It can also be started with
`gh workflow run security.yml --repo aeharding/voyager`.

Each run:

- Checks the Node.js pin against the official release index and support schedule.
- Scans supported dependency lockfiles, including development dependencies, for
  published vulnerabilities.
- Scans the published Voyager container and the Docker build runtime for library
  and operating-system vulnerabilities.
- Runs Renovate to open security-fix PRs and keep runtime patch releases and image
  digests current. Node minor updates are allowed within the existing major because
  Node security releases can change the minor version.

Full scanner reports are retained as Actions artifacts for 30 days. High and
critical findings fail their audit jobs, including vulnerabilities without a
published fix. Lower-severity findings remain in the reports. Remediation runs
independently, so findings do not prevent fix PRs from being prepared.

Fix PRs trigger Voyager's usual CI using the existing `PAT_TOKEN` credential.
They require review and are not automatically merged. Normal release workflows
remain responsible for publishing approved changes to users.

The scanners detect known advisories, not every possible flaw or exploitability.
Renovate's OSV integration covers direct dependencies; GitHub dependency alerts
provide additional transitive fixes. Packages without a compatible fix can need
manual changes. Native operating-system/WebView updates remain the responsibility
of the user's platform vendor, and Android transitive dependencies without a
resolved lockfile are not fully covered by the lockfile scan.

To change the cadence, edit the cron expression in `.github/workflows/security.yml`.
To stop the audits, disable the `security` workflow in GitHub Actions. Routine
non-security application dependency upgrades remain outside this automation.
