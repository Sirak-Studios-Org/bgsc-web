#!/bin/bash
set -e
echo "Building Next.js..."
npm run build
echo "Syncing Capacitor..."
npx cap sync
echo "Done. Open Android Studio: npx cap open android"
echo "Open Xcode: npx cap open ios"
