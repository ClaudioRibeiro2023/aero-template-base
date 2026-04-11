#!/bin/bash
# ─── Aero Studio — Setup QA User ────────────────────────────
# Cria o usuario QA master em um projeto Supabase.
# Usa a Admin API (service_role_key) para criar o usuario
# com role super_admin, sem necessidade de confirmacao de email.
#
# Uso: bash scripts/setup-qa-user.sh <supabase_url> <service_role_key>
#
# O usuario criado:
#   Email: qa@aeroeng.tech
#   Role: super_admin
#   Metadata: { role: "super_admin", display_name: "QA Aero Studio" }
#
# IMPORTANTE: Este script usa service_role_key que NUNCA deve ser
# commitado ou exposto. Rode manualmente e descarte a key depois.
# ──────────────────────────────────────────────────────────────

set -uo pipefail

SUPABASE_URL="${1:?Uso: setup-qa-user.sh <supabase_url> <service_role_key>}"
SERVICE_ROLE_KEY="${2:?SERVICE_ROLE_KEY obrigatorio}"

QA_EMAIL="qa@aeroeng.tech"
QA_PASSWORD="AeroQA!2026#Master"

echo "═══════════════════════════════════════════════"
echo "  SETUP QA USER — Aero Studio"
echo "  Supabase: $SUPABASE_URL"
echo "  Email: $QA_EMAIL"
echo "═══════════════════════════════════════════════"

# ─── 1. Verificar se usuario ja existe ───
echo "  [1/3] Verificando se usuario ja existe..."
EXISTING=$(curl -sf "$SUPABASE_URL/auth/v1/admin/users?page=1&per_page=50" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" 2>/dev/null | grep -o "\"$QA_EMAIL\"" | head -1)

if [ -n "$EXISTING" ]; then
  echo "    ✓ Usuario QA ja existe — nenhuma acao necessaria"
  echo "═══════════════════════════════════════════════"
  exit 0
fi

# ─── 2. Criar usuario via Admin API ───
echo "  [2/3] Criando usuario QA..."
RESULT=$(curl -sf "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$QA_EMAIL\",
    \"password\": \"$QA_PASSWORD\",
    \"email_confirm\": true,
    \"user_metadata\": {
      \"role\": \"super_admin\",
      \"display_name\": \"QA Aero Studio\",
      \"is_qa_account\": true
    }
  }" 2>/dev/null)

if echo "$RESULT" | grep -q '"id"'; then
  USER_ID=$(echo "$RESULT" | grep -oE '"id"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"id"\s*:\s*"//;s/"//')
  echo "    ✓ Usuario criado: $USER_ID"
else
  echo "    ✗ Falha ao criar usuario"
  echo "    Resposta: $RESULT"
  exit 1
fi

# ─── 3. Confirmar criacao ───
echo "  [3/3] Verificando..."
VERIFY=$(curl -sf "$SUPABASE_URL/auth/v1/admin/users/$USER_ID" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" 2>/dev/null | grep -o '"email_confirmed_at":[^,]*')

if [ -n "$VERIFY" ]; then
  echo "    ✓ Email confirmado automaticamente"
else
  echo "    ⚠ Email pode nao estar confirmado — verificar no dashboard"
fi

echo "═══════════════════════════════════════════════"
echo "  ✓ QA User configurado com sucesso"
echo "    Email: $QA_EMAIL"
echo "    Role: super_admin"
echo "    Projeto: $SUPABASE_URL"
echo ""
echo "  Para testar login:"
echo "    curl -s '$SUPABASE_URL/auth/v1/token?grant_type=password' \\"
echo "      -H 'apikey: <anon_key>' \\"
echo "      -d '{\"email\":\"$QA_EMAIL\",\"password\":\"***\"}'"
echo "═══════════════════════════════════════════════"
