#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://localhost:3000/collab}"
OUT_DIR="test-results"
HTML="$OUT_DIR/collab.html"
PNG="$OUT_DIR/collab.png"
JSON="$OUT_DIR/collab-simple-audit.json"

mkdir -p "$OUT_DIR"

# Fetch HTML
curl -sS "$URL" > "$HTML"

# Screenshot with system Chrome if available
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ -x "$CHROME" ]; then
  "$CHROME" \
    --headless \
    --disable-gpu \
    --hide-scrollbars \
    --window-size=1440,900 \
    --screenshot="$PNG" \
    "$URL" >/dev/null 2>&1 || true
fi

# Text audit
has_online=$(grep -qi "0 online" "$HTML" && echo true || echo false)
has_plus=$(grep -qi ">Add new session<" "$HTML" && echo true || echo false)
has_settings=$(grep -qi ">Settings<" "$HTML" && echo true || echo false)
has_sidebar_nav=$(grep -qi "nav aria-label=\"Primary navigation\"" "$HTML" && echo true || echo false)
has_header=$(grep -qi "role=\"banner\"" "$HTML" && echo true || echo false)
has_main=$(grep -qi "role=\"main\"" "$HTML" && echo true || echo false)
has_chat_root=$(grep -qi "data-chat-root=\"true\"" "$HTML" && echo true || echo false)

cat > "$JSON" <<EOF
{
  "url": "$URL",
  "a11y": {
    "hasSidebarNav": $has_sidebar_nav,
    "hasHeader": $has_header,
    "hasMain": $has_main
  },
  "ui": {
    "onlineBadgePresent": $has_online,
    "sidebarPlusPresent": $has_plus,
    "sidebarSettingsPresent": $has_settings,
    "chatRootPresent": $has_chat_root
  },
  "artifacts": {
    "html": "$HTML",
    "screenshot": "$PNG"
  }
}
EOF

cat "$JSON"


