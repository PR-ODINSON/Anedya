import axios from 'axios';
import axiosRetry from 'axios-retry';

// Singleton service for Anedya API integration
class AnedyaService {
    constructor() {
        this.apiKey = process.env.ANEDYA_API_KEY;
        this.region = process.env.ANEDYA_REGION || 'ap-in-1';
        this.baseURL = `https://api.${this.region}.anedya.io/v1`;
        
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Add retry logic for failing requests
        axiosRetry(this.client, { 
            retries: 3, 
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: (error) => {
                // Retry on network errors or 5xx server errors
                return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response && error.response.status >= 500);
            }
        });

        // Setup request interceptor to inject API key dynamically if env changes
        this.client.interceptors.request.use((config) => {
            config.headers['Authorization'] = `Bearer ${process.env.ANEDYA_API_KEY}`;
            return config;
        });
    }

    async getDeviceData(nodeId, variableIdentifier, fromTime, toTime) {
        try {
            // Placeholder: Adjust to actual Anedya API spec
            const response = await this.client.post('/data/get', {
                nodeId,
                variableIdentifier,
                from: fromTime,
                to: toTime
            });
            return response.data;
        } catch (error) {
            console.error('Anedya Service Error (getDeviceData):', error.message);
            throw new Error('Failed to fetch telemetry from Anedya Cloud');
        }
    }

    async sendCommand(nodeId, commandId, payload) {
        try {
            // Placeholder: Adjust to actual Anedya API spec
            const response = await this.client.post('/commands/send', {
                nodeId,
                commandId,
                data: payload
            });
            return response.data;
        } catch (error) {
            console.error('Anedya Service Error (sendCommand):', error.message);
            throw new Error('Failed to send command to Anedya Cloud');
        }
    }
}

export default new AnedyaService();
