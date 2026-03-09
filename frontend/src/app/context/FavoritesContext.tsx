import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import type { Mess } from '../types/mess';
import { useAppSelector } from '../../hooks/redux';
import type { RootState } from '../../store';

import { FavoritesContext } from './FavoritesContextType';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const { token, user } = useAppSelector((state: RootState) => state.auth);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!token || !user) { // Check for user as well
                setFavorites([]);
                return;
            }
            setLoading(true);
            try {
                const response = await api.get('/favorites');
                if (response.data.success) {
                    const ids = response.data.data.map((m: Mess) => String(m.id)); // Use Mess type
                    setFavorites(ids);
                }
            } catch (error) {
                console.error('Error fetching favorites:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [token, user]);

    const toggleFavorite = async (messId: string) => {
        const id = String(messId);

        if (!token) {
            alert('Please login to favorite messes!');
            window.location.href = '/login';
            return false;
        }

        // Optimistic update
        const wasFavorite = favorites.includes(id);
        if (wasFavorite) {
            setFavorites(prev => prev.filter(fid => fid !== id));
        } else {
            setFavorites(prev => [...prev, id]);
        }

        try {
            const response = await api.post(`/favorites/toggle/${id}`);
            if (response.data.success) {
                // Keep the sync with server just in case
                if (response.data.isFavorite) {
                    setFavorites(prev => prev.includes(id) ? prev : [...prev, id]);
                } else {
                    setFavorites(prev => prev.filter(fid => fid !== id));
                }
                return response.data.isFavorite;
            }
        } catch (error) {
            // Revert on error
            if (wasFavorite) {
                setFavorites(prev => prev.includes(id) ? prev : [...prev, id]);
            } else {
                setFavorites(prev => prev.filter(fid => fid !== id));
            }
            console.error('Error toggling favorite:', error);
            alert('Could not update favorite. Please check your connection.');
        }
        return false;
    };

    const isFavorite = (messId: string | undefined) => {
        if (!messId) return false;
        return favorites.includes(String(messId));
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
            {children}
        </FavoritesContext.Provider>
    );
}

