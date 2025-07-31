import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class CpLeftMenu extends NavigationMixin(LightningElement) {
    @track selected = 'incident';
    @track isMobileMenuOpen = false;

    get incidentClass() {
        return `menu-item ${this.selected === 'incident' ? 'active' : ''}`;
    }

    get hazardClass() {
        return `menu-item ${this.selected === 'hazard' ? 'active' : ''}`;
    }

    get logoutClass() {
        return 'menu-item logout-item';
    }

    get sidebarClass() {
        const baseClass = 'sidebar';
        const mobileClass = this.isMobileMenuOpen ? 'mobile-open' : '';
        const fullClass = mobileClass
            ? `${baseClass} ${mobileClass}`
            : baseClass;
        console.log('Sidebar class:', fullClass);
        return fullClass;
    }

    handleMenuClick(event) {
        const selectedId = event.currentTarget.dataset.id;

        if (selectedId === 'logout') {
            this.handleLogout();
            return;
        }

        this.selected = selectedId;

        // Close mobile menu after selection
        this.isMobileMenuOpen = false;

        // Dispatch custom event to notify parent
        this.dispatchEvent(
            new CustomEvent('menuchange', {
                detail: {
                    selectedId: selectedId,
                    selectedItem: selectedId
                }
            })
        );

        // Navigate to named page with state parameter
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Home' // Replace with actual page name if different
            },
            state: {
                navigate: selectedId // this will be picked up in cpContent.js
            }
        });
    }

    handleMobileToggle(event) {
        console.log('Mobile toggle clicked!');
        event.preventDefault();
        event.stopPropagation();

        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        console.log('Mobile menu toggled:', this.isMobileMenuOpen);

        // Force re-render
        this.template.host.style.setProperty(
            '--mobile-open',
            this.isMobileMenuOpen ? '1' : '0'
        );

        // Debug: Check if sidebar exists and classes are applied
        const sidebar = this.template.querySelector('.sidebar');
        const toggle = this.template.querySelector('.mobile-menu-toggle');
        console.log('Sidebar element:', sidebar);
        console.log('Toggle element:', toggle);
        if (sidebar) {
            console.log('Sidebar classes:', sidebar.className);
        }
    }

    handleLogout() {
        // Clear session storage
        sessionStorage.removeItem('sf_access_token');
        sessionStorage.removeItem('sf_instance_url');
        sessionStorage.removeItem('sf_user_id');

        // Close mobile menu
        this.isMobileMenuOpen = false;

        // Dispatch logout event
        this.dispatchEvent(new CustomEvent('logout'));
    }

    // Close mobile menu when clicking outside
    connectedCallback() {
        this.documentClickListener = this.handleDocumentClick.bind(this);
        document.addEventListener('click', this.documentClickListener);

        console.log('LeftMenu component connected');
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.documentClickListener);
    }

    handleDocumentClick(event) {
        // Close mobile menu if clicking outside
        if (this.isMobileMenuOpen) {
            const sidebar = this.template.querySelector('.sidebar');
            const toggle = this.template.querySelector('.mobile-menu-toggle');

            if (
                sidebar &&
                toggle &&
                !sidebar.contains(event.target) &&
                !toggle.contains(event.target)
            ) {
                console.log('Clicking outside, closing mobile menu');
                this.isMobileMenuOpen = false;
            }
        }
    }
}
