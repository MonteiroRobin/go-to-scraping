# OPTIMIZATION QUICK REFERENCE

## Priority Matrix (Impact vs Effort)

```
HIGH IMPACT, LOW EFFORT (DO FIRST!) ⭐⭐⭐⭐⭐
├─ #2: Add Cache-Control headers (30min)
├─ #3: Optimize fonts & dynamic imports (1h)
├─ #4: Optimize Supabase queries (1h)
└─ #7: Optimize next.config.mjs (30min)
   TOTAL TIME: ~3h | IMPACT: 40-50% improvement

HIGH IMPACT, MEDIUM EFFORT (DO NEXT) ⭐⭐⭐⭐
├─ #1: Split scraper-interface.tsx (3-4h)
├─ #5: Replace recharts if possible (2h)
└─ #6: Implement Grok deduplication (1.5h)
   TOTAL TIME: 6-8h | IMPACT: 35-50% improvement

```

---

## What to Do First (30 Minutes)

### 1. Remove Unused Fonts
**File**: `app/layout.tsx` (lines 13-15)
**Remove these lines**:
```typescript
const _libreBaskerville = V0_Font_Libre_Baskerville({ subsets: ['latin'], weight: ["400","700"] })
const _ibmPlexMono = V0_Font_IBM_Plex_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700"] })
const _lora = V0_Font_Lora({ subsets: ['latin'], weight: ["400","500","600","700"] })
```
**Impact**: -50KB bundle, -150ms FCP

### 2. Add Cache Headers
**Files**: 3 API routes (copy-paste this to each)
```typescript
// In each route handler, before return statement:
response.headers.set('Cache-Control', 'private, max-age=3600, s-maxage=300')
```
**Apply to**:
- `app/api/scraping/check-cache/route.ts` → max-age=3600
- `app/api/maps-config/route.ts` → max-age=86400
- `app/api/analytics/stats/route.ts` → max-age=300

**Impact**: -40% repeated requests

### 3. Fix Supabase Query
**File**: `lib/supabase.ts` (line 111-114)
**Before**:
```typescript
.select("*")
```
**After**:
```typescript
.select("id, city, business_type, keywords, result_count, created_at")
.limit(50)
```
**Impact**: -15% latency

### 4. Add Dynamic Import Fallbacks
**File**: `app/page.tsx` (apply to all dynamic imports)
**Before**:
```typescript
const FloatingDots = dynamic(() => import(...), { ssr: false })
```
**After**:
```typescript
const FloatingDots = dynamic(() => import(...), { 
  ssr: false,
  loading: () => <div className="w-full h-full" />
})
```
**Impact**: Better UX, -5KB

---

## Effort Scale

| Effort | Time | Example |
|--------|------|---------|
| 🟢 Very Easy | <30min | Remove fonts, Add headers |
| 🟡 Medium | 1-4h | Split component, Add dedup |
| 🔴 Hard | >4h | Major refactor |

---

## Impact Scale

| Impact | Severity | Example |
|--------|----------|---------|
| 🟢 Low | <10% | Code cleanup |
| 🟠 Medium | 10-25% | Bundle reduction |
| 🔴 High | 25%+ | Component split, API caching |

---

## Current Project State

```
Bundle Size: ~250KB
├─ React: ~40KB
├─ Next.js: ~30KB
├─ Libraries: ~180KB
│  ├─ @radix-ui: 150-200KB (15 packages)
│  ├─ recharts: 45KB (if used)
│  ├─ framer-motion: 25KB
│  └─ lucide-react: 35KB
└─ Unused fonts: 50KB ← REMOVE THIS

React Components: 1505 lines in 1 file ← SPLIT THIS
API Routes: Well-optimized, missing cache headers ← ADD THIS
Supabase Queries: Using select("*") ← FIX THIS
```

---

## File Importance

```
🔴 CRITICAL (must fix):
├─ app/layout.tsx           (fonts)
├─ lib/supabase.ts          (queries)
└─ components/scraper-interface.tsx (size)

🟠 IMPORTANT (should fix):
├─ app/api/*/route.ts       (caching)
├─ app/page.tsx             (dynamic imports)
├─ next.config.mjs          (optimization)
└─ components/results-grid.tsx (memo)

🟢 NICE TO HAVE (future):
├─ Overpass API retry logic
├─ recharts analysis
└─ Service Worker offline
```

---

## Testing Checklist

After each optimization, verify:

```
[ ] npm run build succeeds
[ ] No console errors or warnings
[ ] Pages load in < 2 seconds
[ ] Search functionality works
[ ] Export CSV/Sheets work
[ ] Grok enrichment works
[ ] Mobile responsive OK
[ ] Dark mode works
```

---

## Measurement

Before starting:
1. Run `npm run build` and note bundle size
2. Open DevTools → Network tab
3. Check Lighthouse score (run 3 times, average)
4. Record Web Vitals (FCP, LCP, CLS)

After Phase 1 (should see):
- Bundle: -50KB
- FCP: -20%
- API requests cached: 70%+

---

## Common Mistakes to Avoid

❌ Don't:
- Remove fonts if they're actually used (check CSS)
- Add cache to personalized endpoints
- Forget to handle cache invalidation
- Make breaking changes to API

✅ Do:
- Test before/after locally
- Keep git history clean
- Add comments explaining optimizations
- Measure impact with data

---

## Resources

📄 **Full Report**: `OPTIMIZATION-AUDIT.md`
📊 **Summary**: `OPTIMIZATION-SUMMARY.txt`
🔗 **This File**: `QUICK-REFERENCE.md`

---

## Next Steps

1. Start with "What to Do First" (30 min)
2. Run tests and verify
3. Measure impact with Lighthouse
4. Create GitHub issues for Phase 2
5. Schedule Phase 2 work (3-4h)

---

Generated: 2025-11-17 | Claude Code Audit
