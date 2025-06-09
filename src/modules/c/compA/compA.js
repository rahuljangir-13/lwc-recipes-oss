import { LightningElement } from 'lwc';
import pubsub from 'c/pubsub';

export default class CompA extends LightningElement {
    handleSendMessage() {
        const message = {
            from: 'Component A',
            data: 'Hello Component C! This message is directly from Component A.',
            timestamp: new Date().toLocaleString()
        };

        // Publish the message to both Component C and Account Manager
        pubsub.publish('compAMessage', message);

        const accountData = {
            type: 'account_update',
            data: `Message from Component A: ${message.data} (Sent at: ${message.timestamp})`
        };
        pubsub.publish('accountUpdate', accountData);
    }
}
