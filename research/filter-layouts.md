# Final station browsing — 15 November 2026

The V2 category presentation is retained. The comparison switch is removed. Compact V1-style chips now control location: All, Local stations (Serbia for now; no geolocation permission request), and Select country (multi-select dropdown). Flags are bare emoji without white circles. All resets location and search.

Category cards keep their previous size, with pastel/light typography in light appearance and the original neon treatment in dark appearance. Cards are navigation links rather than toggle filters. Each opens a hash-addressable category page with back arrow, category title and search, and all stations from that category. Browse location/query do not restrict category destinations. The persistent audio element remains mounted. Back restores browse location/query, scroll position and category-link focus. Browser back/forward and direct category loads are supported.

## Validation

- TypeScript and production Vite build pass.
- Local stations returns 6 Serbian stations. With query naxi it returns 5.
- Opening Pop from that filtered browse state shows all 6 pop stations, without location or category filters. Searching bravo returns only bravo!.
- The back arrow restores Local stations and query naxi (5 results).
- Country dropdown Croatia returns 9 stations; Escape closes it. All restores the full catalog.
- Mobile layout and light/dark category artwork inspected at 375 × 667. Screenshots are in previews/browse-light-mobile.jpg, previews/browse-dark-mobile.jpg and previews/category-pop-mobile.jpg.
- No geolocation API is called. Physical Safari/touch behavior remains separate from viewport checks.
