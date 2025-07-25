# CLAUDE.md - SDN Map Portal Development Log

## Project Overview
Interactive map portal for Southern Development Network (SDN) featuring document management and geographic visualization across Southern Thailand provinces.

## Recent Development Session
**Date:** July 25, 2025  
**Focus:** Province Boundaries Overlay Implementation & Search Interface Optimization

## Key Features Implemented

### 1. Province Boundaries Overlay System
- **Leaflet Implementation (Homepage)**
  - Created `LeafletProvinceOverlay.tsx` for React-Leaflet integration
  - GeoJSON data loading from GitHub Thailand boundaries dataset
  - Circle fallback system for data loading failures
  - Hover effects with yellow color scheme (`#fbbf24` fill, `#f59e0b` stroke)

- **Google Maps Implementation (Google Page)**
  - Enhanced `GoogleProvinceOverlay.tsx` with Data Layer API
  - Real-time province boundary rendering with hover interactions
  - Consistent yellow color scheme across both map systems
  - Tooltip-free hover effects (color-only visual feedback)

### 2. Search Interface Optimization
- **Removed Search Icons:** Streamlined RightSidebar components by removing search functionality
- **Enhanced TambonSearch:** 
  - Minimum 2-character input requirement
  - Loading states and spinners
  - Clear button functionality
  - Limited results to 10 items for performance
  - Improved placeholder text and UX

### 3. UI/UX Improvements
- **Province Markers:** Removed province name tooltips, keeping only small orange dots
- **Color Consistency:** Yellow hover effects (`opacity: 0.2`) across all map implementations
- **Performance:** Optimized search with debouncing and result limiting

## Technical Architecture

### File Structure
```
app/
├── dashboard/map/components/
│   ├── LeafletProvinceOverlay.tsx    # Leaflet province boundaries
│   ├── ProvinceMarkers.tsx           # Province dot markers
│   ├── RightSidebar.tsx              # Filter & stats panel
│   └── TambonSearch.tsx              # Location search component
├── google/
│   ├── components/
│   │   ├── GoogleProvinceOverlay.tsx # Google Maps province boundaries
│   │   ├── GoogleRightSidebar.tsx    # Google-specific sidebar
│   │   └── GoogleMapView.tsx         # Main Google Maps component
│   └── page.tsx                      # Google Maps page
└── data/
    └── provinceCoordinates.ts        # Province coordinate data
```

### Technology Stack
- **Frontend:** Next.js 14, React 18, TypeScript
- **Maps:** React-Leaflet (homepage), Google Maps JavaScript API (Google page)
- **Styling:** Tailwind CSS, Lucide React icons
- **Data:** GeoJSON for province boundaries, local coordinate fallbacks

## Data Sources
- **Province Boundaries:** GitHub Thailand GeoJSON (`apisit/thailand.json`)
- **Fallback Data:** Local `provinceCoordinates.ts` with 77 provinces
- **Document Data:** Prisma database with location coordinates

## Performance Optimizations
1. **Lazy Loading:** Dynamic imports for map components
2. **Debounced Search:** 300ms delay for search input
3. **Result Limiting:** Maximum 10 search results
4. **Conditional Rendering:** Province overlays only when needed
5. **Fallback Systems:** Circle markers when GeoJSON fails

## User Experience Features
- **Consistent Navigation:** Left navbar and right sidebar on both map types
- **Hover Feedback:** Visual province highlighting without text clutter
- **Responsive Design:** Mobile-friendly interface elements
- **Loading States:** Visual feedback during data fetching
- **Error Handling:** Graceful fallbacks for failed API calls

## Development Patterns
- **Component Separation:** Distinct components for Leaflet vs Google Maps
- **State Management:** Local state with useCallback optimization
- **Error Boundaries:** Try-catch blocks with user-friendly messages
- **Accessibility:** Proper button types and semantic HTML

## Future Considerations
- **Caching:** Implement province boundary data caching
- **Offline Mode:** Service worker for map data
- **Analytics:** Track province hover interactions
- **Internationalization:** English language support
- **Mobile Optimization:** Touch-friendly hover alternatives

## Development Notes
- Province boundaries use Thailand's administrative divisions
- Color scheme maintains brand consistency (yellow/orange palette)
- Search functionality preserved in modal form for authenticated users
- Both map systems provide equivalent user experience
- Fallback systems ensure reliability across network conditions

---
*Last updated: July 25, 2025*  
*Generated with Claude Code assistance*