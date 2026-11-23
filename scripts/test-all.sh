#!/usr/bin/env bash
# Os repositórios do frontend e do backend ficam lado a lado por padrão.
set -euo pipefail
frontend=$(cd "$(dirname "$0")/.." && pwd)
backend=${SISGES_BACKEND_DIR:-"$frontend/../backend"}
cd "$frontend"

if [[ -n "${PG_BINDIR:-}" ]]; then
  pg_bin="$PG_BINDIR"
elif command -v initdb >/dev/null; then
  pg_bin=$(dirname "$(command -v initdb)")
elif command -v pg_config >/dev/null; then
  pg_bin=$(pg_config --bindir)
else
  echo "Instale as ferramentas do servidor PostgreSQL ou indique o diretório dos binários em PG_BINDIR." >&2
  exit 1
fi
export PATH="$pg_bin:$PATH"
command -v createdb >/dev/null
for bin in initdb pg_ctl; do
  [[ -x "$pg_bin/$bin" ]] || { echo "Defina PG_BINDIR como o diretório do PostgreSQL que contém $bin." >&2; exit 1; }
done
command -v go >/dev/null || { echo "Inclua o Go 1.24 ou superior no PATH." >&2; exit 1; }
[[ -x node_modules/.bin/cypress ]] || { echo "Execute npm ci em $frontend antes de continuar." >&2; exit 1; }

scratch=$(mktemp -d)
api_pid=
web_pid=
cleanup() {
  if [[ -n "$web_pid" ]]; then kill "$web_pid" 2>/dev/null || true; wait "$web_pid" 2>/dev/null || true; fi
  if [[ -n "$api_pid" ]]; then kill "$api_pid" 2>/dev/null || true; wait "$api_pid" 2>/dev/null || true; fi
  if [[ -f "$scratch/db/postmaster.pid" ]]; then "$pg_bin/pg_ctl" -D "$scratch/db" -m fast -w stop >/dev/null; fi
  rm -rf -- "$scratch"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

free_port() {
  node -e 'const s = require("node:net").createServer(); s.listen(0, "127.0.0.1", () => { console.log(s.address().port); s.close(); });'
}
wait_for_service() {
  local pid=$1 url=$2 log=$3
  for ((i=0; i<100; i++)); do
    if ! kill -0 "$pid" 2>/dev/null; then break; fi
    if curl -fsS --max-time 1 "$url" >/dev/null 2>&1; then return 0; fi
    sleep 0.2
  done
  cat "$log" >&2
  return 1
}

# O diretório de socket exclusivo isola os bancos de teste dos demais bancos.
"$pg_bin/initdb" -D "$scratch/db" -U sisges -A trust --no-locale -E UTF8 >/dev/null
"$pg_bin/pg_ctl" -D "$scratch/db" -o "-k '$scratch' -p 5432 -h ''" -l "$scratch/postgres.log" -w start
for db in sisges_test sisges_browser sisges_cycle; do
  createdb -h "$scratch" -p 5432 -U sisges "$db"
done
(
  cd "$backend"
  export SISGES_TEST_CYCLE_DATABASE_URL="postgresql:///sisges_cycle?host=$scratch&user=sisges"
  SISGES_TEST_DATABASE_URL="postgresql:///sisges_test?host=$scratch&user=sisges" go test -v -race -count=1 ./...
  go build -o "$scratch/sisges" ./cmd/sisges
)
api_port=$(free_port)
export CYPRESS_API_BASE_URL="http://127.0.0.1:$api_port/api"
PORT="$api_port" DATABASE_URL="postgresql:///sisges_browser?host=$scratch&user=sisges" \
  SECURITY_JWT_SECRET_KEY="isolated-test-suite-secret-at-least-32-bytes" \
  SISGES_MIGRATION_DIR="$backend/db/migration" SISGES_SEED_ENABLED=true \
  SISGES_R2_ENDPOINT="" SISGES_R2_ACCESS_KEY_ID="" SISGES_R2_SECRET_ACCESS_KEY="" \
  SISGES_CORS_ALLOWED_ORIGIN_PATTERNS='http://127.0.0.1:*' \
  "$scratch/sisges" >"$scratch/api.log" 2>&1 &
api_pid=$!
wait_for_service "$api_pid" "http://127.0.0.1:$api_port/health" "$scratch/api.log"
web_port=$(free_port)
export CYPRESS_BASE_URL="http://127.0.0.1:$web_port"
export CYPRESS_ADMIN_EMAIL=adm0001@sisges.com CYPRESS_ADMIN_PASSWORD=admin123
export CYPRESS_TEACHER_EMAIL=ana.clara.ferreira@sisges.local CYPRESS_TEACHER_PASSWORD=admin123
export CYPRESS_STUDENT_EMAIL=alice.almeida@sisges.local CYPRESS_STUDENT_PASSWORD=admin123

npm run lint
npm test
node_modules/.bin/tsc --noEmit
node_modules/.bin/tsc -p cypress/tsconfig.json
VITE_API_BASE_URL="$CYPRESS_API_BASE_URL" node_modules/.bin/vite build --emptyOutDir --outDir "$scratch/dist"
node_modules/.bin/vite preview --outDir "$scratch/dist" --host 127.0.0.1 --port "$web_port" --strictPort >"$scratch/web.log" 2>&1 &
web_pid=$!
wait_for_service "$web_pid" "$CYPRESS_BASE_URL" "$scratch/web.log"
npm run cypress:run
