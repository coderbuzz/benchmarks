#!/bin/bash
# Static value benchmark: inline value handler (pre-compiled response)
# Ken and Elysia: app.get('/path', { hello: 'world' })
# Hono: function handler (no static optimization)

lsof -ti :3000 | xargs kill -9 2>/dev/null

echo "══════════════════════════════════════"
echo "  Static Value Benchmark"
echo "  app.get('/hello', { message: ... })"
echo "══════════════════════════════════════"

for framework in "Ken" "Elysia" "Hono"; do
  case $framework in
    Ken)   cmd="bun packages/ken/static-value/server-ken.ts" ;;
    Elysia) cmd="bun packages/ken/static-value/server-elysia.ts" ;;
    Hono)  cmd="bun packages/ken/static-value/server-hono.ts" ;;
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
echo "Static value benchmark complete."
