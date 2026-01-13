'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export function useMenu() {
    const [menus, setMenus] = useState([]);
    const [currentMenu, setCurrentMenu] = useState(null);
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { user } = useAuth();
    const supabase = getSupabaseClient();

    // Fetch user's menus
    const fetchMenus = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('menus')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMenus(data || []);
        } catch (err) {
            console.error('Error fetching menus (Detailed):', {
                message: err.message,
                details: err.details,
                hint: err.hint,
                code: err.code,
                error: err
            });
        } finally {
            setLoading(false);
        }
    }, [user, supabase]);

    // Create new menu
    const createMenu = async (name, templateId = 'classic') => {
        if (!user) return { error: 'Not authenticated' };

        setSaving(true);
        try {
            const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

            const { data, error } = await supabase
                .from('menus')
                .insert({
                    user_id: user.id,
                    name,
                    template_id: templateId,
                    slug,
                    currency: 'IQD',
                })
                .select()
                .single();

            if (error) throw error;
            await fetchMenus();
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    // Fetch single menu with categories and items
    const fetchMenu = useCallback(async (id) => {
        try {
            const { data: menu, error: menuError } = await supabase
                .from('menus')
                .select('*')
                .eq('id', id)
                .single();

            if (menuError) throw menuError;
            setCurrentMenu(menu);

            // Fetch categories
            const { data: cats, error: catsError } = await supabase
                .from('menu_categories')
                .select('*')
                .eq('menu_id', id)
                .order('sort_order');

            if (!catsError) setCategories(cats || []);

            // Fetch items
            const { data: its, error: itsError } = await supabase
                .from('menu_items')
                .select('*')
                .eq('menu_id', id)
                .order('sort_order');

            if (!itsError) setItems(its || []);

            return menu;
        } catch (err) {
            console.error('Error fetching menu (Detailed):', {
                message: err.message,
                details: err.details,
                hint: err.hint,
                code: err.code,
                error: err
            });
            return null;
        }
    }, [supabase]);

    // Update menu
    const updateMenu = useCallback(async (id, updates) => {
        setSaving(true);
        console.log('🛠️ useMenu: updateMenu starting...', { id, updates });
        try {
            const { data, error } = await supabase
                .from('menus')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('❌ useMenu: updateMenu Supabase Error:', error);
                throw error;
            }
            console.log('✅ useMenu: updateMenu saved successfully:', data);
            setCurrentMenu(data);
            return { data, error: null };
        } catch (err) {
            console.error('💥 useMenu: updateMenu Exception:', err);
            return { data: null, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [supabase]);

    // Delete menu and clean up R2 images
    const deleteMenu = useCallback(async (id) => {
        try {
            // Collect all image URLs to delete
            const imagesToDelete = [];

            // Get menu logo and hero image
            const { data: menuData } = await supabase
                .from('menus')
                .select('logo_url, theme')
                .eq('id', id)
                .single();

            if (menuData?.logo_url?.includes('r2.dev')) {
                imagesToDelete.push(menuData.logo_url);
            }
            if (menuData?.theme?.hero_image?.includes('r2.dev')) {
                imagesToDelete.push(menuData.theme.hero_image);
            }

            // Get category images
            const { data: cats } = await supabase
                .from('menu_categories')
                .select('image_url')
                .eq('menu_id', id);

            cats?.forEach(cat => {
                if (cat.image_url?.includes('r2.dev')) {
                    imagesToDelete.push(cat.image_url);
                }
            });

            // Get item images
            const { data: its } = await supabase
                .from('menu_items')
                .select('image_url')
                .eq('menu_id', id);

            its?.forEach(item => {
                if (item.image_url?.includes('r2.dev')) {
                    imagesToDelete.push(item.image_url);
                }
            });

            // Delete all images from R2
            for (const url of imagesToDelete) {
                try {
                    await fetch('/api/upload/delete', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url }),
                    });
                } catch (e) {
                    console.error('Failed to delete R2 image:', url, e);
                }
            }

            // Now delete the menu (cascades to categories and items)
            const { error } = await supabase
                .from('menus')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchMenus();
            return { error: null };
        } catch (err) {
            return { error: err.message };
        }
    }, [supabase, fetchMenus]);


    // Add category
    const addCategory = useCallback(async (menuId, name, description = '') => {
        setSaving(true);
        try {
            const sortOrder = categories.length;
            const { data, error } = await supabase
                .from('menu_categories')
                .insert({
                    menu_id: menuId,
                    name,
                    description,
                    sort_order: sortOrder,
                })
                .select()
                .single();

            if (error) throw error;
            setCategories(prev => [...prev, data]);
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [supabase, categories.length]);

    // Update category
    const updateCategory = useCallback(async (id, updates) => {
        setSaving(true);
        try {
            const { data, error } = await supabase
                .from('menu_categories')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setCategories(prev => prev.map(c => c.id === id ? data : c));
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [supabase]);

    // Delete category
    const deleteCategory = useCallback(async (id) => {
        try {
            const { error } = await supabase
                .from('menu_categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setCategories(prev => prev.filter(c => c.id !== id));
            setItems(prev => prev.filter(i => i.category_id !== id));
            return { error: null };
        } catch (err) {
            return { error: err.message };
        }
    }, [supabase]);

    // Add item
    const addItem = useCallback(async (menuId, categoryId, itemData) => {
        setSaving(true);
        try {
            const categoryItems = items.filter(i => i.category_id === categoryId);
            const sortOrder = categoryItems.length;

            const { data, error } = await supabase
                .from('menu_items')
                .insert({
                    menu_id: menuId,
                    category_id: categoryId,
                    ...itemData,
                    sort_order: sortOrder,
                })
                .select()
                .single();

            if (error) throw error;
            setItems(prev => [...prev, data]);
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [supabase, items]);

    // Update item
    const updateItem = useCallback(async (id, updates) => {
        setSaving(true);
        try {
            const { data, error } = await supabase
                .from('menu_items')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setItems(prev => prev.map(i => i.id === id ? data : i));
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        } finally {
            setSaving(false);
        }
    }, [supabase]);

    // Delete item
    const deleteItem = useCallback(async (id) => {
        try {
            const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setItems(prev => prev.filter(i => i.id !== id));
            return { error: null };
        } catch (err) {
            return { error: err.message };
        }
    }, [supabase]);

    useEffect(() => {
        fetchMenus();
    }, [fetchMenus]);

    return {
        menus,
        currentMenu,
        categories,
        items,
        loading,
        saving,
        fetchMenus,
        fetchMenu,
        createMenu,
        updateMenu,
        deleteMenu,
        addCategory,
        updateCategory,
        deleteCategory,
        addItem,
        updateItem,
        deleteItem,
        setCurrentMenu,
    };
}

export default useMenu;
