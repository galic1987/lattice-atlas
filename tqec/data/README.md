# ⚠ SUPERSEDED RESEARCH MATERIAL — do not merge from this directory

These JSON files are **pre-audit versions** kept as historical research material.
The canonical, physics-corrected data lives in `app/src/data/`:

- `knowledge_tree.json` here predates the precision pass (e.g. it still says
  logical operators are "vectors in a quotient space"; the shipped data says
  N(S)/S equivalence classes).
- `papers.json` here may lack `verified_note` fields and later accuracy hedges.

Merging FROM this directory INTO `app/src/data/` **regresses physics precision**.
If you need to edit content, edit `app/src/data/` and let `check-data` +
`check-codes` + `check-trust` verify it.
