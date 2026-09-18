#!/usr/bin/env python3
"""Validate that each sub-agent file has well-formed frontmatter."""

import pathlib
import sys

AGENTS_DIR = pathlib.Path(__file__).resolve().parent.parent / ".claude" / "agents"
REQUIRED_FIELDS = ("name", "description", "tools", "model")


def parse_frontmatter(text: str, path: pathlib.Path) -> dict[str, str]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        raise ValueError(f"{path}: file must start with a '---' frontmatter block")
    try:
        end = lines.index("---", 1)
    except ValueError:
        raise ValueError(f"{path}: frontmatter block is not closed with '---'")

    fields: dict[str, str] = {}
    for line in lines[1:end]:
        if not line.strip():
            continue
        if ":" not in line:
            raise ValueError(f"{path}: malformed frontmatter line: {line!r}")
        key, _, value = line.partition(":")
        fields[key.strip()] = value.strip()
    return fields


def main() -> int:
    errors: list[str] = []
    agent_files = sorted(AGENTS_DIR.glob("*.md"))
    if not agent_files:
        errors.append(f"no agent files found in {AGENTS_DIR}")

    for path in agent_files:
        text = path.read_text(encoding="utf-8")
        try:
            fields = parse_frontmatter(text, path)
        except ValueError as exc:
            errors.append(str(exc))
            continue

        for field in REQUIRED_FIELDS:
            if not fields.get(field):
                errors.append(f"{path}: missing required frontmatter field '{field}'")

        expected_name = path.stem
        if fields.get("name") and fields["name"] != expected_name:
            errors.append(
                f"{path}: frontmatter name '{fields['name']}' does not match "
                f"filename '{expected_name}'"
            )

    if errors:
        for error in errors:
            print(f"error: {error}", file=sys.stderr)
        print(f"\n{len(errors)} error(s) found", file=sys.stderr)
        return 1

    print(f"{len(agent_files)} agent file(s) OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
