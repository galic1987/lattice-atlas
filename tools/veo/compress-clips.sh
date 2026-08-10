#!/bin/bash
# Compress validated clips for the web: video-inbox/*.mp4 → video-inbox/web/*.mp4
# h264 CRF 28, max 720p, no audio, faststart. Usage: ./compress-clips.sh [clip.mp4...]
set -u
cd "$(dirname "$0")/../../video-inbox" || exit 1
mkdir -p web

shopt -s nullglob
clips=("$@")
[ ${#clips[@]} -eq 0 ] && clips=(*.mp4)

for f in "${clips[@]}"; do
  [ -f "$f" ] || continue
  out="web/$(basename "$f")"
  before=$(du -h "$f" | cut -f1)
  ffmpeg -v error -i "$f" -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 28 \
         -preset slow -pix_fmt yuv420p -an -movflags +faststart "$out" -y || {
    echo "✗ $f: ffmpeg failed"; continue;
  }
  after=$(du -h "$out" | cut -f1)
  echo "✓ $f  $before → $after"
done
echo "web copies in video-inbox/web/ — re-validate before wiring"
