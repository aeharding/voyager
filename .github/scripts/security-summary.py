"""Summarize a Trivy JSON report and flag high/critical findings, including unfixed ones."""

import collections
import json
import os
from pathlib import Path
import sys

report = json.loads(Path(sys.argv[1]).read_text())
if report.get("SchemaVersion") != 2:
    raise ValueError("Unsupported or incomplete Trivy report")

findings = [
    vulnerability
    for result in report.get("Results") or []
    for vulnerability in result.get("Vulnerabilities") or []
]
counts = collections.Counter(item["Severity"] for item in findings)
urgent = [item for item in findings if item["Severity"] in {"HIGH", "CRITICAL"}]
lines = [
    f"## Vulnerability audit: {Path(sys.argv[1]).name}",
    "",
    " | ".join(f"{level}: {counts[level]}" for level in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"]),
    "",
    "| Package | Installed | Fixed | Severity | Advisory |",
    "| --- | --- | --- | --- | --- |",
]
for item in urgent[:100]:
    values = [
        item["PkgName"],
        item["InstalledVersion"],
        item.get("FixedVersion") or "No fix published",
        item["Severity"],
        item["VulnerabilityID"],
    ]
    lines.append("| " + " | ".join(str(value).replace("|", "\\|").replace("\n", " ") for value in values) + " |")
lines.extend(["", "Full results, including lower-severity findings, are in the audit artifact.", ""])
summary = "\n".join(lines)
print(summary)
if os.environ.get("GITHUB_STEP_SUMMARY"):
    with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as output:
        output.write(summary)
sys.exit(1 if urgent else 0)
