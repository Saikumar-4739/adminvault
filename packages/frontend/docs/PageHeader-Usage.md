# PageHeader Component Usage Guide

## Overview
The `PageHeader` component provides a consistent header layout across all pages in the application, matching the style used in Asset Inventory.

## Location
`packages/frontend/src/components/ui/PageHeader.tsx`

## Props

```typescript
interface Action {
    label: string;           // Button text
    onClick: () => void;     // Click handler
    icon?: React.ReactNode;  // Optional icon (e.g., <Plus className="h-4 w-4" />)
    variant?: 'primary' | 'outline' | 'ghost';  // Button style
}

interface PageHeaderProps {
    title: string;          // Page title
    description?: string;   // Optional subtitle/description
    icon?: React.ReactNode; // Optional icon beside title
    gradient?: string;      // Optional gradient for icon background (default: 'from-indigo-500 to-purple-600')
    actions?: Action[];     // Optional action buttons
}
```

## Basic Usage

### Simple Header (Title Only)
```tsx
import PageHeader from '@/components/ui/PageHeader';

<PageHeader title="Employee Directory" />
```

### Header with Description
```tsx
<PageHeader
    title="Employee Directory"
    description="Manage employee information and assignments"
/>
```

### Header with Icon
```tsx
import { Users } from 'lucide-react';

<PageHeader
    title="Employee Directory"
    description="Manage employee information and assignments"
    icon={<Users />}
    gradient="from-blue-500 to-indigo-600"
/>
```

### Header with Actions
```tsx
import { Plus, FileUp, Users } from 'lucide-react';

<PageHeader
    title="Employee Directory"
    description="Manage employee information and assignments"
    actions={[
        {
            label: 'Import',
            onClick: () => setImportModalOpen(true),
            icon: <FileUp className="h-4 w-4" />,
            variant: 'outline'
        },
        {
            label: 'Add Employee',
            onClick: () => setFormModalOpen(true),
            icon: <Plus className="h-4 w-4" />,
            variant: 'primary'
        }
    ]}
/>
```

## Examples for Different Pages

### Licenses Page
```tsx
<PageHeader
    title="License Manager"
    description="Track and manage software licenses across the organization"
    actions={[
        {
            label: 'Add License',
            onClick: handleAddLicense,
            icon: <Plus className="h-4 w-4" />,
            variant: 'primary'
        }
    ]}
/>
```

### Employees Page
```tsx
<PageHeader
    title="Employee Directory"
    description="Manage employee information and assignments"
    actions={[
        {
            label: 'Bulk Import',
            onClick: () => setImportModalOpen(true),
            icon: <FileUp className="h-4 w-4" />,
            variant: 'outline'
        },
        {
            label: 'Add Employee',
            onClick: () => setFormModalOpen(true),
            icon: <Plus className="h-4 w-4" />,
            variant: 'primary'
        }
    ]}
/>
```

### Masters/Configuration Page
```tsx
<PageHeader
    title="Configuration"
    description="Manage master data and system configuration"
    actions={[
        {
            label: 'Add Master',
            onClick: handleAddMaster,
            icon: <Plus className="h-4 w-4" />,
            variant: 'primary'
        }
    ]}
/>
```

### Tickets Page
```tsx
<PageHeader
    title="Support Tickets"
    description="Track and manage support requests"
    actions={[
        {
            label: 'Create Ticket',
            onClick: () => setTicketModalOpen(true),
            icon: <Plus className="h-4 w-4" />,
            variant: 'primary'
        }
    ]}
/>
```

## Styling
The component uses consistent styling:
- **Title**: 3xl font, black weight, slate-900/white color
- **Description**: Slate-500 color, medium weight
- **Actions**: Flex layout with 2px gap, responsive on mobile
- **Buttons**: sm size with left icons

## Benefits
✅ Consistent header design across all pages
✅ Responsive layout (stacks on mobile)
✅ Easy to add/remove action buttons
✅ Matches Asset Inventory design
✅ Reduces code duplication
