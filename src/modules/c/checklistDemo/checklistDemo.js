import { LightningElement, track } from 'lwc';

export default class ChecklistDemo extends LightningElement {
    @track checklistItems = [];
    @track showChecklistModal = false;

    connectedCallback() {
        // Initialize with sample data when component is inserted into the DOM
        this.initSampleData();
    }

    initSampleData() {
        // Get current date and some past dates for the demo
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        const lastWeek = new Date(now);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        // Create sample checklist items
        this.checklistItems = [
            {
                id: 'item1',
                name: 'Checklist 16-05',
                status: 'Completed',
                category: 'Alpha Corporation',
                createdBy: 'John Smith',
                lastModifiedBy: 'Jane Doe',
                createdDate: twoWeeksAgo.toISOString(),
                lastModifiedDate: now.toISOString()
            },
            {
                id: 'item2',
                name: 'Checklist 17-B2',
                status: 'In Progress',
                category: 'Beta Industries',
                createdBy: 'Alex Johnson',
                lastModifiedBy: 'Alex Johnson',
                createdDate: lastWeek.toISOString(),
                lastModifiedDate: yesterday.toISOString()
            },
            {
                id: 'item3',
                name: 'Checklist 18-C4',
                status: 'Pending',
                category: 'Gamma Services',
                createdBy: 'Sarah Williams',
                lastModifiedBy: 'Mike Brown',
                createdDate: lastWeek.toISOString(),
                lastModifiedDate: lastWeek.toISOString()
            },
            {
                id: 'item4',
                name: 'Checklist 19-D7',
                status: 'Blocked',
                category: 'Delta Tech',
                createdBy: 'David Wilson',
                lastModifiedBy: 'David Wilson',
                createdDate: yesterday.toISOString(),
                lastModifiedDate: lastWeek.toISOString()
            },
            {
                id: 'item5',
                name: 'Checklist 20-E9',
                status: 'Pending',
                category: 'Epsilon Solutions',
                createdBy: 'Emily Taylor',
                lastModifiedBy: 'John Smith',
                createdDate: yesterday.toISOString(),
                lastModifiedDate: yesterday.toISOString()
            },
            {
                id: 'item6',
                name: 'Checklist 21-F3',
                status: 'In Progress',
                category: 'Zeta Consulting',
                createdBy: 'Mike Brown',
                lastModifiedBy: 'Alex Johnson',
                createdDate: now.toISOString(),
                lastModifiedDate: now.toISOString()
            }
        ];
    }

    handleAddItem() {
        // Sample data for random selection
        const statuses = ['Completed', 'In Progress', 'Pending', 'Blocked'];
        const categories = [
            'Planning',
            'Design',
            'Development',
            'Testing',
            'Deployment'
        ];
        const names = [
            'Review Pull Request',
            'Update Documentation',
            'Fix Bug in Login System',
            'Optimize Database Queries',
            'Deploy to Production',
            'Create User Manual'
        ];
        const users = [
            'John Smith',
            'Jane Doe',
            'Alex Johnson',
            'Sarah Williams',
            'Mike Brown',
            'David Wilson'
        ];

        // Get random values
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomStatus =
            statuses[Math.floor(Math.random() * statuses.length)];
        const randomCategory =
            categories[Math.floor(Math.random() * categories.length)];
        const randomCreator = users[Math.floor(Math.random() * users.length)];
        const randomModifier = users[Math.floor(Math.random() * users.length)];

        // Create a new item with random data
        const newItem = {
            id: 'item' + (this.checklistItems.length + 5),
            name: randomName,
            status: randomStatus,
            category: randomCategory,
            createdBy: randomCreator,
            lastModifiedBy: randomModifier,
            lastModifiedDate: new Date().toISOString()
        };

        // Add to the existing items
        this.checklistItems = [...this.checklistItems, newItem];
    }

    handleResetItems() {
        // Reset to initial sample data
        this.initSampleData();
    }

    // Handle edit item event from checklist component
    handleEditItem(event) {
        const { itemId, item } = event.detail;
        console.log(`Editing item: ${itemId}`, item);

        // Use connectivity status component for toast notification if available
        // In the real app, you would use a proper notification system
        // This is just for demo purposes
        this.showNotification(`Editing ${item.name}`, 'info');

        // In a real application, you would open an edit modal or navigate to an edit page
    }

    // Handle delete item event from checklist component
    handleDeleteItem(event) {
        const { itemId } = event.detail;
        console.log(`Deleting item: ${itemId}`);

        // In a real application, you would show a confirmation dialog
        // For this demo, we'll just remove the item from the array
        this.checklistItems = this.checklistItems.filter(
            (item) => item.id !== itemId
        );

        // Show notification
        this.showNotification('Item deleted successfully', 'success');
    }

    // Helper method to show notifications
    showNotification(message, variant) {
        // In a real app, you would use a proper notification system
        // For this demo, we'll just log to console
        console.log(`${variant.toUpperCase()}: ${message}`);

        // Dispatch a custom event that the parent app component can listen to
        this.dispatchEvent(
            new CustomEvent('notification', {
                bubbles: true,
                composed: true,
                detail: {
                    message,
                    variant
                }
            })
        );
    }
    handleOpenChecklistModal() {
        console.log('Opening checklist modal...');
        this.showChecklistModal = true;
    }

    handleCloseChecklistModal() {
        this.showChecklistModal = false;
    }
}
