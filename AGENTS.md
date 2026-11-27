# Interface repository work

- Interface owns browser behavior. Use the Contracts SDK for schemas and catalogs and the Remote API for server behavior. Preserve unavailable capability declarations and keep Python out of the product build and runtime.
- Preserve workbench source assets, artwork provenance and useful regression fixtures.
- Use [Task Continuity](https://github.com/cirnetlab/cirnet-rules/blob/master/en/docs/distribution.md#task-continuity) for temporary plans, acceptance criteria and progress. Keep independent design specifications and durable plans in this repository and reference them from the checkpoint. Mark items complete after verification.
- Search existing documentation before adding anything. Update the authoritative page, consolidate duplication and verify its references. Update paired [English](docs/en/index.md) and [Vietnamese](docs/vi/index.md) pages and the applicable [English changelog](CHANGELOG.md).
- Distinguish TARGET, IMPLEMENTED, TESTED, VERIFIED, RELEASED, UNAVAILABLE and BLOCKED. Keep raw logs and visual outputs outside checkouts and Git directories using the shared allocator.
- Review status, diff and ignored outputs. Stage, commit, tag, push or deploy only on request.
