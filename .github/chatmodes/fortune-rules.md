# Fortune Card Game - Enhanced System with Airona Coin Economy

## 🎮 System Overview

The enhanced Fortune Card game now features a comprehensive economy system with Airona Coins, multiple banners, pity mechanics, and card dismantling. Players can draw cards using daily free pulls or spend Airona Coins for additional draws.

## 💰 Airona Coin Economy

### **Currency System**
- **Universal Currency**: Airona Coins for all gacha activities
- **Starting Balance**: 10 coins for new players
- **Earning Methods**: 
  - Card dismantling (duplicates only)
  - Admin rewards
  - Future: Daily quests, achievements

### **Coin Values**
- **1 Coin = 1 Card Draw** (any banner)
- **Dismantling Rewards**:
  - 5 Elite cards = 1 coin
  - 3 Super Rare cards = 1 coin  
  - 1 Ultra Rare card = 1 coin

## 🎯 Enhanced Game Mechanics

### **Banner System**
1. **Standard Banner**
   - All cards available at normal rates
   - Daily free pull available
   - Standard rarity distribution

2. **Limited Banner**
   - Featured Ultra Rare card (75% rate when rolling Ultra Rare)
   - Featured Super Rare card (75% rate when rolling Super Rare)
   - Daily free pull available
   - Rate-up card images displayed prominently

### **Pity System**
- **Guaranteed Ultra Rare**: Every 20 pulls without Ultra Rare
- **Counter Display**: Shows current pity progress (e.g., "Next Ultra Rare in 3 pulls")
- **Per-Banner Tracking**: Separate pity counters for Standard/Limited
- **Resets**: Counter resets after getting Ultra Rare

### **Card Dismantling**
- **Duplicate Protection**: Cannot delete first copy of any card
- **Batch Selection**: Select multiple cards for dismantling
- **Confirmation Required**: Double-check before deletion
- **Immediate Coin Reward**: Coins added to balance instantly

## �️ Database Schema Updates

### **Required SQL Updates**

```sql
-- 1. Add Airona Coin balance to users table
ALTER TABLE public.users 
ADD COLUMN airona_coins integer DEFAULT 10,
ADD COLUMN created_at timestamp without time zone DEFAULT now(),
ADD COLUMN updated_at timestamp without time zone DEFAULT now();

-- 2. Add pity system tracking
ALTER TABLE public.user_stats 
ADD COLUMN standard_pity_counter integer DEFAULT 0,
ADD COLUMN limited_pity_counter integer DEFAULT 0,
ADD COLUMN total_coin_draws integer DEFAULT 0;

-- 3. Add quantity tracking to user_cards
ALTER TABLE public.user_cards 
ADD COLUMN quantity integer DEFAULT 1,
ADD COLUMN banner_type text DEFAULT 'standard',
ADD COLUMN is_coin_draw boolean DEFAULT false;

-- 4. Create banner configuration table
-- First create the sequence
CREATE SEQUENCE public.banner_config_id_seq;

CREATE TABLE public.banner_config (
  id bigint NOT NULL DEFAULT nextval('banner_config_id_seq'::regclass),
  banner_type text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  rate_up_ultra_rare_id integer,
  rate_up_super_rare_id integer,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT banner_config_pkey PRIMARY KEY (id),
  CONSTRAINT banner_config_rate_up_ultra_fkey FOREIGN KEY (rate_up_ultra_rare_id) REFERENCES public.cards(id),
  CONSTRAINT banner_config_rate_up_super_fkey FOREIGN KEY (rate_up_super_rare_id) REFERENCES public.cards(id)
);

-- 5. Create coin transaction log
-- First create the sequence
CREATE SEQUENCE public.coin_transactions_id_seq;

CREATE TABLE public.coin_transactions (
  id bigint NOT NULL DEFAULT nextval('coin_transactions_id_seq'::regclass),
  discord_uid text NOT NULL,
  transaction_type text NOT NULL, -- 'earned', 'spent', 'admin_add', 'admin_remove'
  amount integer NOT NULL,
  reason text,
  related_card_ids integer[],
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coin_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT coin_transactions_discord_uid_fkey FOREIGN KEY (discord_uid) REFERENCES public.users(discord_uid)
);

-- 6. Skip rarity config - already exists in database with:
-- elite: 89.0%, rolls 1-890
-- super_rare: 10.0%, rolls 891-980  
-- ultra_rare: 2.0%, rolls 981-1000

-- 7. Initialize banner configuration
INSERT INTO public.banner_config (banner_type, is_active, rate_up_ultra_rare_id, rate_up_super_rare_id) VALUES
('standard', true, NULL, NULL),
('limited', true, 1, 2); -- Replace with actual card IDs

-- 8. Update existing user_cards to have quantities
UPDATE public.user_cards 
SET quantity = subquery.card_count
FROM (
  SELECT discord_uid, card_id, COUNT(*) as card_count
  FROM public.user_cards 
  GROUP BY discord_uid, card_id
) AS subquery
WHERE user_cards.discord_uid = subquery.discord_uid 
AND user_cards.card_id = subquery.card_id;

-- 9. Remove duplicate entries (keep newest)
DELETE FROM public.user_cards 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM public.user_cards 
  GROUP BY discord_uid, card_id
);

-- 10. Add unique constraint to prevent future duplicates
ALTER TABLE public.user_cards 
ADD CONSTRAINT user_cards_unique_user_card UNIQUE (discord_uid, card_id);
```

