#!/bin/sh
# Builds public/wasm/lob.js + lob.wasm from wasm/src. Needs Emscripten (em++) on PATH.
set -e
cd "$(dirname "$0")"
mkdir -p ../public/wasm
em++ src/lob_wasm.cpp -O3 -std=c++17 -fno-exceptions \
  -sMODULARIZE=1 -sEXPORT_NAME=createLob -sENVIRONMENT=worker \
  -sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=33554432 \
  -sEXPORTED_FUNCTIONS=_lob_run,_lob_last_cancel_ns,_lob_last_cancel_ok \
  -o ../public/wasm/lob.js
ls -la ../public/wasm
