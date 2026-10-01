#!/bin/bash
# POST /hello/:par1/:par2 with body/query/params/headers validation (see src/velox/http-bench.ts)
set -e
cd "$(dirname "$0")/../../.."
bun src/velox/http-bench.ts validation
