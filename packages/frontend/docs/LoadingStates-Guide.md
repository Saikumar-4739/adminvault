# Loading States Guide

## Overview
Consistent loading states across all pages for better user experience.

## Components

### 1. PageLoader
Full-page loading spinner with optional message.

**Usage:**
```tsx
import { PageLoader } from '@/components/ui/Spinner';

{isLoading && <PageLoader message="Loading data..." />}
```

**Props:**
- `message?: string` - Optional loading message (default: "Loading...")

**Example:**
```tsx
{isLoading ? (
    <PageLoader message="Fetching assets..." />
) : (
    // Your content
)}
```

---

### 2. CardSkeleton
Skeleton loader for card-based layouts (grid view).

**Usage:**
```tsx
import { CardSkeleton } from '@/components/ui/Spinner';

{isLoading && <CardSkeleton count={6} />}
```

**Props:**
- `count?: number` - Number of skeleton cards (default: 6)
- `className?: string` - Custom grid className

**Example:**
```tsx
{isLoading ? (
    <CardSkeleton count={8} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" />
) : (
    // Your cards
)}
```

---

### 3. TableSkeleton
Skeleton loader for table/list layouts.

**Usage:**
```tsx
import { TableSkeleton } from '@/components/ui/Spinner';

{isLoading && <TableSkeleton rows={10} />}
```

**Props:**
- `rows?: number` - Number of skeleton rows (default: 5)

**Example:**
```tsx
{isLoading ? (
    <TableSkeleton rows={10} />
) : (
    // Your table
)}
```

---

### 4. EmptyState
Consistent empty state when no data is available.

**Usage:**
```tsx
import { EmptyState } from '@/components/ui/Spinner';
import { Package } from 'lucide-react';

{data.length === 0 && (
    <EmptyState
        icon={Package}
        title="No Assets Found"
        description="Try adjusting your filters or add a new asset"
    />
)}
```

**Props:**
- `icon: React.ComponentType` - Lucide icon component
- `title: string` - Empty state title
- `description: string` - Empty state description

---

### 5. Spinner
Basic spinner component for inline loading.

**Usage:**
```tsx
import Spinner from '@/components/ui/Spinner';

<Spinner size="md" variant="primary" />
```

**Props:**
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Spinner size
- `variant?: 'primary' | 'secondary' | 'white'` - Color variant

---

## Page Implementation Pattern

### Standard Loading Pattern
```tsx
import { PageLoader, EmptyState } from '@/components/ui/Spinner';
import { Package } from 'lucide-react';

export default function MyPage() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="p-6 space-y-6">
            <PageHeader title="My Page" />

            {isLoading ? (
                <PageLoader message="Loading data..." />
            ) : data.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No Data Found"
                    description="Try adding some items to get started"
                />
            ) : (
                <div className="grid grid-cols-3 gap-6">
                    {data.map(item => (
                        <Card key={item.id}>{/* ... */}</Card>
                    ))}
                </div>
            )}
        </div>
    );
}
```

### Card Grid Pattern
```tsx
import { CardSkeleton, EmptyState } from '@/components/ui/Spinner';

{isLoading ? (
    <CardSkeleton count={9} className="grid grid-cols-1 md:grid-cols-3 gap-6" />
) : filteredData.length === 0 ? (
    <EmptyState
        icon={Search}
        title="No Results"
        description="Try adjusting your search or filters"
    />
) : (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredData.map(item => <Card key={item.id} />)}
    </div>
)}
```

### Table/List Pattern
```tsx
import { TableSkeleton, EmptyState } from '@/components/ui/Spinner';

{isLoading ? (
    <TableSkeleton rows={10} />
) : data.length === 0 ? (
    <EmptyState
        icon={Users}
        title="No Users Found"
        description="Add your first user to get started"
    />
) : (
    <table>{/* ... */}</table>
)}
```

---

## Best Practices

### 1. Always Show Loading State
```tsx
// ✅ Good
{isLoading ? <PageLoader /> : <Content />}

// ❌ Bad - No loading indicator
{!isLoading && <Content />}
```

### 2. Use Appropriate Skeleton
```tsx
// ✅ Good - Card grid uses CardSkeleton
{isLoading ? <CardSkeleton /> : <CardGrid />}

// ✅ Good - Table uses TableSkeleton
{isLoading ? <TableSkeleton /> : <Table />}

// ❌ Bad - Mismatched skeleton
{isLoading ? <TableSkeleton /> : <CardGrid />}
```

### 3. Handle Empty States
```tsx
// ✅ Good - Shows empty state
{isLoading ? (
    <PageLoader />
) : data.length === 0 ? (
    <EmptyState icon={Package} title="No Data" description="..." />
) : (
    <Content />
)}

// ❌ Bad - No empty state
{isLoading ? <PageLoader /> : <Content />}
```

### 4. Consistent Messages
```tsx
// ✅ Good - Specific message
<PageLoader message="Loading assets..." />

// ✅ Good - Default message
<PageLoader />

// ❌ Bad - Generic/unclear
<PageLoader message="Please wait..." />
```

---

## Examples by Page Type

### Assets Page
```tsx
{isLoading ? (
    <CardSkeleton count={12} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" />
) : filteredAssets.length === 0 ? (
    <EmptyState
        icon={Package}
        title="No Assets Found"
        description="Try adjusting your filters or add a new asset"
    />
) : (
    // Asset cards
)}
```

### Tickets Page
```tsx
{isLoading && tickets.length === 0 ? (
    <PageLoader message="Loading tickets..." />
) : filteredTickets.length === 0 ? (
    <EmptyState
        icon={Ticket}
        title="No Tickets Found"
        description="Try adjusting your filters or search query"
    />
) : (
    // Ticket cards
)}
```

### Employees Page
```tsx
{isLoading ? (
    <TableSkeleton rows={15} />
) : employees.length === 0 ? (
    <EmptyState
        icon={Users}
        title="No Employees Found"
        description="Add your first employee to get started"
    />
) : (
    // Employee table
)}
```

---

## Styling

All loading components use consistent styling:
- **Colors**: Indigo-600 for primary, Slate for neutral
- **Animation**: Smooth spin/pulse animations
- **Dark Mode**: Fully supported with dark: variants
- **Spacing**: Consistent padding and margins
- **Typography**: Matching font weights and sizes

---

## Migration Guide

### Old Pattern
```tsx
{isLoading && (
    <div className="flex justify-center py-12">
        <div className="animate-spin ...">...</div>
    </div>
)}
```

### New Pattern
```tsx
{isLoading && <PageLoader />}
```

---

## Summary

✅ **PageLoader** - Full page loading  
✅ **CardSkeleton** - Card grid loading  
✅ **TableSkeleton** - Table/list loading  
✅ **EmptyState** - No data state  
✅ **Spinner** - Inline loading  

Use these components consistently across all pages for a professional, unified user experience!
