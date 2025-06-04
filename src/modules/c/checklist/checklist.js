import { LightningElement, api } from 'lwc';

export default class Checklist extends LightningElement {
    @api
    get items() {
        return this._items || [];
    }
    set items(value) {
        this._items = Array.isArray(value)
            ? value.map((item) => {
                  return {
                      ...item,
                      statusClass: this.getStatusClass(item.status),
                      formattedLastModifiedDate: item.lastModifiedDate
                          ? this.formatDate(item.lastModifiedDate)
                          : '',
                      formattedCreatedDate: item.createdDate
                          ? this.formatSimpleDate(item.createdDate)
                          : item.lastModifiedDate
                            ? this.formatSimpleDate(item.lastModifiedDate)
                            : ''
                  };
              })
            : [];

        // Reset view state when items change
        this.visibleItemCount = this.initialVisibleItems;
        // Close any open dropdowns when items change
        this.activeDropdown = null;
    }

    _items = [];
    initialVisibleItems = 2; // Initial number of cards to show
    visibleItemCount = this.initialVisibleItems;
    activeDropdown = null; // Tracks which dropdown is currently open

    /**
     * Returns the items that should be visible in the mobile view
     */
    get visibleItems() {
        return this.items.slice(0, this.visibleItemCount);
    }

    /**
     * Returns true if there are items to display
     */
    get hasItems() {
        return this.items.length > 0;
    }

    /**
     * Returns true if there are no items to display
     */
    get noData() {
        return !this.hasItems;
    }

    /**
     * Returns true if we should show the View More button
     */
    get showViewMoreButton() {
        return this.items.length > this.visibleItemCount;
    }

    /**
     * Handle the View More button click
     */
    handleViewMore() {
        // Show all remaining items
        this.visibleItemCount = this.items.length;
    }

    /**
     * Handle toggling the dropdown menu
     */
    handleToggleMenu(event) {
        // Get the item ID from the clicked element
        const itemId = event.currentTarget.dataset.id;

        // Find all dropdown menus
        const allDropdowns =
            this.template.querySelectorAll('.dropdown-content');

        // Close all dropdowns first
        allDropdowns.forEach((dropdown) => {
            if (
                dropdown.dataset.id !== itemId ||
                (dropdown.dataset.id === itemId &&
                    dropdown.classList.contains('show'))
            ) {
                dropdown.classList.remove('show');
            }
        });

        // Toggle the dropdown for the clicked item
        const dropdown = this.template.querySelector(
            `.dropdown-content[data-id="${itemId}"]`
        );
        if (dropdown) {
            if (!dropdown.classList.contains('show')) {
                dropdown.classList.add('show');
                this.activeDropdown = itemId;
            } else {
                this.activeDropdown = null;
            }
        }

        // Prevent event from bubbling up
        event.stopPropagation();
    }

    /**
     * Close all dropdowns when clicking outside
     */
    connectedCallback() {
        // Add click event listener to document to close dropdown when clicking outside
        this.documentClickListener = this.handleDocumentClick.bind(this);
        document.addEventListener('click', this.documentClickListener);
    }

    disconnectedCallback() {
        // Remove document click listener when component is destroyed
        document.removeEventListener('click', this.documentClickListener);
    }

    handleDocumentClick() {
        // Close any open dropdowns
        const allDropdowns = this.template.querySelectorAll(
            '.dropdown-content.show'
        );
        if (allDropdowns.length > 0) {
            allDropdowns.forEach((dropdown) => {
                dropdown.classList.remove('show');
            });
            this.activeDropdown = null;
        }
    }

    /**
     * Handle edit button click
     */
    handleEdit(event) {
        const itemId = event.currentTarget.dataset.id;
        const selectedItem = this.items.find((item) => item.id === itemId);

        // Dispatch edit event with item details
        if (selectedItem) {
            this.dispatchEvent(
                new CustomEvent('edit', {
                    detail: {
                        itemId: itemId,
                        item: selectedItem
                    }
                })
            );
        }

        // Close the dropdown
        this.closeDropdown(itemId);
    }

    /**
     * Handle delete button click
     */
    handleDelete(event) {
        const itemId = event.currentTarget.dataset.id;

        // Dispatch delete event with item id
        this.dispatchEvent(
            new CustomEvent('delete', {
                detail: {
                    itemId: itemId
                }
            })
        );

        // Close the dropdown
        this.closeDropdown(itemId);
    }

    /**
     * Helper to close a specific dropdown
     */
    closeDropdown(itemId) {
        const dropdown = this.template.querySelector(
            `.dropdown-content[data-id="${itemId}"]`
        );
        if (dropdown) {
            dropdown.classList.remove('show');
            this.activeDropdown = null;
        }
    }

    /**
     * Returns a CSS class based on the status
     */
    getStatusClass(status) {
        if (!status) return 'status-default';

        const normalizedStatus = status.toLowerCase();

        switch (normalizedStatus) {
            case 'completed':
            case 'done':
            case 'finished':
                return 'status-completed';

            case 'in progress':
            case 'ongoing':
            case 'started':
                return 'status-in-progress';

            case 'pending':
            case 'not started':
            case 'todo':
                return 'status-pending';

            case 'blocked':
            case 'stopped':
            case 'halted':
                return 'status-blocked';

            default:
                return 'status-default';
        }
    }

    /**
     * Formats a date string or timestamp into a readable format
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return '';
            }

            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    }

    /**
     * Formats a date into MM/DD/YYYY format
     */
    formatSimpleDate(dateString) {
        try {
            const date = new Date(dateString);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return '';
            }

            return new Intl.DateTimeFormat('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric'
            }).format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    }
}
