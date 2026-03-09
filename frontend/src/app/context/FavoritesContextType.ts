import { createContext } from 'react';

export interface FavoritesContextType {
    favorites: string[];
    toggleFavorite: (messId: string) => Promise<boolean>;
    isFavorite: (messId: string | undefined) => boolean;
    loading: boolean;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);