### **Sample Data Inserts**

```sql
-- Sample Ultra Rare cards
INSERT INTO public.cards (name, description, fortune_message, airona_sticker_path, rarity, background_color) VALUES
('Divine Airona', 'The ultimate blessing card representing pure divine energy', 'The universe conspires to bring you extraordinary fortune!', '/airona/airona_gojo.png', 'ultra_rare', '#FFD700'),
('Celestial Wisdom', 'Ancient knowledge flows through this mystical card', 'Wisdom beyond your years shall guide your path to success!', '/airona/airona_nerd.png', 'ultra_rare', '#9932CC');

-- Sample Super Rare cards  
INSERT INTO public.cards (name, description, fortune_message, airona_sticker_path, rarity, background_color) VALUES
('Lucky Star', 'A shimmering star that brings good fortune', 'Today brings unexpected opportunities your way!', '/airona/airona_yay.png', 'super_rare', '#4169E1'),
('Heart of Courage', 'Courage flows from this powerful blessing', 'Face your challenges with unwavering confidence!', '/airona/airona_heart.png', 'super_rare', '#DC143C');

-- Sample Elite cards
INSERT INTO public.cards (name, description, fortune_message, airona_sticker_path, rarity, background_color) VALUES
('Daily Blessing', 'A simple but effective daily blessing', 'Small steps today lead to big achievements tomorrow!', '/airona/airona_happy.png', 'elite', '#32CD32'),
('Gentle Fortune', 'Soft fortune that brings peace to your day', 'Tranquility and progress walk hand in hand today!', '/airona/airona_wink.png', 'elite', '#20B2AA');
```

## 🏗️ Enhanced Architecture Components

### **New API Endpoints**
```
/api/fortune/
├── draw              # POST - Enhanced with banner & coin system
├── dismantle         # POST - Card dismantling for coins
├── banners           # GET - Available banners & rate-up info
├── coins/balance     # GET - User's coin balance
├── coins/history     # GET - Transaction history
└── admin/
    ├── coins         # POST - Add/remove coins (admin only)
    └── banners       # POST - Update rate-up cards (admin only)
```

### **Enhanced Components**
```
src/components/fortune/
├── BannerSelector.js     # Banner switching interface
├── CoinBalance.js        # Coin display component
├── PityCounter.js        # Pity progress display
├── CardDismantler.js     # Card selection for dismantling
├── RateUpDisplay.js      # Featured card showcase
└── LoadingAirona.js      # Custom loading animation
```

## 🎨 UI/UX Enhancements

### **Draw Page Layout**
```
┌─────────────────────────────┐
│   🔮 Airona's Fortune       │
│                             │
│  💰 Airona Coins: 25       │
│                             │
│ [Standard] [Limited*]       │
│                             │
│ Rate-Up: [Card Image]       │
│                             │
│ Pity: Next UR in 3 pulls    │
│                             │
│ [Free Daily] [Draw x1] [x10] │
│                             │
│     [Collection] [Board]     │
└─────────────────────────────┘
```

