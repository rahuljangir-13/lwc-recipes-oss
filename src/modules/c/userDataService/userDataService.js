import pubsub from 'c/pubsub';

const STORAGE_KEY = 'globalUserData';
const USER_DATA_CHANNEL = 'userDataUpdate';

class UserDataService {
    async fetchUserById(userId) {
        try {
            const response = await fetch(
                `https://dummyjson.com/users/${userId}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const userData = await response.json();

            // Store in localStorage
            this.storeUserData(userData);

            // Publish the data for other components
            pubsub.publish(USER_DATA_CHANNEL, {
                type: 'update',
                data: userData
            });

            return userData;
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    storeUserData(userData) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        } catch (error) {
            console.error('Error storing user data:', error);
        }
    }

    getStoredUserData() {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            return storedData ? JSON.parse(storedData) : null;
        } catch (error) {
            console.error('Error retrieving stored user data:', error);
            return null;
        }
    }

    clearUserData() {
        localStorage.removeItem(STORAGE_KEY);
        pubsub.publish(USER_DATA_CHANNEL, { type: 'clear' });
    }
}

// Export a singleton instance
export default new UserDataService();
