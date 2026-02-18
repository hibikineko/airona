# Airona Files - Fashion Magazine Feature

## 1. Feature Goal
Web-based digital fashion magazine to showcase outfits and fun screenshots from Blue Protocol Star Resonance

## 2. Requirements

### Platform-Specific Behavior
- **Desktop**: 2-page spread with page flip animation (book-like experience)
- **Mobile**: 1-page per screen with normal scroll animation

### Features
- Fully themable for future issues (Valentine, Spring, CNY, etc.)
- Asymmetric layouts for cute and attractive presentation
- Image-focused design with minimal text
- Modular theme system - each magazine has its own theme file

## 3. Tech Stack
- Next.js + React
- Material-UI for components and theming
- Flip animation library (e.g., react-pageflip or turn.js)
- Modular theme system per magazine issue
- Image optimization with Next.js Image component

## 4. Folder Structure
```
/app/magazine/
  /cny-2026/
    page.js                 # Main magazine page
    MagazineClient.js       # Client component
    theme.js                # CNY-specific theme
    content.js              # CNY content/images
  /valentine-2026/
    page.js
    MagazineClient.js
    theme.js
    content.js
  /[future-themes]/
    ...

/components/magazine/
  BookFlip.js              # Desktop flip animation wrapper
  MobileMagazine.js        # Mobile scroll version
  layouts/
    CoverPage.js           # Cover layout
    BackCover.js           # Back cover layout
    TwoImageLayout.js      # 2 images side by side
    FourImageGrid.js       # 4 images grid
    AsymmetricLayout.js    # Text + image asymmetric
    FullImagePage.js       # Single large image
    OutfitShowcase.js      # Outfit-specific layout
```

## 5. Magazine Layout Structure (10 pages)

| Page | Content | Desktop View |
|------|---------|--------------|
| 1 | **Cover** - Large theme image, title, icons | Single page (cover) |
| 2-3 | **New Outfit Showcase** | 2-page spread |
| 4-5 | **Seasonal Theme/Trends** from community | 2-page spread |
| 6-7 | **Community Screenshots/Highlights** | 2-page spread |
| 8-9 | **Extra Fun Content** (sesbian, feet, memes, etc.) | 2-page spread |
| 10 | **Back Cover** - Credits & contributors | Single page (back) |

### Desktop Experience
- Starts with book cover
- Flips to reveal 2-page spreads
- Interactive book-like navigation

### Mobile Experience
- Simple vertical scroll
- One page at a time
- Smooth transitions

## 6. Asymmetric Layout Examples

### Layout Variations:
1. **Split Half Layout**: 
   - Top half: Image left, text right
   - Bottom half: Text left, image right

2. **Four Image Grid**:
   - 4 images with fun captions/text

3. **Hero Image**:
   - 1 large dominant image

4. **Diagonal Split**:
   - Image diagonal with text overlay

5. **Collage Style**:
   - Multiple images at different sizes

6. **Text Wrap**:
   - Image with text wrapping around it

## 7. Optimization & Performance

### Image Handling
- Lazy loading for off-screen images
- Next.js Image optimization
- Placeholder blur while loading
- Show loading screen before magazine opens

### Performance Goals
- Minimal JavaScript overhead
- Smooth animations (60fps)
- Fast initial load
- Progressive enhancement

### Loading Experience
1. Show loading screen
2. Preload visible images
3. Lazy load remaining pages
4. Smooth reveal when ready

## 8. First Theme: CNY 2026

### Theme Colors
- Red (#E74C3C, #C0392B) - Traditional CNY red
- Gold (#FFD700, #FFA500) - Prosperity
- White/Light backgrounds for contrast
- Accents: Cherry blossom pink, lantern orange

### Visual Elements
- Chinese lanterns
- Cherry blossoms
- Gold decorative patterns
- Traditional CNY motifs
- Dragon/zodiac elements (2026 = Year of the Horse)

### Cover Design
- Large CNY-themed BPSR screenshot
- "Airona Files: CNY 2026" title
- Decorative lanterns and gold accents
- Traditional patterns in corners

### Content Layout
- Pages 2-3: CNY outfit showcase (red/gold themed outfits)
- Pages 4-5: Festive community outfits
- Pages 6-7: CNY celebration screenshots
- Pages 8-9: Fun CNY moments
- Page 10: Credits with small festive image

## 9. Component Architecture

### Core Components
```jsx
<MagazineWrapper>
  {/* Desktop */}
  <BookFlip pages={pages} />
  
  {/* Mobile */}
  <MobileMagazine pages={pages} />
</MagazineWrapper>
```

### Page Components (Reusable)
- `<CoverPage />` - Magazine cover
- `<BackCover />` - Credits page
- `<AsymmetricLayout />` - Configurable layout
- `<ImageGrid />` - Grid of images
- `<OutfitShowcase />` - Outfit-specific
- `<FullBleed />` - Full-page image

## 10. Development Phases

### Phase 1: Skeleton Setup ✓
- Create folder structure
- Install flip animation library
- Create basic page templates
- Setup theme system

### Phase 2: Layout Components
- Build reusable layout components
- Implement responsive behavior
- Add placeholder images

### Phase 3: CNY Theme
- Apply CNY theme
- Add decorative elements
- Polish animations

### Phase 4: Content Integration
- Replace placeholders with real images
- Add text content
- Final polish

### Phase 5: Optimization
- Image optimization
- Performance tuning
- Loading states

## 11. Future Enhancements
- Archive page listing all magazines
- Search/filter magazines
- Social sharing
- Download as PDF
- Bookmark/favorite pages
- Comments/reactions per page
