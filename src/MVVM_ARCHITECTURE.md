# Reality Bracket - MVVM Architecture

## Overview

This application follows the **Model-View-ViewModel (MVVM)** architectural pattern with clear separation of concerns, preparing for Supabase backend integration.

## Directory Structure

```
/
├── models/                    # Data models and types
│   ├── index.ts              # Core data interfaces/types
│   ├── types.ts              # Legacy types (to be migrated)
│   ├── constants.ts          # App-wide constants
│   ├── mockData.ts           # Legacy mock data
│   └── seasonContestants.ts  # Season-specific data
│
├── viewmodels/                # Business logic layer
│   ├── index.ts              # Centralized exports
│   ├── home.viewmodel.ts     # Home page logic
│   ├── roster.viewmodel.ts   # Roster management logic
│   ├── league.viewmodel.ts   # League standings logic
│   ├── activity.viewmodel.ts # Activity feed logic
│   └── auth.viewmodel.ts     # Authentication logic
│
├── services/                  # External services integration
│   ├── supabaseService.ts    # Supabase API wrapper
│   └── supabase-schema.md    # Database schema documentation
│
├── components/                # React UI components (Views)
│   ├── pages/                # Page-level components
│   │   ├── HomePage.tsx
│   │   ├── RosterPage.tsx
│   │   └── LeaguePage.tsx
│   │
│   ├── drawers/              # Drawer components
│   │   ├── LatestActivityDrawer.tsx
│   │   ├── ProfileDrawer.tsx
│   │   └── ContestantReplacementDrawer.tsx
│   │
│   ├── modals/               # Modal dialogs
│   │   ├── CreateLeagueModal.tsx
│   │   └── JoinLeagueModal.tsx
│   │
│   ├── common/               # Reusable components
│   │   └── LeagueSelector.tsx
│   │
│   ├── home/                 # Home-specific components
│   ├── roster/               # Roster-specific components
│   ├── league/               # League-specific components
│   ├── activity/             # Activity-specific components
│   └── ui/                   # Base UI components
│
├── data/                      # Mock/seed data (temporary)
│   └── mockData.ts
│
├── styles/                    # Global styles
│   └── globals.css
│
└── App.tsx                    # Root component

```

## Architecture Layers

### 1. Model Layer (`/models`)

**Purpose**: Define data structures and business entities.

- **Pure TypeScript interfaces** - no business logic
- Represents database tables and API responses
- Type-safe data contracts across the app

**Example**:
```typescript
export interface League {
  id: string;
  name: string;
  seasonId: string;
  // ...
}
```

### 2. Service Layer (`/services`)

**Purpose**: Handle external API calls and data persistence.

- **Supabase integration** - all database operations
- API wrappers and data fetching
- Abstraction over backend services
- Error handling and data transformation

**Example**:
```typescript
export class SupabaseService {
  static async getLeaguesByUserId(userId: string): Promise<League[]> {
    // Supabase query logic
  }
}
```

### 3. ViewModel Layer (`/viewmodels`)

**Purpose**: Business logic, state management, and data preparation for views.

- **React hooks** that encapsulate business logic
- Manages component state
- Calls service layer for data
- Transforms data for UI consumption
- Handles user actions
- Falls back to mock data when Supabase is not connected

**Example**:
```typescript
export const useHomeViewModel = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  
  const fetchLeagues = async (userId: string) => {
    const data = await SupabaseService.getLeaguesByUserId(userId);
    setLeagues(data || mockLeagues); // Fallback to mock
  };
  
  return { leagues, fetchLeagues };
};
```

### 4. View Layer (`/components`)

**Purpose**: React components responsible for UI rendering only.

- **Presentational components** - minimal logic
- Consume ViewModels via hooks
- Handle user interactions by calling ViewModel functions
- Render UI based on ViewModel state

**Example**:
```typescript
export default function HomePage() {
  const { leagues, fetchLeagues } = useHomeViewModel();
  
  return <div>{leagues.map(league => ...)}</div>;
}
```

## Data Flow

```
User Interaction
      ↓
   View (Component)
      ↓
   ViewModel (Hook)
      ↓
   Service (Supabase)
      ↓
   Database
      ↓
   Service (Transform)
      ↓
   ViewModel (Update State)
      ↓
   View (Re-render)
```

## Supabase Integration Strategy

### Current State
- All ViewModels have **dummy functions** that return mock data
- Service layer has **TODO comments** indicating where Supabase calls will go
- App works fully with mock data

### Migration Path
1. **Set up Supabase project** and create tables (see `supabase-schema.md`)
2. **Install Supabase client**: `npm install @supabase/supabase-js`
3. **Initialize client** in `services/supabaseService.ts`
4. **Implement service methods** one by one, removing TODOs
5. **Test each ViewModel** with real data
6. **Remove mock data** fallbacks once stable

### Example Migration

**Before** (current):
```typescript
static async getLeaguesByUserId(userId: string): Promise<League[]> {
  // TODO: Connect to Supabase
  return [];
}
```

**After** (with Supabase):
```typescript
static async getLeaguesByUserId(userId: string): Promise<League[]> {
  const { data } = await supabase
    .from('league_members')
    .select('leagues(*)')
    .eq('user_id', userId);
  return data;
}
```

## Benefits of This Architecture

1. **Separation of Concerns**: Clear boundaries between UI, logic, and data
2. **Testability**: Each layer can be tested independently
3. **Maintainability**: Changes to one layer don't affect others
4. **Scalability**: Easy to add new features following the same pattern
5. **Type Safety**: Full TypeScript support across all layers
6. **Progressive Enhancement**: Works with mock data, easily connects to Supabase

## Best Practices

### ViewModels
- ✅ One ViewModel per page/feature
- ✅ Export custom hooks (e.g., `useHomeViewModel`)
- ✅ Handle all async operations
- ✅ Provide loading/error states
- ❌ Don't render JSX
- ❌ Don't import React components

### Services
- ✅ Static methods for stateless operations
- ✅ Clear function names (e.g., `getLeaguesByUserId`)
- ✅ Type-safe inputs and outputs
- ✅ Handle errors gracefully
- ❌ Don't manage React state
- ❌ Don't import ViewModels

### Components
- ✅ Focus on UI rendering
- ✅ Use ViewModels for data and logic
- ✅ Keep components small and focused
- ✅ Use TypeScript props
- ❌ Don't call services directly
- ❌ Don't implement complex business logic

## Next Steps for Supabase Integration

1. **Create Supabase project** at supabase.com
2. **Run SQL migrations** from `services/supabase-schema.md`
3. **Get API keys** and add to environment variables
4. **Initialize Supabase client** in `services/supabaseService.ts`
5. **Implement authentication** using `useAuthViewModel`
6. **Connect one feature at a time** (start with Home page)
7. **Test thoroughly** with real data
8. **Enable Row Level Security** for data protection
