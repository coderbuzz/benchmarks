#!/bin/bash
# Dynamic benchmark: function handler
# All frameworks: app.get('/path', () => ({ ... }))

lsof -ti :3000 | xargs kill -9 2>/dev/null

echo "══════════════════════════════════════"
echo "  Dynamic Handler Benchmark"
echo "  app.get('/hello', () => ({...}))"
echo "══════════════════════════════════════"

for framework in "Ken" "Elysia" "Hono"; do
  case $framework in
    Ken)   cmd="bun packages/ken/dynamic/server-ken.ts" ;;
    Elysia) cmd="bun packages/ken/dynamic/server-elysia.ts" ;;
    Hono)  cmd="bun packages/ken/dynamic/server-hono.ts" ;;
  esac

  $cmd &
  PID=$!
  sleep 1

  echo ""
  echo "--- $framework ---"
  if [ "$WRK" = "1" ]; then
    wrk -t4 -c100 -d10s http://127.0.0.1:3000/hello
  else
    oha -c 100 -z 10s -m GET "http://127.0.0.1:3000/hello"
  fi

  kill $PID 2>/dev/null; wait $PID 2>/dev/null
  lsof -ti :3000 | xargs kill -9 2>/dev/null
  sleep 0.5
done

echo ""
echo "Dynamic handler benchmark complete."
