#!/bin/bash
BOLD='\033[1m'
DIM='\033[2m'
CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RESET='\033[0m'
SEP="${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

lsof -ti :3000 | xargs kill -9 2>/dev/null

echo -e "$SEP"
echo -e "  ${BOLD}${CYAN}◈ Static Value Benchmark${RESET}"
echo -e "  ${DIM}app.get('/hello', { message: ... })${RESET}"
echo -e "$SEP"

for framework in "Velox" "Elysia" "Hono" "Express"; do
  case $framework in
    Velox)  cmd="bun src/velox/static-value/server-velox.ts" ;;
    Elysia) cmd="bun src/velox/static-value/server-elysia.ts" ;;
    Hono)   cmd="bun src/velox/static-value/server-hono.ts" ;;
    Express) cmd="bun src/velox/static-value/server-express.ts" ;;
  esac

  $cmd &
  PID=$!
  sleep 1

  echo ""
  echo -e "  ${BOLD}${YELLOW}▸ $framework${RESET}"
  echo ""
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
echo -e "${GREEN}✓ Static value benchmark complete${RESET}"
