#!/usr/bin/env bash
set -euo pipefail

# Network preflight for unattended automation runs.
# Verifies DNS + HTTPS reachability to GitHub with retries and backoff.

HOSTS=("github.com" "api.github.com" "objects.githubusercontent.com")
MAX_ATTEMPTS="${MAX_ATTEMPTS:-5}"
INITIAL_DELAY_SECONDS="${INITIAL_DELAY_SECONDS:-10}"
MAX_DELAY_SECONDS="${MAX_DELAY_SECONDS:-180}"

log() {
  printf '[network-preflight] %s\n' "$*"
}

check_dns() {
  local host="$1"

  # Some constrained runtimes can block specific DNS tools (e.g. `dig` socket bind)
  # while regular resolver calls still work. Try multiple resolvers before failing.
  if command -v dig >/dev/null 2>&1; then
    if dig +short "$host" 2>/dev/null | grep -qE '.'; then
      return 0
    fi
  fi

  if command -v nslookup >/dev/null 2>&1; then
    if nslookup "$host" >/dev/null 2>&1; then
      return 0
    fi
  fi

  if command -v getent >/dev/null 2>&1; then
    if getent hosts "$host" >/dev/null 2>&1; then
      return 0
    fi
  fi

  if command -v python3 >/dev/null 2>&1; then
    if python3 - "$host" >/dev/null 2>&1 <<'PY'
import socket
import sys

host = sys.argv[1]
socket.getaddrinfo(host, 443)
PY
    then
      return 0
    fi
  fi

  return 1
}

check_https() {
  local host="$1"
  # Connectivity check only; some hosts return non-2xx on root.
  curl -sSIL --connect-timeout 8 --max-time 15 "https://${host}" >/dev/null
}

attempt=1
delay="$INITIAL_DELAY_SECONDS"
while [[ "$attempt" -le "$MAX_ATTEMPTS" ]]; do
  log "attempt ${attempt}/${MAX_ATTEMPTS}"

  dns_ok=true
  https_ok=true

  for host in "${HOSTS[@]}"; do
    if ! check_dns "$host"; then
      log "DNS lookup failed for ${host}"
      dns_ok=false
    fi
  done

  for host in "${HOSTS[@]}"; do
    if ! check_https "$host"; then
      log "HTTPS reachability failed for ${host}"
      https_ok=false
    fi
  done

  if [[ "$dns_ok" == true && "$https_ok" == true ]]; then
    if command -v gh >/dev/null 2>&1; then
      if gh auth status >/dev/null 2>&1; then
        log "GitHub network preflight passed; gh auth is available"
      else
        log "GitHub network preflight passed; gh is not authenticated"
      fi
    else
      log "GitHub network preflight passed; gh CLI not installed"
    fi
    exit 0
  fi

  if [[ "$attempt" -lt "$MAX_ATTEMPTS" ]]; then
    log "preflight failed; retrying in ${delay}s"
    sleep "$delay"
    delay=$(( delay * 2 ))
    if [[ "$delay" -gt "$MAX_DELAY_SECONDS" ]]; then
      delay="$MAX_DELAY_SECONDS"
    fi
  fi

  attempt=$(( attempt + 1 ))
done

log "preflight failed after ${MAX_ATTEMPTS} attempts"
exit 1
