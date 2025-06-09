# Checklist Component

A responsive checklist component that displays data in a table format on desktop and card format on mobile screens.

## Features

- Responsive design that adapts to different screen sizes
- Table view for desktop displays
- Card view for mobile displays
- Color-coded status indicators
- Empty state handling
- Automatic date formatting

## Usage

```html
<c-checklist items="{yourChecklistItems}"></c-checklist>
```

## API

### Properties

| Name  | Type  | Description                        |
| ----- | ----- | ---------------------------------- |
| items | Array | An array of checklist item objects |

### Item Structure

Each item in the `items` array should have the following structure:

```javascript
{
    id: 'unique-id',               // Unique identifier for the item
    name: 'Task Name',             // Name/title of the task
    status: 'Completed',           // Status (Completed, In Progress, Pending, Blocked)
    category: 'Category Name',     // Category the task belongs to
    createdBy: 'User Name',        // Name of user who created the task
    lastModifiedBy: 'User Name',   // Name of user who last modified the task
    lastModifiedDate: '2023-05-10T14:48:00.000Z' // ISO date string of last modification
}
```

## Status Colors

The component automatically assigns colors to statuses:

- **Completed/Done/Finished**: Green
- **In Progress/Ongoing/Started**: Blue
- **Pending/Not Started/Todo**: Orange
- **Blocked/Stopped/Halted**: Red
- **Default**: Gray

## Demo

For a complete working example, see the `c-checklist-demo` component which demonstrates how to use this component with sample data.
