# Reality Bracket - Architecture Documentation

## Overview
This application follows the **Model-View-ViewModel (MVVM)** architecture pattern to separate concerns and improve maintainability.

## Architecture Layers

### 1. Models (`/models`)
Contains data structures, types, constants, and mock data.

- **`types.ts`**: TypeScript interfaces and types for all data structures
  - `League`, `LeagueUser`, `Contestant`, `Season`, `Standing`
  - `ContestantEvent`, `SelectedBy`, `SpotType`
- **`mockData.ts`**: Mock data for development (will be replaced with API calls)
  - `leagues`, `leagueUsers`, `weeklyActivity`, `bottom1Pick`
  - `seasons`, `standings`, `takenContestants`, `leagueNameSuggestions`
- **`constants.ts`**: App-wide constants like colors, theme values, etc.
  - `tribeColors`, `eventColors`, `THEME_COLORS`

### 2. ViewModels (`/viewmodels`)
Contains custom React hooks that manage business logic and state.

- **`useRosterViewModel.ts`**: Manages state and logic for the Roster screen
  - Handles league selection
  - Manages draft state
  - Computes derived values (total points, etc.)
  - Provides actions for user interactions

- **`useHomeViewModel.ts`**: Manages state and logic for the Home screen
  - Handles join/create league flows
  - Manages season selection
  - Auto-populates league names
  - Controls sheet visibility

- **`useLeagueViewModel.ts`**: Manages state and logic for the League screen
  - Handles league selection
  - Computes league statistics
  - Manages activity drawer state
  - Provides top 3 standings

**Benefits:**
- Business logic is separated from UI
- Easy to test independently
- Reusable across different components
- Single source of truth for state

### 3. Views (`/components`)
Pure presentational components that receive data and callbacks via props.

#### Main Screens
- **`RosterScreen.tsx`**: Main roster view that uses the ViewModel
- **`HomeScreen.tsx`**: Home screen with league join/create functionality
- **`LeagueScreen.tsx`**: League standings screen with podium

#### Reusable UI Components

**Roster Components** (`/components/roster`)
- **`LeagueSelector.tsx`**: Dropdown for selecting leagues
- **`TotalPointsDisplay.tsx`**: Shows total points with animation
- **`Final3PickCard.tsx`**: Individual card for Final 3 picks
- **`Bottom1PickCard.tsx`**: Card for the Bottom 1 pick
- **`PointsBreakdown.tsx`**: Shows how points are calculated

**Home Components** (`/components/home`)
- **`LeagueCard.tsx`**: Card displaying league information
- **`JoinLeagueForm.tsx`**: Form for joining a league with invite code
- **`CreateLeagueForm.tsx`**: Form for creating a new league

**League Components** (`/components/league`)
- **`PodiumDisplay.tsx`**: Visual podium for top 3 standings
- **`StandingCard.tsx`**: Individual standing row with rank indicators
- **`LeagueStats.tsx`**: League statistics display

**Benefits:**
- Components are small and focused
- Easy to test and maintain
- Highly reusable
- Props-based API makes them flexible

## Data Flow

```
User Interaction
    ↓
View Component (e.g., RosterScreen)
    ↓
ViewModel Hook (e.g., useRosterViewModel)
    ↓
State Update / Action
    ↓
View Re-renders with new data
```

## Example: Adding a New Feature

### 1. Define Data Types
```typescript
// /models/types.ts
export interface NewFeature {
  id: number;
  name: string;
}
```

### 2. Create Mock Data
```typescript
// /models/mockData.ts
export const newFeatureData: NewFeature[] = [
  { id: 1, name: "Example" }
];
```

### 3. Create ViewModel
```typescript
// /viewmodels/useNewFeatureViewModel.ts
export const useNewFeatureViewModel = () => {
  const [data, setData] = useState(newFeatureData);
  
  const handleAction = () => {
    // Business logic here
  };
  
  return { data, handleAction };
};
```

### 4. Create View Components
```typescript
// /components/feature/FeatureCard.tsx
export const FeatureCard = ({ item, onAction }) => {
  return <Card>...</Card>;
};
```

### 5. Create Main Screen
```typescript
// /components/FeatureScreen.tsx
export default function FeatureScreen() {
  const viewModel = useNewFeatureViewModel();
  
  return (
    <div>
      {viewModel.data.map(item => (
        <FeatureCard 
          key={item.id}
          item={item}
          onAction={viewModel.handleAction}
        />
      ))}
    </div>
  );
}
```

## Best Practices

### ViewModels
- Keep them focused on a single screen or feature
- Return only what the view needs
- Use custom hooks for reusable logic
- Don't include JSX or UI logic

### View Components
- Keep them pure and presentational
- Accept all data via props
- Don't directly access external state
- Keep them small (< 100 lines when possible)

### Models
- Define clear interfaces for all data structures
- Use TypeScript for type safety
- Keep mock data separate from types
- Use constants for magic strings/numbers

## Migration Path

To refactor an existing component:

1. **Extract types** to `/models/types.ts`
2. **Extract data** to `/models/mockData.ts`
3. **Create ViewModel hook** with all logic
4. **Break down UI** into smaller components
5. **Update main component** to use ViewModel and sub-components

## Testing Strategy

- **Models**: Test data transformations and business rules
- **ViewModels**: Test state management and logic
- **Views**: Test rendering and user interactions

## Future Improvements

- Add API service layer
- Implement state management library (Redux/Zustand) if needed
- Add error boundaries
- Implement loading states
- Add caching layer for API responses