# CIRNET Interface version 0 changelog

[Changelog index](README.md)

## Unreleased

### Added

- Introduce the CIRNET LAB Light Workbench with a Project Explorer, docked PropertyManager, command search and reversible Focus Mode.
- Add keyboard and pointer resizing for both docks and a 3D view tab with an editing toolbar.

### Changed

- Extend command search to editor and layout actions and standardize Ribbon group icons around the existing instrument artwork.
- Group Interface source, tests, scripts and browser suites by responsibility. Discover nested tests and accept unambiguous targeted selectors.
- Group the procedural Three.js instrument models, artwork and chassis in `src/three/instruments/` and document workbench source ownership.
- Standardize English major-version changelog navigation.

## v0.3.0-dev.1 — Development

Git tags and GitHub Releases provide no publication date for this development version.

### Added

- Add an Interface verification workflow that selects a Remote candidate by run ID and checks all four build inputs against its reviewed manifest.

### Changed

- Migrate the Vue and Three.js workbench, browser tests and assets. Select native Contracts and Remote build inputs by digest.
- Link the workbench safety boundary to CIRNET Lab-First.
- Run Interface CI on master pushes using generated inputs from pinned sources, and allocate manual candidate paths after the runner starts.
- Limit the private dependency secret to the Contracts checkout.
- Authenticate the pinned Remote checkout after Remote became private.
- Check the pinned CI toolchain order and reconnect the real browser event stream after a virtual AND run without replaying Create or Run.
- Use the verified source fixtures for the palette benchmark and pin the independent Contracts and Remote roots in CI.

**Source**

- [Native implementation baseline](https://github.com/cirnetlab/cirnet-interface/commit/216d965cafaf164686e8134ae8603d907fc6d381)
