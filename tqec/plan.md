# Plan: TQEC Learning Tool

## Goal
User wants: (1) folder `tqec/papers` with all listed arXiv PDFs downloaded, (2) read the papers, (3) build a tool to understand prerequisite knowledge and the TQEC material itself.

## Stage 1 — Download papers
- Create `/mnt/agents/output/tqec/papers/`
- Download all 22 arXiv PDFs via curl (direct /pdf/ URLs)
- Verify each file is a valid PDF

## Stage 2 — Knowledge extraction (research subagents)
- Extract titles/abstracts + key concepts from papers (pdftotext)
- Map the prerequisite knowledge tree: linear algebra, quantum mechanics, quantum computing basics, stabilizer formalism, error correction basics → toric/surface codes → lattice surgery → decoding → magic states → design automation tools (TopoLS, Clifft, etc.)
- Summarize each paper: contribution, required prerequisites, place in the timeline
- Output: structured JSON/markdown content for the tool

## Stage 3 — Build the learning tool (vibecoding-webapp-swarm)
- Interactive React web app: "TQEC Learning Companion"
  - Prerequisite knowledge tree (interactive, with explanations per node)
  - Guided learning path ordered by difficulty
  - Paper explorer: timeline of the 22 papers with summaries, prereqs, why-it-matters
  - Glossary + current state of the field (magic state cultivation, decoding, tools)
- Build with Vite, verify build passes

## Stage 4 — Deliver
- website_version_manager build_version (type: static)
- Final response with file refs + version
