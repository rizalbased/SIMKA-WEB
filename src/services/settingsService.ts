import { supabase } from '../lib/supabase';
import { HeaderThemeConfig } from '../types';

export const DEFAULT_HEADER_THEME: HeaderThemeConfig = {
  preset: 'cyan',
  background: '#009FE3',
  text: '#FFFFFF',
  brand: '#FFFFFF',
  brandBg: '#003B5C',
  brandText: '#FFFFFF',
  date: '#FFFFFF',
  dateText: '#FFFFFF',
  clockBackground: '#06243A',
  clockBg: '#06243A',
  clockText: '#FFD166',
  accent: '#00D9FF',
  autoContrast: true
};

export const settingsService = {
  async getHeaderTheme(): Promise<HeaderThemeConfig> {
    try {
      const { data, error } = await supabase
        .from('display_settings')
        .select('*')
        .eq('id', 'header_theme')
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.code === 'PGRST205') {
          // Row not found or table not yet populated - return default
          return DEFAULT_HEADER_THEME;
        }
        console.warn('Error fetching header theme from display_settings:', error);
        return DEFAULT_HEADER_THEME;
      }

      if (data && data.config) {
        const c = data.config;
        return {
          preset: c.preset || 'cyan',
          background: c.background || '#009FE3',
          text: c.text || '#FFFFFF',
          brand: c.brand || c.brandText || '#FFFFFF',
          brandBg: c.brandBg || '#003B5C',
          brandText: c.brand || c.brandText || '#FFFFFF',
          date: c.date || c.dateText || '#FFFFFF',
          dateText: c.date || c.dateText || '#FFFFFF',
          clockBackground: c.clockBackground || c.clockBg || '#06243A',
          clockBg: c.clockBackground || c.clockBg || '#06243A',
          clockText: c.clockText || '#FFD166',
          accent: c.accent || '#00D9FF',
          autoContrast: c.autoContrast !== undefined ? c.autoContrast : true
        };
      }
      return DEFAULT_HEADER_THEME;
    } catch (err) {
      console.warn('Network error fetching header theme:', err);
      return DEFAULT_HEADER_THEME;
    }
  },

  async saveHeaderTheme(theme: HeaderThemeConfig) {
    const payload = {
      preset: theme.preset || 'cyan',
      background: theme.background || '#009FE3',
      text: theme.text || '#FFFFFF',
      brand: theme.brand || theme.brandText || '#FFFFFF',
      brandBg: theme.brandBg || '#003B5C',
      date: theme.date || theme.dateText || '#FFFFFF',
      clockBackground: theme.clockBackground || theme.clockBg || '#06243A',
      clockText: theme.clockText || '#FFD166',
      accent: theme.accent || '#00D9FF',
      autoContrast: theme.autoContrast !== undefined ? theme.autoContrast : true
    };

    const { data, error } = await supabase
      .from('display_settings')
      .upsert({
        id: 'header_theme',
        config: payload
      });

    if (error) {
      console.error('Error saving header theme to display_settings:', error);
      throw error;
    }
    return data;
  }
};
