# Assessment Type Component

A responsive assessment type component that displays data in a table format on desktop and card format on mobile screens.

## Features

- Responsive design that adapts to different screen sizes
- Table view for desktop displays
- Card view for mobile displays
- Color-coded status indicators
- Empty state handling
- Automatic date formatting
- Edit and delete functionality with dropdown menus

## Usage

```html
<c-assessment-type items="{yourAssessmentItems}"></c-assessment-type>
```

## API

### Properties

| Name  | Type  | Description                         |
| ----- | ----- | ----------------------------------- |
| items | Array | An array of assessment item objects |

### Events

| Name   | Description                              | Detail           |
| ------ | ---------------------------------------- | ---------------- |
| select | Fired when an assessment type is clicked | { itemId, item } |
| edit   | Fired when the edit option is selected   | { itemId, item } |
| delete | Fired when the delete option is selected | { itemId }       |

### Item Structure

Each item in the `items` array should have the following structure:

```javascript
{
    id: 'unique-id',               // Unique identifier for the item
    name: 'Assessment Type Name',  // Name/title of the assessment type
    area: 'Assessment Area',       // Area this assessment type belongs to
    recordType: 'Record Type',     // Record type for this assessment
    status: 'Active',              // Status (Active, Inactive, Draft, Archived)
    createdBy: 'User Name',        // Name of user who created the assessment type
    lastModifiedBy: 'User Name',   // Name of user who last modified the assessment type
    lastModifiedDate: '2023-05-10T14:48:00.000Z', // ISO date string of last modification
    createdDate: '2023-05-01T10:30:00.000Z'       // ISO date string of creation date
}
```

## Status Colors

The component automatically assigns colors to statuses:

- **Active**: Green
- **Inactive**: Red
- **Draft**: Blue
- **Archived**: Gray
- **Default**: Gray

## Security

This component follows Salesforce best practices and secure coding guidelines:

- Input validation for all user-controllable data
- Proper XSS prevention through LWC framework's built-in security features
- No use of `eval()` or other unsafe JavaScript methods
- All dynamically created DOM elements use LWC's secure rendering

## Demo

For a complete working example, create a demo component that demonstrates how to use this component with sample data.
