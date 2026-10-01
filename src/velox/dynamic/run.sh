#!/bin/bash
# GET /hello with a handler function (see src/velox/http-bench.ts)
set -e
cd "$(dirname "$0")/../../.."
bun src/velox/http-bench.ts dynamic
