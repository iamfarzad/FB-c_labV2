#!/bin/bash

echo "Checking for hard-coded colors..."

# Check for hex colors
hex_colors=$(grep -r "#[0-9a-fA-F]\{3,6\}" components/ app/ --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null || true)
if [ ! -z "$hex_colors" ]; then
  echo "Found hard-coded hex colors:"
  echo "$hex_colors"
  exit 1
fi

# Check for RGB colors
rgb_colors=$(grep -r "rgb(" components/ app/ --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null || true)
if [ ! -z "$rgb_colors" ]; then
  echo "Found hard-coded RGB colors:"
  echo "$rgb_colors"
  exit 1
fi

# Check for RGBA colors
rgba_colors=$(grep -r "rgba(" components/ app/ --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null || true)
if [ ! -z "$rgba_colors" ]; then
  echo "Found hard-coded RGBA colors:"
  echo "$rgba_colors"
  exit 1
fi

echo "No hard-coded colors found"
exit 0