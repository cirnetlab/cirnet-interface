# Maintain Interface documentation

[Tiếng Việt](../../vi/contributing/writing-documentation.md) · [Documentation](../index.md) · [Repository instructions](../../../AGENTS.md)

Keep current guides under `docs/en/` and `docs/vi/` at matching paths. Update both versions together and keep identifiers, examples, constraints and capability claims consistent. The workbench architecture describes the browser implementation and selected Contracts. Remote owns system integration.

Use [changelogs](../../changelogs/README.md) for verified version changes. Record changes since the last release under Unreleased. Give each released version a SemVer heading, a linked contents entry and a sourced publication date.

For each AI task, save the plan in `.superpowers/plans/` and its matching spec, acceptance criteria and checklist in `.superpowers/specs/`. Tick only verified completions. These directories are ignored in this checkout.

