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
echo -e "  ${BOLD}${CYAN}◈ Validation Benchmark${RESET}"
echo -e "  ${DIM}POST /hello/:par1/:par2 — Body + Query + Params + Headers${RESET}"
echo -e "$SEP"

DATA=$(cat src/ken/validation/post-data.json)

for framework in "Ken" "Elysia" "Hono" "Express"; do
  case $framework in
    Ken)    cmd="bun src/ken/validation/server-ken.ts" ;;
    Elysia) cmd="bun src/ken/validation/server-elysia.ts" ;;
    Hono)   cmd="bun src/ken/validation/server-hono.ts" ;;
    Express) cmd="bun src/ken/validation/server-express.ts" ;;
  esac

  $cmd &
  PID=$!
  sleep 1

  echo ""
  echo -e "  ${BOLD}${YELLOW}▸ $framework${RESET}"
  echo ""
  if [ "$WRK" = "1" ]; then
    wrk -t4 -c100 -d10s -s src/ken/validation/wrk-post.lua http://127.0.0.1:3000/hello/test/123
  else
    oha -c 100 -z 10s -m POST \
      -H "Content-Type: application/json" \
      -H "x-foo: test" \
      -d "$DATA" \
      "http://127.0.0.1:3000/hello/test/123?name=john&excitement=high"
  fi

  kill $PID 2>/dev/null; wait $PID 2>/dev/null
  lsof -ti :3000 | xargs kill -9 2>/dev/null
  sleep 0.5
done

echo ""
echo -e "${GREEN}✓ Validation benchmark complete${RESET}"
