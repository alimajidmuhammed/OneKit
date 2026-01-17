'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { SERVICES } from '@/lib/utils/constants';

/**
 * Hook to fetch services from database and merge with code constants.
 * Database provides: pricing, active status
 * Constants provide: features, icons, paths, descriptions
 */
export function useServices() {
    const [services, setServices] = useState(SERVICES);
    const [loading, setLoading] = useState(true);
    const supabase = getSupabaseClient();
    const isMounted = useRef(true);

    const fetchServices = useCallback(async () => {
        try {
            const { data: dbServices, error } = await supabase
                .from('services')
                .select('*')
                .eq('is_active', true);

            if (!isMounted.current) return;

            if (error) {
                console.warn('Could not fetch services from database, using defaults');
                setServices(SERVICES);
                return;
            }

            // Merge database services with code constants
            // Only include services that exist in our code constants
            const mergedServices = SERVICES.map(constService => {
                const dbService = dbServices?.find(db => db.slug === constService.slug);

                if (dbService) {
                    return {
                        ...constService,
                        name: dbService.name || constService.name,
                        description: dbService.description || constService.description,
                        is_active: dbService.is_active,
                        dbId: dbService.id,
                    };
                }

                // If not in DB, it might be a new or free service only in constants
                return constService;
            }).filter(service => service.is_active !== false);

            if (isMounted.current) {
                setServices(mergedServices);
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.warn('Error fetching services:', err);
            if (isMounted.current) {
                setServices(SERVICES);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [supabase]);

    useEffect(() => {
        isMounted.current = true;
        fetchServices();

        return () => {
            isMounted.current = false;
        };
    }, [fetchServices]);

    return {
        services,
        loading,
        refetch: fetchServices,
    };
}

export default useServices;
