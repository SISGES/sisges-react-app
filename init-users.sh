#!/bin/sh
set +e

echo "Instalando curl..."
apk add --no-cache curl > /dev/null 2>&1 || echo "Curl já instalado ou erro ao instalar"

echo "Criando schema se não existir..."
PGPASSWORD=sisges123 psql -h db -U sisges -d sisges -c "CREATE SCHEMA IF NOT EXISTS sisges;" 2>&1 || echo "Schema já existe ou erro ao criar"

echo "Aguardando backend estar pronto..."
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
  http_code=$(curl -s -o /dev/null -w "%{http_code}" http://sisges-backend-dev:8080/auth/register 2>/dev/null || echo "000")
  if [ "$http_code" != "000" ] && [ "$http_code" != "" ]; then
    echo "Backend está pronto! (HTTP $http_code)"
    break
  fi
  attempt=$((attempt + 1))
  echo "Tentativa $attempt/$max_attempts: Backend ainda não está pronto, aguardando..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "ERRO: Backend não ficou pronto a tempo!"
  exit 1
fi

echo "Aguardando 5 segundos para garantir que o backend está totalmente pronto..."
sleep 5

echo "Criando usuários..."

create_user() {
  local name=$1
  local email=$2
  local password=$3
  local birth_date=$4
  local gender=$5
  local user_role=$6

  echo "Criando usuário: $email (role: $user_role)"
  
  json_data="{
    \"name\": \"$name\",
    \"email\": \"$email\",
    \"password\": \"$password\",
    \"birthDate\": \"$birth_date\",
    \"gender\": \"$gender\",
    \"userRole\": $user_role
  }"
  
  response=$(curl -s -w "\n%{http_code}" -X POST http://sisges-backend-dev:8080/auth/register \
    -H "Content-Type: application/json" \
    -d "$json_data" 2>&1)
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  echo "Resposta completa para $email: HTTP $http_code - $body"
  
  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo "✓ Usuário $email criado com sucesso"
  elif echo "$body" | grep -qi "already exists\|já existe\|duplicate\|email.*already\|Email.*já.*cadastrado"; then
    echo "⚠ Usuário $email já existe, pulando..."
  else
    echo "⚠ Erro ao criar usuário $email (HTTP $http_code): $body"
    echo "Tentando novamente em 2 segundos..."
    sleep 2
    
    response2=$(curl -s -w "\n%{http_code}" -X POST http://sisges-backend-dev:8080/auth/register \
      -H "Content-Type: application/json" \
      -d "$json_data" 2>&1)
    
    http_code2=$(echo "$response2" | tail -n1)
    body2=$(echo "$response2" | sed '$d')
    
    if [ "$http_code2" = "200" ] || [ "$http_code2" = "201" ]; then
      echo "✓ Usuário $email criado com sucesso na segunda tentativa"
    elif echo "$body2" | grep -qi "already exists\|já existe\|duplicate\|email.*already\|Email.*já.*cadastrado"; then
      echo "⚠ Usuário $email já existe, pulando..."
    else
      echo "✗ Falha ao criar usuário $email após 2 tentativas (HTTP $http_code2): $body2"
    fi
  fi
  
  sleep 1
}

create_user "Admin" "admin@sisges.com" "123456" "1990-01-01" "MALE" 3
create_user "Maria Aline" "maria.aline@sisges.com" "123456" "1990-01-01" "FEMALE" 2
create_user "Giovana" "giovana@sisges.com" "123456" "2000-01-01" "FEMALE" 0
create_user "Marcela" "marcela@sisges.com" "123456" "2000-01-01" "FEMALE" 0
create_user "Marcos" "marcos@sisges.com" "123456" "1995-01-01" "MALE" 1

echo "Processo de inicialização concluído!"
