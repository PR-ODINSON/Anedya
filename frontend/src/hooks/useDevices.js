import useSWR from 'swr';
import api from '../services/api';

const fetcher = url => api.get(url).then(res => res.data);

export function useDevices() {
    const { data, error, isLoading, mutate } = useSWR('/devices', fetcher, {
        refreshInterval: 10000, // Poll every 10 seconds
        revalidateOnFocus: true,
        shouldRetryOnError: true,
        errorRetryCount: 3
    });

    return {
        devices: data,
        isLoading,
        isError: error,
        mutate
    };
}
