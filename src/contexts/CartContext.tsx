import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';

export interface CartItem {
  id: string;
  cartItemId?: number; // Database ID for backend operations
  title: string;
  titleEn: string;
  image: string;
  formats: {
    book: boolean;
    audiobook: boolean;
    digital: boolean;
  };
  price: number;
  quantity: number;
  personalization?: {
    childName: string;
    childAge: string;
    hobbies?: string;
    favoriteFood?: string;
    interestingFact?: string;
    character?: {
      gender: 'boy' | 'girl';
      skinTone: string;
      hairColor: string;
      hairStyle: string;
      eyeColor: string;
      hasGlasses: boolean;
    };
    allCharacters?: Array<{
      name: string;
      features: {
        gender: 'boy' | 'girl';
        skinTone: string;
        hairColor: string;
        hairStyle: string;
        eyeColor: string;
        hasGlasses: boolean;
      };
    }>;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  syncCartWithBackend: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  discount: number;
  discountPercentage: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'sterren_verhalen_cart';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Helper to convert backend item to frontend format
const backendToFrontend = (item: any): CartItem => ({
  id: item.product_id,
  cartItemId: item.id,
  title: item.product_name,
  titleEn: item.product_name_en || item.product_name,
  image: item.image || '',
  formats: {
    book: !!item.formats_book,
    audiobook: !!item.formats_audiobook,
    digital: !!item.formats_digital,
  },
  price: item.price,
  quantity: item.quantity,
  personalization: item.personalization_data ? JSON.parse(item.personalization_data) : undefined,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const itemsRef = useRef<CartItem[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Get current user token
  const getToken = useCallback(() => {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }, []);

  // Load cart from backend
  const loadCartFromBackend = useCallback(async (token: string): Promise<CartItem[]> => {
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        return (data.items || []).map(backendToFrontend);
      }
    } catch (error) {
      console.error('Error loading cart from backend:', error);
    }
    return [];
  }, []);

  // Save items to backend
  const saveItemToBackend = useCallback(async (token: string, item: CartItem) => {
    try {
      await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: item.id,
          product_name: item.title,
          product_name_en: item.titleEn,
          image: item.image,
          formats: item.formats,
          price: item.price,
          quantity: item.quantity,
          personalization: item.personalization,
        }),
      });
    } catch (error) {
      console.error('Error saving item to backend:', error);
    }
  }, []);

  // Delete item from backend
  const deleteItemFromBackend = useCallback(async (token: string, cartItemId: number) => {
    try {
      await fetch(`${API_URL}/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error deleting item from backend:', error);
    }
  }, []);

  // Update item quantity in backend
  const updateItemInBackend = useCallback(async (token: string, cartItemId: number, quantity: number) => {
    try {
      await fetch(`${API_URL}/api/cart/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });
    } catch (error) {
      console.error('Error updating item in backend:', error);
    }
  }, []);

  // Sync cart with backend (called after login)
  const syncCartWithBackend = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const localItems = itemsRef.current;
    console.log('Syncing cart with backend, local items:', localItems.length);

    try {
      // Get backend cart
      const backendItems = await loadCartFromBackend(token);
      console.log('Backend items:', backendItems.length);

      // If we have local items, sync them to backend first
      if (localItems.length > 0) {
        console.log('Syncing local items to backend...');
        await fetch(`${API_URL}/api/cart/sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ items: localItems }),
        });
        
        // Load merged cart
        const mergedItems = await loadCartFromBackend(token);
        console.log('Merged items:', mergedItems.length);
        setItems(mergedItems);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(mergedItems));
      } else {
        // No local items, use backend cart
        console.log('No local items, using backend cart');
        setItems(backendItems);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(backendItems));
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  }, [getToken, loadCartFromBackend]);

  // Initialize cart on mount
  useEffect(() => {
    const initCart = async () => {
      // Load from localStorage first
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          setItems(parsed);
          itemsRef.current = parsed;
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }

      // If logged in, sync with backend
      const token = getToken();
      if (token) {
        await syncCartWithBackend();
      }
      
      setIsInitialized(true);
    };

    initCart();
  }, []);

  // Listen for login event
  useEffect(() => {
    const handleLogin = async () => {
      console.log('Login detected, syncing cart...');
      await syncCartWithBackend();
    };

    window.addEventListener('user-logged-in', handleLogin);
    return () => window.removeEventListener('user-logged-in', handleLogin);
  }, [syncCartWithBackend]);

  // Save to localStorage whenever items change (after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
    const token = getToken();
    
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => 
          item.id === newItem.id && 
          item.formats.book === newItem.formats.book &&
          item.formats.audiobook === newItem.formats.audiobook &&
          item.formats.digital === newItem.formats.digital
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        
        // Update in backend
        if (token && updated[existingIndex].cartItemId) {
          updateItemInBackend(token, updated[existingIndex].cartItemId!, updated[existingIndex].quantity);
        }
        
        return updated;
      }
      
      const newCartItem: CartItem = { ...newItem, quantity: 1 };
      
      // Save to backend
      if (token) {
        saveItemToBackend(token, newCartItem);
      }
      
      return [...prev, newCartItem];
    });
  }, [getToken, saveItemToBackend, updateItemInBackend]);

  const removeItem = useCallback((id: string) => {
    const token = getToken();
    
    setItems(prev => {
      const itemToRemove = prev.find(item => item.id === id);
      
      // Delete from backend
      if (token && itemToRemove?.cartItemId) {
        deleteItemFromBackend(token, itemToRemove.cartItemId);
      }
      
      return prev.filter(item => item.id !== id);
    });
  }, [getToken, deleteItemFromBackend]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    const token = getToken();
    
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      
      // Update in backend
      if (token && item?.cartItemId) {
        updateItemInBackend(token, item.cartItemId, quantity);
      }
      
      return prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      );
    });
  }, [getToken, updateItemInBackend, removeItem]);

  const clearCart = useCallback(async () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    
    const token = getToken();
    if (token) {
      try {
        await fetch(`${API_URL}/api/cart`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch (error) {
        console.error('Error clearing backend cart:', error);
      }
    }
  }, [getToken]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate discount: 2 books = 10%, 3+ books = 20%
  const discountPercentage = totalItems >= 3 ? 20 : totalItems >= 2 ? 10 : 0;
  const discount = subtotal * (discountPercentage / 100);
  const totalPrice = subtotal - discount;

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      syncCartWithBackend,
      totalItems,
      totalPrice,
      subtotal,
      discount,
      discountPercentage,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
