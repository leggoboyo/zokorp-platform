#!/usr/bin/env python3

from __future__ import annotations

import argparse
import re
import sys
import time
from pathlib import Path

VALID_STATUSES = {"ACTIVE", "PAUSED"}


def update_automation_file(path: Path, status: str) -> str:
    content = path.read_text(encoding="utf-8")

    updated_content, replaced = re.subn(
        r'(?m)^status = "[^"]*"$',
        f'status = "{status}"',
        content,
        count=1,
    )
    if replaced != 1:
        raise ValueError("Could not find a status field to update.")

    updated_at = str(int(time.time() * 1000))
    if re.search(r"(?m)^updated_at = \d+$", updated_content):
        updated_content = re.sub(
            r"(?m)^updated_at = \d+$",
            f"updated_at = {updated_at}",
            updated_content,
            count=1,
        )
    else:
        if not updated_content.endswith("\n"):
            updated_content += "\n"
        updated_content += f"updated_at = {updated_at}\n"

    path.write_text(updated_content, encoding="utf-8")
    return updated_at


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Update the status of a Codex automation TOML file.",
    )
    parser.add_argument(
        "--path",
        required=True,
        help="Path to the automation.toml file.",
    )
    parser.add_argument(
        "--status",
        required=True,
        choices=sorted(VALID_STATUSES),
        help="The new automation status.",
    )
    args = parser.parse_args()

    path = Path(args.path).expanduser().resolve()
    if not path.exists():
        raise FileNotFoundError(f"Automation file not found: {path}")

    updated_at = update_automation_file(path, args.status)
    print(f"Updated {path} to status={args.status} updated_at={updated_at}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:  # pragma: no cover - defensive CLI error path
        print(f"Failed to update automation: {error}", file=sys.stderr)
        raise SystemExit(1)