### **Collection Page Enhancements**
```
┌─────────────────────────────┐
│   📚 My Collection          │
│                             │
│  💰 Coins: 25  [Dismantle]  │
│                             │
│ ┌─────┐ ┌─────┐ ┌─────┐     │
│ │Card │ │Card │ │Card │     │
│ │ x3  │ │ x1  │ │ x5  │     │
│ │Desc │ │Desc │ │Desc │     │
│ └─────┘ └─────┘ └─────┘     │
└─────────────────────────────┘
```

### **Admin Panel Layout**
```
┌─────────────────────────────┐
│   ⚙️ Fortune Admin Panel     │
│                             │
│ User Coin Management:       │
│ [User Search] [±Coins]      │
│                             │
│ Banner Configuration:       │
│ Limited Rate-Up Cards:      │
│ Ultra: [Dropdown ▼]         │
│ Super: [Dropdown ▼]         │
│ [Update Banner]             │
└─────────────────────────────┘
```

## � Technical Implementation Details

### **Enhanced Draw Logic**
```javascript
// Multi-banner draw with pity system
const drawCard = async (bannerType, useCoin = false) => {
  // 1. Validate coin balance if coin draw
  // 2. Check pity counter for guaranteed Ultra Rare
  // 3. Apply rate-up chances if limited banner
  // 4. Update pity counter
  // 5. Add card with quantity increment
  // 6. Deduct coins if applicable
  // 7. Update statistics
}
```

### **Pity System Logic**
```javascript
const checkPitySystem = (userStats, bannerType) => {
  const pityCounter = bannerType === 'limited' 
    ? userStats.limited_pity_counter 
    : userStats.standard_pity_counter;
    
  if (pityCounter >= 19) {
    // Force Ultra Rare on next draw
    return { guaranteedRarity: 'ultra_rare', resetCounter: true };
  }
  
  return { guaranteedRarity: null, resetCounter: false };
}
```

### **Card Dismantling Logic**
```javascript
const dismantleCards = async (selectedCards) => {
  // 1. Validate user owns duplicates (quantity > 1)
  // 2. Calculate coin rewards based on rarity
  // 3. Reduce card quantities or remove if quantity = 1
  // 4. Add coins to user balance
  // 5. Log transaction
  // 6. Update statistics
}
```

### **Rate-Up Implementation**
```javascript
const applyRateUp = (drawnRarity, bannerConfig) => {
  if (!bannerConfig.is_limited) return null;
  
  const rateUpChance = Math.random() < 0.75; // 75% rate-up chance
  
  if (drawnRarity === 'ultra_rare' && rateUpChance) {
    return bannerConfig.rate_up_ultra_rare_id;
  }
  
  if (drawnRarity === 'super_rare' && rateUpChance) {
    return bannerConfig.rate_up_super_rare_id;
  }
  
  return null; // Use normal pool
}
```

## � Implementation Priority

### **Phase 1: Core Systems**
1. ✅ Database schema updates
2. 🔄 Enhanced draw API with coins & banners
3. 🔄 Basic banner switching UI
4. 🔄 Coin balance display

### **Phase 2: Advanced Features**
5. Pity system implementation
6. Card dismantling interface
7. Collection page enhancements
8. Rate-up display system

### **Phase 3: Polish & Admin**
9. Loading animations
10. Admin panel creation
11. Transaction history
12. Mobile optimization

### **Phase 4: Card Archive System**
13. Complete card database viewer
14. Rarity-based filtering and sorting
15. Community claim statistics
16. Card description showcase

## 📚 Card Archive System

### **Archive Overview**
A comprehensive database viewer accessible from the collection page that showcases all cards in the system, whether owned or not. This creates transparency and gives players goals to work toward.

### **Archive Features**
- **Complete Card Database**: Display all cards regardless of ownership
- **Ownership Indicators**: Show if player owns each card and quantity
- **Claim Statistics**: Community-wide ownership percentages
- **Rarity Filtering**: Filter by Elite, Super Rare, Ultra Rare
- **Search Functionality**: Search by card name or description
- **Detailed View**: Expanded card information with full descriptions

