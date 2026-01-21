#!/bin/bash

# SEO & Tracking Verification Script
# This script helps you verify your SEO and tracking setup

echo "🔍 NC-Ecom SEO & Tracking Verification"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check environment variables
echo "📋 Checking Environment Variables..."
echo ""

check_env_var() {
    local var_name=$1
    local var_value=$(grep "^$var_name=" .env.local 2>/dev/null | cut -d '=' -f2)
    
    if [ -z "$var_value" ] || [ "$var_value" == "your_"* ]; then
        echo -e "${RED}✗${NC} $var_name - NOT SET"
        return 1
    else
        # Mask the value for security
        local masked_value="${var_value:0:10}...${var_value: -4}"
        echo -e "${GREEN}✓${NC} $var_name - SET ($masked_value)"
        return 0
    fi
}

check_env_var "META_PIXEL_ID"
check_env_var "META_CONVERSIONS_API_TOKEN"
check_env_var "META_TEST_EVENT_CODE"
check_env_var "NEXT_PUBLIC_META_PIXEL_ID"

echo ""
echo "📦 Checking SEO Files..."
echo ""

# Check if SEO files exist
check_file() {
    local file_path=$1
    local file_name=$2
    
    if [ -f "$file_path" ]; then
        echo -e "${GREEN}✓${NC} $file_name - EXISTS"
        return 0
    else
        echo -e "${RED}✗${NC} $file_name - MISSING"
        return 1
    fi
}

check_file "app/robots.ts" "robots.ts"
check_file "app/sitemap.ts" "sitemap.ts"
check_file "lib/facebook-conversions-api.ts" "Facebook Conversions API"
check_file "lib/event-tracking.ts" "Event Tracking Helpers"
check_file "components/seo/structured-data.tsx" "Structured Data Component"

echo ""
echo "🔌 Checking API Routes..."
echo ""

check_file "app/api/events/pageview/route.ts" "PageView API"
check_file "app/api/events/view-content/route.ts" "ViewContent API"
check_file "app/api/events/add-to-cart/route.ts" "AddToCart API"
check_file "app/api/events/checkout/route.ts" "Checkout API"
check_file "app/api/events/purchase/route.ts" "Purchase API"

echo ""
echo "🎯 Integration Status..."
echo ""

# Check if tracking is integrated in key files
if grep -q "trackViewContent" "app/product/[id]/client.tsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Product page - ViewContent tracking integrated"
else
    echo -e "${RED}✗${NC} Product page - ViewContent tracking NOT integrated"
fi

if grep -q "trackAddToCart" "app/product/[id]/client.tsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Product page - AddToCart tracking integrated"
else
    echo -e "${RED}✗${NC} Product page - AddToCart tracking NOT integrated"
fi

if grep -q "trackInitiateCheckout" "app/checkout/page.tsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Checkout page - InitiateCheckout tracking integrated"
else
    echo -e "${RED}✗${NC} Checkout page - InitiateCheckout tracking NOT integrated"
fi

if grep -q "trackPurchase" "app/checkout/page.tsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Checkout page - Purchase tracking integrated"
else
    echo -e "${RED}✗${NC} Checkout page - Purchase tracking NOT integrated"
fi

if grep -q "AutoPageViewTracker" "app/layout.tsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Layout - AutoPageViewTracker integrated"
else
    echo -e "${RED}✗${NC} Layout - AutoPageViewTracker NOT integrated"
fi

if grep -q "StructuredData" "app/layout.tsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Layout - StructuredData integrated"
else
    echo -e "${RED}✗${NC} Layout - StructuredData NOT integrated"
fi

echo ""
echo "🌐 Next Steps:"
echo ""
echo "1. Test Facebook Events:"
echo "   ${YELLOW}https://business.facebook.com/events_manager2/list/pixel/932014878052619/test_events${NC}"
echo ""
echo "2. Submit Sitemap to Google:"
echo "   a. Go to: ${YELLOW}https://search.google.com/search-console${NC}"
echo "   b. Add property: ${YELLOW}https://namecheap.to${NC}"
echo "   c. Submit sitemap: ${YELLOW}https://namecheap.to/sitemap.xml${NC}"
echo ""
echo "3. Validate Structured Data:"
echo "   ${YELLOW}https://search.google.com/test/rich-results${NC}"
echo "   Test URL: ${YELLOW}https://namecheap.to${NC}"
echo ""
echo "4. View Facebook Analytics:"
echo "   ${YELLOW}https://business.facebook.com/events_manager2/list/pixel/932014878052619/overview${NC}"
echo ""
echo "5. Start Development Server:"
echo "   ${YELLOW}npm run dev${NC}"
echo ""

echo "📚 Documentation:"
echo "   - TRACKING-SETUP.md - Complete tracking setup guide"
echo "   - SEO-VERIFICATION-CHECKLIST.md - Step-by-step verification"
echo ""
echo "======================================"
echo "Verification Complete! 🎉"
