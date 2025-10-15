#!/bin/bash

# RoutZ Authentication API Test Script
# This script tests all authentication endpoints

echo "=================================="
echo "🧪 Testing RoutZ Authentication API"
echo "=================================="
echo ""

API_BASE="http://localhost:5001/api/auth"
TEST_EMAIL="testadmin@routz.com"
TEST_PASSWORD="Test123456"
TEST_NAME="Test Admin"

echo "📝 Test 1: Sign Up (Create New Admin)"
echo "-----------------------------------"
curl -X POST "$API_BASE/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"displayName\":\"$TEST_NAME\"}" \
  -w "\n\nStatus Code: %{http_code}\n" \
  -s
echo ""
echo ""

echo "🔐 Test 2: Login with Email/Password"
echo "-----------------------------------"
curl -X POST "$API_BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
  -w "\n\nStatus Code: %{http_code}\n" \
  -s
echo ""
echo ""

echo "📧 Test 3: Forgot Password"
echo "-----------------------------------"
curl -X POST "$API_BASE/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}" \
  -w "\n\nStatus Code: %{http_code}\n" \
  -s
echo ""
echo ""

echo "❌ Test 4: Login with Wrong Password"
echo "-----------------------------------"
curl -X POST "$API_BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"WrongPassword123\"}" \
  -w "\n\nStatus Code: %{http_code}\n" \
  -s
echo ""
echo ""

echo "❌ Test 5: Sign Up with Existing Email"
echo "-----------------------------------"
curl -X POST "$API_BASE/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"displayName\":\"Another Admin\"}" \
  -w "\n\nStatus Code: %{http_code}\n" \
  -s
echo ""
echo ""

echo "✅ Test 6: Verify OAuth Login (Simulated)"
echo "-----------------------------------"
curl -X POST "$API_BASE/verify-oauth" \
  -H "Content-Type: application/json" \
  -d "{\"uid\":\"google_test_123\",\"email\":\"googleuser@example.com\",\"displayName\":\"Google User\",\"photoURL\":\"https://example.com/photo.jpg\",\"provider\":\"google\"}" \
  -w "\n\nStatus Code: %{http_code}\n" \
  -s
echo ""
echo ""

echo "=================================="
echo "✅ All tests completed!"
echo "=================================="
echo ""
echo "📊 Check your server console for success logs!"
echo "🔍 Look for: ✅ Admin logged in successfully"
