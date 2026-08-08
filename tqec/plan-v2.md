# Plan v2: Lattice Atlas — "The Full Experience" upgrade

Source: three external notes (Gemini synthesis, Claude review, ChatGPT execution plan).

## Stage 1 — Research (parallel subagents)
- Agent A: metadata for 22 extension arXiv papers + tqec JOSS paper (design automation canon): 1704.08670, 1904.04735, 2103.02202, 2209.08552, 2302.02459, 2303.15933, 2305.08307, 2311.18042, 2403.01353, 2404.18369, 2406.08491, 2409.17595, 2502.01743, 2504.11805, 2509.05232, 2509.08658, 2512.07737, 2512.23037, 2601.23109, 2604.01059, 2604.27058, 2607.28600, tqec JOSS. Verify via web search/arXiv.
- Agent B: metadata for 6 cultivation-variant thread papers: RP² PRX Quantum 7, 010315; 2504.02935; 2510.24615; 2603.05429; 2605.21867; Litinski 1808.02892.
- Agent A also downloads all new PDFs to /mnt/agents/output/tqec/papers/ (extend the library).

## Stage 2 — Data layer update (subagent, branch fix-v2-data)
- Merge new papers into src/data/papers.json with new era `design automation era`; RP² (2001) → foundations; Litinski 1808.02892 → lattice surgery era.
- PDF-verified corrections: DKLP p_c ≥ 1.7×10⁻⁴; Fowler review ~10⁹ qubits for Shor-2000; Horsman merge convention correction (rough merge = X_L⊗X_L, smooth merge = Z_L⊗Z_L) — add "verified_note" fields.
- Update ERAS metadata (keys, counts, year ranges), make paper-count stats dynamic, add 1 new tier-6 topic "cultivation variants" to topics.json.

## Stage 3 — New experience pages (parallel subagents)
- Branch fix-v2-synthesis: new page /eda-turn — Gemini's synthesis: three phases (braiding→lattice surgery = TopoLS; magic state bottleneck = Clifft; real-time decoding latency) telling "building a quantum computer is now an EDA problem", wired to papers and tools.
- Branch fix-v2-fieldtoday: fold cultivation variants into Field Today (new deep-dive block + shelf papers).
- Branch fix-v2-roadmap: new page /roadmap — the 12-week execution plan (3 reproductions → paper #1 → GPU simulator track → certifier → consolidation), visual timeline, weekly cadence, risks.
- Navbar/Footer route additions handled in final-build wiring (or data agent adds routes early).

## Stage 4 — Merge, build, version (main agent)
- Fresh final-build worktree, merge all, wire routes, npm install + build, merge to master, build_version static.
