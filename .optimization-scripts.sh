#!/bin/bash
# Optimization Helper Scripts for Go To Scraping

echo "📊 Go To Scraping - Optimization Scripts"
echo "=========================================="
echo ""
echo "Usage: source .optimization-scripts.sh"
echo ""

# Analyze bundle size
analyze_bundle() {
  echo "📦 Analyzing bundle size..."
  npm run build 2>/dev/null | grep -E "Route|Leaf"
}

# Check for unused fonts
check_fonts() {
  echo "🔤 Checking font usage..."
  grep -r "libreBaskerville\|ibmPlexMono\|_lora" app/ components/ lib/ 2>/dev/null | wc -l
  echo "Note: Above should be 0 (unused fonts)"
}

# Check recharts usage
check_recharts() {
  echo "📊 Checking recharts imports..."
  grep -r "from.*recharts\|import.*recharts" app/ components/ 2>/dev/null || echo "No recharts found (can remove)"
}

# Check cache headers
check_cache_headers() {
  echo "🔄 Checking for Cache-Control headers in API routes..."
  grep -r "Cache-Control" app/api/ || echo "❌ No cache headers found"
}

# Check Supabase queries
check_supabase_selects() {
  echo "🗄️  Checking Supabase queries..."
  echo "Occurrences of select('*'):"
  grep -r 'select("\*")' lib/ app/api/ 2>/dev/null | wc -l
  echo "Should be 0 for optimal performance"
}

# Check React.memo usage
check_memo() {
  echo "⚛️  Checking React.memo usage..."
  grep -r "export.*memo\|export const.*= memo" components/ 2>/dev/null | wc -l
  echo "Components wrapped in memo"
}

# Check component sizes
check_component_sizes() {
  echo "📏 Top 5 largest components..."
  wc -l components/*.tsx 2>/dev/null | sort -nr | head -6
}

# Performance audit summary
audit_summary() {
  echo "======================================"
  echo "       OPTIMIZATION AUDIT SUMMARY"
  echo "======================================"
  echo ""
  
  echo "1. Unused Fonts:"
  check_fonts
  echo ""
  
  echo "2. Cache Headers:"
  check_cache_headers
  echo ""
  
  echo "3. Supabase Optimization:"
  check_supabase_selects
  echo ""
  
  echo "4. React Components:"
  check_memo
  echo ""
  
  echo "5. Largest Components:"
  check_component_sizes
  echo ""
  
  echo "6. Recharts Usage:"
  check_recharts
  echo ""
  
  echo "======================================"
  echo "📄 See OPTIMIZATION-AUDIT.md for details"
}

# Quick implementation checklist
quick_wins() {
  echo ""
  echo "🚀 QUICK WINS CHECKLIST (30 minutes)"
  echo "===================================="
  echo ""
  echo "[ ] Remove unused fonts from app/layout.tsx"
  echo "    Lines 13-15: _libreBaskerville, _ibmPlexMono, _lora"
  echo ""
  echo "[ ] Add Cache-Control to 3 API routes:"
  echo "    - app/api/scraping/check-cache/route.ts (max-age=3600)"
  echo "    - app/api/maps-config/route.ts (max-age=86400)"
  echo "    - app/api/analytics/stats/route.ts (max-age=300)"
  echo ""
  echo "[ ] Optimize lib/supabase.ts line 111:"
  echo "    Change: .select('*')"
  echo "    To: .select('id, city, business_type, keywords, result_count, created_at')"
  echo "    And add: .limit(50)"
  echo ""
  echo "[ ] Add fallbacks to dynamic imports in app/page.tsx"
  echo "    Add: { loading: () => <div className='w-full h-full' /> }"
  echo ""
}

# All available functions
available_commands() {
  echo "Available commands:"
  echo "  audit_summary          - Run full optimization audit"
  echo "  quick_wins             - Show quick wins checklist"
  echo "  analyze_bundle         - Check bundle size"
  echo "  check_fonts            - Check unused fonts"
  echo "  check_recharts         - Check recharts usage"
  echo "  check_cache_headers    - Check cache headers in API"
  echo "  check_supabase_selects - Check select(*) queries"
  echo "  check_memo             - Check React.memo usage"
  echo "  check_component_sizes  - Check component file sizes"
  echo ""
}

# Show help on default
available_commands
