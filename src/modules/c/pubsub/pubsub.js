const callbacks = {};

const pubsub = {
    subscribe(eventName, callback) {
        if (!callbacks[eventName]) {
            callbacks[eventName] = [];
        }
        callbacks[eventName].push(callback);
    },

    publish(eventName, payload) {
        if (callbacks[eventName]) {
            callbacks[eventName].forEach((callback) => {
                try {
                    callback(payload);
                } catch (error) {
                    console.error('PubSub callback error:', error);
                }
            });
        }
    },

    unsubscribe(eventName, callback) {
        if (callbacks[eventName]) {
            callbacks[eventName] = callbacks[eventName].filter(
                (cb) => cb !== callback
            );
        }
    }
};

export default pubsub;
