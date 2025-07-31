import { LightningElement, track, api } from 'lwc';
import { isOnline } from 'c/utils';

export default class Hazard extends LightningElement {
    @api objectApiName = 'Rhythm__Hazard__c'; // Default fallback
    @track hazards = [];
    @track isLoading = true;
    @track error = null;
    @track visibleItemCount = 2;
    @track activeDropdown = null;

    connectedCallback() {
        console.log('Hazard component - Object API Name:', this.objectApiName);
        this.fetchHazardsFromSalesforce();
        this.documentClickListener = this.handleDocumentClick.bind(this);
        document.addEventListener('click', this.documentClickListener);
    }

    get visibleItems() {
        return this.hazards.slice(0, this.visibleItemCount);
    }

    get hasItems() {
        return this.hazards.length > 0;
    }

    get noData() {
        return !this.hasItems && !this.isLoading;
    }

    get showViewMoreButton() {
        return this.hazards.length > this.visibleItemCount;
    }

    handleViewMore() {
        this.visibleItemCount = this.hazards.length;
    }

    handleHazardClick(event) {
        const itemId = event.currentTarget.dataset.id;
        const selectedItem = this.hazards.find((item) => item.id === itemId);

        if (selectedItem) {
            console.log('Hazard item clicked:', selectedItem);
            this.dispatchEvent(
                new CustomEvent('view', {
                    detail: {
                        itemId: itemId,
                        item: selectedItem
                    }
                })
            );
        }
    }

    handleToggleMenu(event) {
        const itemId = event.currentTarget.dataset.id;
        const allDropdowns =
            this.template.querySelectorAll('.dropdown-content');

        allDropdowns.forEach((dropdown) => {
            if (
                dropdown.dataset.id !== itemId ||
                (dropdown.dataset.id === itemId &&
                    dropdown.classList.contains('show'))
            ) {
                dropdown.classList.remove('show');
            }
        });

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

        event.stopPropagation();
    }

    handleEdit(event) {
        const itemId = event.currentTarget.dataset.id;
        const selectedItem = this.hazards.find((item) => item.id === itemId);

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

        this.closeDropdown(itemId);
    }

    handleDelete(event) {
        const itemId = event.currentTarget.dataset.id;
        this.dispatchEvent(
            new CustomEvent('delete', {
                detail: {
                    itemId: itemId
                }
            })
        );
        this.closeDropdown(itemId);
    }

    closeDropdown(itemId) {
        const dropdown = this.template.querySelector(
            `.dropdown-content[data-id="${itemId}"]`
        );
        if (dropdown) {
            dropdown.classList.remove('show');
            this.activeDropdown = null;
        }
    }

    async fetchHazardsFromSalesforce() {
        if (isOnline()) {
            console.log('🌐 Online: Fetching hazards from Salesforce');
            console.log('Using Object API Name:', this.objectApiName);
            this.isLoading = true;
            this.error = null;

            try {
                // Get JSForce connection from window object
                const jsforce = window.jsforce;
                if (!jsforce) {
                    throw new Error('JSForce library not loaded');
                }

                // Get session storage data
                const accessToken = sessionStorage.getItem('sf_access_token');
                const instanceUrl = sessionStorage.getItem('sf_instance_url');

                if (!accessToken || !instanceUrl) {
                    throw new Error('Not authenticated. Please login first.');
                }

                // Create connection
                const conn = new jsforce.Connection({
                    accessToken: accessToken,
                    instanceUrl: instanceUrl
                });

                // Dynamic query using the object API name from URL
                const query = `SELECT Id,Name,Rhythm__Title__c,Rhythm__Description__c,Rhythm__Date_Reported__c FROM ${this.objectApiName}`;
                console.log('Executing query:', query);

                const result = await conn.query(query);

                console.log('✅ Fetched hazards:', result);
                this.hazards = this.transformHazardData(result.records);

                this.dispatchEvent(
                    new CustomEvent('dataloaded', {
                        detail: {
                            items: this.hazards
                        }
                    })
                );
            } catch (error) {
                console.error('❌ Error fetching hazards:', error);
                this.error = error.message;
                this.loadFallbackData();
            } finally {
                this.isLoading = false;
            }
        } else {
            console.log('📴 Offline: Using cached or sample data');
            this.error = 'You are currently offline. Showing cached data.';
            this.loadFallbackData();
        }
    }

    transformHazardData(records) {
        return records.map((hazard) => {
            return {
                id: hazard.Id,
                name: hazard.Name,
                title: hazard.Rhythm__Title__c || hazard.Name,
                description:
                    hazard.Rhythm__Description__c || 'No description available',
                dateReported: hazard.Rhythm__Date_Reported__c,
                formattedDateReported: this.formatDate(
                    hazard.Rhythm__Date_Reported__c
                ),
                status: 'Active', // Default status since not in query
                statusClass: 'status-completed'
            };
        });
    }

    loadFallbackData() {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        const fallbackItems = [
            {
                id: 'hazard1',
                name: 'Electrical Hazard',
                title: 'Exposed Wiring in Production Area',
                description:
                    'Electrical wiring exposed in the main production floor',
                dateReported: yesterday.toISOString(),
                formattedDateReported: this.formatDate(yesterday.toISOString()),
                status: 'Active',
                statusClass: 'status-completed'
            },
            {
                id: 'hazard2',
                name: 'Chemical Spill Risk',
                title: 'Chemical Storage Safety Issue',
                description:
                    'Improper storage of hazardous chemicals in warehouse',
                dateReported: now.toISOString(),
                formattedDateReported: this.formatDate(now.toISOString()),
                status: 'Active',
                statusClass: 'status-completed'
            }
        ];

        this.hazards = fallbackItems;
        this.isLoading = false;
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
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

    disconnectedCallback() {
        document.removeEventListener('click', this.documentClickListener);
    }

    handleDocumentClick() {
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
}
