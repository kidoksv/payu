#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000/api/v1}"
EMAIL="smoke$(date +%s)@example.com"
PASSWORD="Password123!"

TOKEN=$(curl -sS -X POST "$BASE_URL/auth/register" \
  -H 'content-type: application/json' \
  -d "$(node -e "fetch('$BASE_URL/auth/register-challenge').then(r=>r.json()).then(c=>{const answer=eval(c.question.replace('= ?','')); console.log(JSON.stringify({email:'$EMAIL',username:'smoke'+Date.now(),password:'$PASSWORD',challengeId:c.challengeId,challengeAnswer:String(answer)}))})")" \
  | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>console.log(JSON.parse(s).accessToken))")

curl -sS "$BASE_URL/products" | tee /tmp/products.json
ORDER=$(curl -sS -X POST "$BASE_URL/orders" \
  -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"productId":1,"quantity":1}')
echo "$ORDER"
