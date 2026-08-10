#!/bin/bash
# Validate generated clips in video-inbox/: technical metadata + contact sheets.
# Usage: ./validate-clips.sh [clip-name...]   (default: all *.mp4)
# Writes <clip>.sheet.png next to each clip and prints a report table.
set -u
cd "$(dirname "$0")/../../video-inbox" || exit 1

shopt -s nullglob
clips=("$@")
[ ${#clips[@]} -eq 0 ] && clips=(*.mp4)

printf "%-34s %6s %7s %9s %6s  %s\n" "clip" "dur" "res" "size" "kbps" "flags"
printf -- "--------------------------------------------------------------------------------------\n"

for f in "${clips[@]}"; do
  [ -f "$f" ] || { printf "%-34s MISSING\n" "$f"; continue; }
  base="${f%.mp4}"

  # Technical metadata
  meta=$(ffprobe -v error -show_entries format=duration,bit_rate -show_entries stream=width,height,codec_name \
         -of json "$f" 2>/dev/null)
  codec=$(echo "$meta" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['streams'][0].get('codec_name','?'))" 2>/dev/null)
  w=$(echo "$meta" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['streams'][0].get('width',0))" 2>/dev/null)
  h=$(echo "$meta" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['streams'][0].get('height',0))" 2>/dev/null)
  dur=$(echo "$meta" | python3 -c "import json,sys; d=json.load(sys.stdin); print(round(float(d['format'].get('duration',0)),1))" 2>/dev/null)
  kbps=$(echo "$meta" | python3 -c "import json,sys; d=json.load(sys.stdin); print(int(d['format'].get('bit_rate',0))//1000)" 2>/dev/null)
  size=$(du -h "$f" | cut -f1)

  flags=""
  [ "$codec" != "h264" ] && flags="$flags codec:$codec"
  [ "${h:-0}" -lt 700 ] && flags="$flags lowres"
  [ "${kbps:-0}" -gt 4000 ] && flags="$flags big"

  # Contact sheet: 6 frames across the clip, tiled horizontally
  ffmpeg -v error -i "$f" -vf "select='not(mod(n\,floor(n_frames/6)))',scale=320:-1,tile=6x1" \
         -frames:v 1 "${base}.sheet.png" -y 2>/dev/null || \
  ffmpeg -v error -i "$f" -vf "fps=1/2,scale=320:-1,tile=6x1" -frames:v 1 "${base}.sheet.png" -y 2>/dev/null

  printf "%-34s %5ss %4sx%-4s %7s %6s  %s\n" "$base" "$dur" "$w" "$h" "$size" "$kbps" "${flags:-ok}"
done
echo
echo "contact sheets written as <clip>.sheet.png — inspect before wiring"
