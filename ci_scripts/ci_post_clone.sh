#!/bin/sh

set -eu

REPOSITORY_ROOT="${CI_PRIMARY_REPOSITORY_PATH:-$(pwd)}"
APP_DIR="$REPOSITORY_ROOT/app"

echo "Preparing Capacitor iOS assets for Xcode Cloud..."

cd "$APP_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not available; installing it with Homebrew..."
  brew install node
fi

npm ci
npx cap sync ios

test -d ios/App/App/public
test -f ios/App/App/capacitor.config.json
test -f ios/App/App/config.xml

echo "Capacitor iOS assets are ready."