### **Archive UI Layout**
```
┌─────────────────────────────────────────┐
│   📚 Card Archive                       │
│                                         │
│  [All] [Elite] [Super] [Ultra] [Search]│
│                                         │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│ │  Card   │ │  Card   │ │  Card   │     │
│ │ ✓ Owned │ │ ❌ Missing│ │ ✓ x3    │     │
│ │ 67% own │ │ 23% own  │ │ 89% own │     │
│ │Ultra Rare│ │Super Rare│ │ Elite   │     │
│ └─────────┘ └─────────┘ └─────────┘     │
│                                         │
│      [View Details] [Back to Coll.]     │
└─────────────────────────────────────────┘
```

### **Database Requirements**
```sql
-- Add view for archive statistics
CREATE VIEW card_archive_stats AS
SELECT 
  c.id,
  c.name,
  c.description,
  c.fortune_message,
  c.airona_sticker_path,
  c.rarity,
  c.background_color,
  COUNT(DISTINCT uc.discord_uid) as total_owners,
  ROUND(
    (COUNT(DISTINCT uc.discord_uid)::numeric / 
     (SELECT COUNT(DISTINCT discord_uid)::numeric FROM users)) * 100, 
    1
  ) as ownership_percentage,
  SUM(uc.quantity) as total_copies_owned
FROM cards c
LEFT JOIN user_cards uc ON c.id = uc.card_id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.description, c.fortune_message, 
         c.airona_sticker_path, c.rarity, c.background_color
ORDER BY c.rarity, c.name;

-- Query for user-specific archive view
CREATE OR REPLACE FUNCTION get_user_archive(user_discord_uid text)
RETURNS TABLE (
  card_id integer,
  name text,
  description text,
  fortune_message text,
  airona_sticker_path text,
  rarity text,
  background_color text,
  user_owns boolean,
  user_quantity integer,
  total_owners bigint,
  ownership_percentage numeric,
  total_copies_owned bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cas.id,
    cas.name,
    cas.description,
    cas.fortune_message,
    cas.airona_sticker_path,
    cas.rarity,
    cas.background_color,
    CASE WHEN uc.quantity IS NOT NULL THEN true ELSE false END as user_owns,
    COALESCE(uc.quantity, 0) as user_quantity,
    cas.total_owners,
    cas.ownership_percentage,
    cas.total_copies_owned
  FROM card_archive_stats cas
  LEFT JOIN user_cards uc ON cas.id = uc.card_id AND uc.discord_uid = user_discord_uid
  ORDER BY 
    CASE cas.rarity 
      WHEN 'ultra_rare' THEN 1
      WHEN 'super_rare' THEN 2  
      WHEN 'elite' THEN 3
      ELSE 4
    END,
    cas.name;
END;
$$ LANGUAGE plpgsql;
```

### **API Endpoint**
```
/api/fortune/archive
  GET - Retrieve complete card archive with user ownership status
  Query Parameters:
    - rarity: Filter by specific rarity
    - search: Search card names/descriptions
    - sort: Sort by name, rarity, ownership_percentage
```

### **Archive Component Structure**
```javascript
// ArchiveCard.js - Individual card in archive
const ArchiveCard = ({ 
  card, 
  userOwns, 
  userQuantity, 
  ownershipPercentage,
  onDetailsClick 
}) => {
  return (
    <Card sx={{ position: 'relative' }}>
      {/* Ownership Badge */}
      {userOwns ? (
        <Chip label={`✓ x${userQuantity}`} color="success" />
      ) : (
        <Chip label="❌ Missing" color="error" />
      )}
      
      {/* Card Image */}
      <CardMedia component="img" src={card.airona_sticker_path} />
      
      {/* Card Info */}
      <CardContent>
        <Typography variant="h6">{card.name}</Typography>
        <Chip label={card.rarity} size="small" />
        <Typography variant="body2" color="text.secondary">
          {ownershipPercentage}% of players own this
        </Typography>
      </CardContent>
      
      <CardActions>
        <Button onClick={() => onDetailsClick(card)}>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

// CardArchive.js - Main archive page
const CardArchive = () => {
  const [cards, setCards] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  
  // Fetch archive data
  // Filter and search logic
  // Detail modal handling
  
  return (
    <Container>
      {/* Filter Bar */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <Button onClick={() => setFilter('all')}>All Cards</Button>
          <Button onClick={() => setFilter('elite')}>Elite</Button>
          <Button onClick={() => setFilter('super_rare')}>Super Rare</Button>
          <Button onClick={() => setFilter('ultra_rare')}>Ultra Rare</Button>
        </Stack>
        <TextField 
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>
      
      {/* Cards Grid */}
      <Grid container spacing={2}>
        {filteredCards.map(card => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
            <ArchiveCard {...card} onDetailsClick={setSelectedCard} />
          </Grid>
        ))}
      </Grid>
      
      {/* Detail Modal */}
      <CardDetailModal 
        card={selectedCard}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </Container>
  );
};
```

