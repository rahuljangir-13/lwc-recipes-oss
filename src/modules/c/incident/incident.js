import { LightningElement, track, api } from 'lwc';
import { isOnline } from 'c/utils';

export default class Incident extends LightningElement {
    @api objectApiName = 'Rhythm__Incident__c'; // Default fallback
    @track incidents = [];
    @track isLoading = true;
    @track error = null;
    @track visibleItemCount = 2;
    @track activeDropdown = null;

    connectedCallback() {
        console.log(
            'Incident component - Object API Name:',
            this.objectApiName
        );
        this.fetchIncidentsFromSalesforce();
        this.documentClickListener = this.handleDocumentClick.bind(this);
        document.addEventListener('click', this.documentClickListener);
    }

    get visibleItems() {
        return this.incidents.slice(0, this.visibleItemCount);
    }

    get hasItems() {
        return this.incidents.length > 0;
    }

    get noData() {
        return !this.hasItems && !this.isLoading;
    }

    get showViewMoreButton() {
        return this.incidents.length > this.visibleItemCount;
    }

    handleViewMore() {
        this.visibleItemCount = this.incidents.length;
    }

    handleIncidentClick(event) {
        const itemId = event.currentTarget.dataset.id;
        const selectedItem = this.incidents.find((item) => item.id === itemId);

        if (selectedItem) {
            console.log('Incident item clicked:', selectedItem);
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
        const selectedItem = this.incidents.find((item) => item.id === itemId);

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

    async fetchIncidentsFromSalesforce() {
        if (isOnline()) {
            console.log('🌐 Online: Fetching incidents from Salesforce');
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
                const query = `SELECT Id,Name,Rhythm__Brief_Description__c,Rhythm__Incident_Title__c,Rhythm__Date_Of_Incident__c,Rhythm__Date_Reported__c FROM ${this.objectApiName}`;
                console.log('Executing query:', query);

                const result = await conn.query(query);

                console.log('✅ Fetched incidents:', result);
                this.incidents = this.transformIncidentData(result.records);

                this.dispatchEvent(
                    new CustomEvent('dataloaded', {
                        detail: {
                            items: this.incidents
                        }
                    })
                );
            } catch (error) {
                console.error('❌ Error fetching incidents:', error);
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

    transformIncidentData(records) {
        return records.map((incident) => {
            return {
                id: incident.Id,
                name: incident.Name,
                title: incident.Rhythm__Incident_Title__c || incident.Name,
                description:
                    incident.Rhythm__Brief_Description__c ||
                    'No description available',
                dateOfIncident: incident.Rhythm__Date_Of_Incident__c,
                dateReported: incident.Rhythm__Date_Reported__c,
                formattedDateOfIncident: this.formatDate(
                    incident.Rhythm__Date_Of_Incident__c
                ),
                formattedDateReported: this.formatDate(
                    incident.Rhythm__Date_Reported__c
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
                id: 'incident1',
                name: 'Workplace Injury',
                title: 'Slip and Fall Incident',
                description: 'Employee slipped on wet floor in cafeteria area',
                dateOfIncident: yesterday.toISOString(),
                dateReported: now.toISOString(),
                formattedDateOfIncident: this.formatDate(
                    yesterday.toISOString()
                ),
                formattedDateReported: this.formatDate(now.toISOString()),
                status: 'Active',
                statusClass: 'status-completed'
            },
            {
                id: 'incident2',
                name: 'Equipment Failure',
                title: 'Machine Malfunction',
                description:
                    'Production line machine stopped working unexpectedly',
                dateOfIncident: now.toISOString(),
                dateReported: now.toISOString(),
                formattedDateOfIncident: this.formatDate(now.toISOString()),
                formattedDateReported: this.formatDate(now.toISOString()),
                status: 'Active',
                statusClass: 'status-completed'
            }
        ];

        this.incidents = fallbackItems;
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
