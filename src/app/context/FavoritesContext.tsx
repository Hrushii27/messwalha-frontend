import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useAppSelector } from '../../hooks/redux';

interface FavoritesContextType {
    favorites: string[];
    toggleFavorite: (messId: string) => Promise<boolean>;
    isFavorite: (messId: string) => boolean;
    loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAppSelector((state) => (state as any).auth);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!token) {
                setFavorites([]);
                return;
            }
            setLoading(true);
            try {
                const response = await api.get('/favorites');
                if (response.data.success) {
                    const ids = response.data.data.map((m: any) => String(m.id));
                    setFavorites(ids);
                }
            } catch (error) {
                console.error('Error fetching favorites:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [token]);

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
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
