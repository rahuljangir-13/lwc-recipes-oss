# Checklist Detail Page Component

A responsive component for displaying detailed checklist information in a clean, well-organized layout.

## Features

- Modern, clean design that matches the Salesforce Lightning Design System
- Expandable/collapsible sections for organizing content
- Back navigation to return to the checklist list
- Edit functionality for modifying checklist details
- Responsive layout for desktop and mobile devices

## Usage

```html
<c-checklist-detail-page
    record-id="checklistId123"
    onback="{handleBackToList}"
    onedit="{handleEditChecklist}"
></c-checklist-detail-page>
```

## API

### Properties

| Name     | Type   | Description                        |
| -------- | ------ | ---------------------------------- |
| recordId | String | The ID of the checklist to display |

### Methods

| Name             | Parameters | Description                             |
| ---------------- | ---------- | --------------------------------------- |
| setChecklistData | data       | Sets the checklist data to be displayed |

### Events

| Name | Description                           | Detail               |
| ---- | ------------------------------------- | -------------------- |
| back | Fired when the back button is clicked | None                 |
| edit | Fired when the edit button is clicked | { recordId: String } |

## Sections

The detail page is organized into the following collapsible sections:

1. **General Information** - Basic details about the checklist
2. **Questions** - Questions associated with the checklist
3. **Files** - Files attached to the checklist
4. **Preview** - Preview of the checklist

## Example Data Structure

```javascript
{
    assessmentName: 'Assessment 16-05',
    category: 'Health & Safety',
    checklistName: 'SIF Alert',
    occurrence: 'One Time',
    startDate: '5/1/2025',
    endDate: '5/31/2025',
    customer: 'Alpha Corporation',
    description: 'description',
    orgComponent: 'Spare Parts Room'
}
```