### **Archive Navigation Integration**
```javascript
// Add to Collection page navigation
<Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
  <Button variant="outlined" onClick={() => router.push('/game/fortune/collection')}>
    📚 My Collection
  </Button>
  <Button variant="contained" onClick={() => router.push('/game/fortune/archive')}>
    🗃️ Card Archive
  </Button>
  <Button variant="outlined" onClick={() => router.push('/game/fortune/leaderboard')}>
    🏆 Leaderboard
  </Button>
</Box>
```

### **Archive Statistics Features**

#### **Rarity Distribution Display**
```javascript
const RarityStats = ({ cards }) => {
  const rarityStats = cards.reduce((acc, card) => {
    acc[card.rarity] = (acc[card.rarity] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6">Card Distribution</Typography>
      <Stack direction="row" spacing={2}>
        <Chip label={`Ultra Rare: ${rarityStats.ultra_rare || 0}`} color="warning" />
        <Chip label={`Super Rare: ${rarityStats.super_rare || 0}`} color="secondary" />
        <Chip label={`Elite: ${rarityStats.elite || 0}`} color="primary" />
      </Stack>
    </Box>
  );
};
```

#### **Collection Progress Bar**
```javascript
const CollectionProgress = ({ userCards, totalCards }) => {
  const ownedCount = userCards.filter(card => card.user_owns).length;
  const progressPercentage = (ownedCount / totalCards) * 100;
  
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6">
        Collection Progress: {ownedCount}/{totalCards} ({progressPercentage.toFixed(1)}%)
      </Typography>
      <LinearProgress variant="determinate" value={progressPercentage} />
    </Box>
  );
};
```

### **Mobile-Optimized Archive**
- **Compact Card View**: Smaller cards on mobile with essential info
- **Swipe Navigation**: Swipe between rarity filters
- **Search Bar**: Sticky search at top of screen
- **Quick Stats**: Collapsible statistics panel
- **Fast Loading**: Pagination for large card collections

### **Archive Benefits**
1. **Transparency**: Players see all available cards
2. **Goal Setting**: Clear targets for collection completion  
3. **Community Insight**: See popular/rare cards
4. **Discovery**: Learn about cards they haven't seen
5. **Planning**: Understand what they're missing

## 📱 Mobile Responsiveness Considerations

### **Banner Selector**
- Horizontal scrollable tabs on mobile
- Touch-friendly button sizing
- Clear active state indicators

### **Coin Balance**
- Prominent display at top of screen
- Fixed position during scrolling
- Large, readable font size

### **Card Grid**
- 2 columns on mobile, 4+ on desktop  
- Touch targets for selection
- Swipe gestures for navigation

### **Dismantling Interface**
- Modal overlay for card selection
- Checkbox interfaces optimized for touch
- Clear confirmation dialogs

## 🎯 Success Metrics

### **Engagement Metrics**
- Daily active users drawing cards
- Coin spending vs earning ratio
- Banner preference analytics
- Card collection completion rates

### **Economy Health**
- Average coin balance per user
- Dismantling frequency and patterns
- Pity system trigger rates
- Rate-up card acquisition rates

---

*This enhanced system transforms the simple daily draw into a full gacha game economy while maintaining the core charm of Airona's blessing system. The implementation maintains backward compatibility while adding extensive new features for long-term engagement.*
