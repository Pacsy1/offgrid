cmake_minimum_required(VERSION 3.22.1)

project(offgridhighlights LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(OFFGRID_HIGHLIGHTS_ROOT "${CMAKE_SOURCE_DIR}/..")

add_library(
  offgridhighlights SHARED
  src/main/cpp/cpp-adapter.cpp
  "${OFFGRID_HIGHLIGHTS_ROOT}/cpp/HybridOffgridHighlights.cpp"
  "${OFFGRID_HIGHLIGHTS_ROOT}/cpp/Utf16ToUtf8.cpp"
  "${OFFGRID_HIGHLIGHTS_ROOT}/cpp/offgrid_highlights.c"
  "${OFFGRID_HIGHLIGHTS_ROOT}/Vendor/highlights/highlights.c"
  "${OFFGRID_HIGHLIGHTS_ROOT}/Vendor/wasm2c/wasm-rt-impl.c"
  "${OFFGRID_HIGHLIGHTS_ROOT}/Vendor/wasm2c/wasm-rt-mem-impl.c"
)

include(${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/offgridhighlights+autolinking.cmake)

target_include_directories(
  offgridhighlights
  PRIVATE "${OFFGRID_HIGHLIGHTS_ROOT}/cpp" "${OFFGRID_HIGHLIGHTS_ROOT}/Vendor"
          "${OFFGRID_HIGHLIGHTS_ROOT}/Vendor/highlights" "${OFFGRID_HIGHLIGHTS_ROOT}/Vendor/wasm2c"
)

# Plain malloc memory with explicit bounds checks: no guard-page signal
# handlers competing with ART's.
target_compile_definitions(
  offgridhighlights PRIVATE WASM_RT_USE_MMAP=0 WASM_RT_MEMCHECK_BOUNDS_CHECK=1
                       WASM_RT_SKIP_SIGNAL_RECOVERY=1
)

# The lexers are generated code; keep them fast in debug builds too.
target_compile_options(offgridhighlights PRIVATE -O2)

target_link_options(
  offgridhighlights PRIVATE "-Wl,-z,common-page-size=16384" "-Wl,-z,max-page-size=16384"
)
