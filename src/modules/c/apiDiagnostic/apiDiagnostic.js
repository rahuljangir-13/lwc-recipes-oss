/**
 * Simple diagnostic utility to test API connections
 */
import { LightningElement } from 'lwc';
export default class ApiDiagnostic extends LightningElement {
    url =
        'https://customization-app-1405-dev-ed.scratch.my.salesforce.com/services/data/v57.0/limits';
    accessToken = '';
    result = '';
    error = '';

    handleUrlChange(event) {
        this.url = event.target.value;
    }

    handleTokenChange(event) {
        this.accessToken = event.target.value;
    }

    async handleTest() {
        try {
            this.result = '';
            this.error = '';

            const response = await fetch(this.url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            this.result = JSON.stringify(data, null, 2);
        } catch (err) {
            this.error = `Error: ${err.message}`;
            console.error('API test error:', err);
        }
    }
}
