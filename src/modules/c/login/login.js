import { LightningElement, track } from 'lwc';
// import { salesforceService } from 'c/salesforceService';

export default class Login extends LightningElement {
    @track username = '';
    @track password = '';
    @track errorMessage = '';
    @track isLoading = false;
    @track isLoggedIn = false;
    @track accountsData = [];

    // Salesforce instance URL for your scratch org
    loginUrl = 'https://dream-innovation-22-dev-ed.scratch.my.salesforce.com';

    // Local proxy server URL - in production, this would be your deployed proxy server
    proxyUrl = 'https://js-force-proxy-server.vercel.app/proxy';

    connectedCallback() {
        // Check if already logged in
        // this.isLoggedIn = salesforceService.isLoggedIn();
        this.isLoggedIn = false;
    }

    handleUsernameChange(event) {
        this.username = event.target.value;
        if (this.errorMessage) {
            this.errorMessage = ''; // Clear any previous errors
        }
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
        if (this.errorMessage) {
            this.errorMessage = ''; // Clear any previous errors
        }
    }

    async handleLogin() {
        if (!this.username || !this.password) {
            this.errorMessage = 'Please enter both username and password';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        try {
            // Access JSForce through the window object
            const jsforce = window.jsforce;
            if (!jsforce) {
                throw new Error(
                    'JSForce library not loaded. Please check your internet connection and try again.'
                );
            }

            // Configure the connection to use our local AJAX proxy
            // jsforce.browser.init({
            //     loginUrl: this.loginUrl,
            //     proxyUrl: this.proxyUrl
            // });

            // Create connection through the browser object which handles CORS
            const conn = new jsforce.Connection({
                loginUrl: this.loginUrl,
                proxyUrl: this.proxyUrl,
                version: '60.0'
            });

            // Login with username and password
            const userInfo = await conn.login(this.username, this.password);

            console.log('Login successful:', userInfo);
            console.log('Login successful connection:', conn);
            // this.isLoggedIn = true;

            // Store authentication info in session storage
            sessionStorage.setItem('sf_access_token', conn.accessToken);
            sessionStorage.setItem('sf_instance_url', conn.instanceUrl);
            sessionStorage.setItem('sf_user_id', userInfo.id);
            const res = await conn.query(
                'SELECT Id,Rhythm__Field_Api_Name__c FROM Rhythm__Field_Level_Configuration__mdt'
            );
            console.log(`total: ${JSON.stringify(res)}`);
            this.metaData = res.records;
            console.log('accountsData', JSON.stringify(this.mataData));
            if (this.accountsData.length > 0) {
                this.isLoggedIn = true;
            }
            // Dispatch a success event
            this.dispatchEvent(
                new CustomEvent('login', {
                    detail: {
                        userId: userInfo.id,
                        orgId: userInfo.organizationId,
                        success: true
                    }
                })
            );

            // Update login status
            this.isLoggedIn = true;
        } catch (error) {
            console.error('Login error:', error);

            // Show an appropriate error message
            if (
                error.message.includes('invalid_grant') ||
                error.message.includes('authentication failure')
            ) {
                this.errorMessage =
                    'Invalid username or password. Please try again.';
            } else if (
                error.message.includes('CORS') ||
                error.message.includes('NetworkError')
            ) {
                this.errorMessage =
                    'CORS error: Cannot connect to Salesforce. Please ensure the proxy server is running with "npm run proxy-server".';
            } else {
                this.errorMessage =
                    error.message || 'Login failed. Please try again.';
            }
        } finally {
            this.isLoading = false;
        }
    }

    // Cleanup method
    disconnectedCallback() {
        // Clear sensitive data
        this.username = '';
        this.password = '';
    }
}
