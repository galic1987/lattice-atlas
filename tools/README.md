# Video Pipeline — how clips get from prompt to page

Plain-English guide to the video tooling. Everything stages through
`video-inbox/` (gitignored) — nothing reaches the site without passing
validation and human review.

**Storage**: `video-inbox/` is a symlink to `/Volumes/Radiator 8TB/qtec/video-inbox`
(external drive — raw clips are huge). The old zip snapshot archive also lives
there as `archive-quantum-knowledge-map` (symlinked at repo root). If the drive
isn't mounted, the scripts simply find no clips.

## The stages

```
1. PROMPT   →  2. GENERATE  →  3. VALIDATE  →  4. COMPRESS  →  5. REVIEW  →  6. WIRE
   write it      render it      inspect it      shrink it      you decide      into a page
```

### 1. Prompt
Jobs live in the `JOBS` arrays of the two generator scripts. A good prompt here
is: one subject, one motion, palette pinned (dark navy + cyan/violet), and
always ends with "no text, no letters". Concept clips must stay *qualitative*
— a clip may show an analogy, never data, counts, or circuit geometry.

### 2. Generate
Two providers, same job shape:

| Script | Provider | Best for | Credentials (env only) |
|---|---|---|---|
| `tools/veo/generate.mjs` | Google Veo 3.1 direct | text-to-video, best quality | `GEMINI_API_KEY` |
| `tools/higgsfield/generate.mjs` | Higgsfield (soul→DoP) | animating an existing image | `HF_CREDENTIALS` |

```bash
cd tools/veo        && GEMINI_API_KEY="..." node generate.mjs [jobId...]
cd tools/higgsfield && HF_CREDENTIALS="id:secret" node generate.mjs [jobName...]
```

- No arguments = run the whole manifest. With names = run just those.
- Veo: max ~3 concurrent (pool + 429 backoff built in). Daily quota applies.
- Higgsfield: source frame auto-generated via soul when the job has
  `imagePrompt`, or pass `source` (URL) to animate an existing image.

### 3. Validate
```bash
bash tools/veo/validate-clips.sh            # all clips in video-inbox/
bash tools/veo/validate-clips.sh foo.mp4    # one clip
```
Prints duration / resolution / size / bitrate + flags (`big`, `lowres`,
codec) and writes `<clip>.sheet.png` — a 6-frame contact sheet. **A human
(or the agent) must look at the sheet**: reject clips with burned-in text,
people, off-brand colors, or an illegible subject. Rejects get a re-prompt
with the failure mode added to the negative prompt.

### 4. Compress
```bash
bash tools/veo/compress-clips.sh            # all clips → video-inbox/web/
```
Raw clips are 10–25 MB; web versions target ~1–2 MB (h264 CRF 28, 720p,
no audio, faststart). Validate the compressed copy before wiring
(`bash tools/veo/validate-clips.sh` inside `web/` works the same way).

### 5. Review
The agent posts a verdict table (pass / warn / reject + one-line reason)
with contact sheets. Nothing wires without an explicit go-ahead.

### 6. Wire
Per batch, a small PR: clips move to `app/public/clips/`, embedded muted +
`loop` + `playsinline` + `preload="none"` with a poster frame, empty alt
(decorative doctrine), and a static image under `prefers-reduced-motion`.
`check-bundles` must pass.

## Credentials
Never in the repo, never in scripts. Env vars per command, rotate after
each working session (they transit chat logs).
