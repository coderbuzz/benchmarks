#!/bin/bash
# GET /hello with a static route value (see src/velox/http-bench.ts)
set -e
cd "$(dirname "$0")/../../.."
bun src/velox/http-bench.ts static-value
