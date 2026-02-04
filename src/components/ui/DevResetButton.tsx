import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

/**
 * Development-only reset button to clear all app state
 * Only visible in development mode (NODE_ENV === 'development')
 */
export function DevResetButton() {
    // Only show in development mode
    if (import.meta.env.PROD) {
        return null;
    }

    const handleReset = () => {
        // Confirm with the user
        if (!confirm('⚠️ DEV MODE: This will clear all localStorage, sessionStorage, and reload the page. Continue?')) {
            return;
        }

        console.log('[DevReset] Clearing all storage...');

        // Clear localStorage
        try {
            localStorage.clear();
            console.log('[DevReset] localStorage cleared');
        } catch (e) {
            console.error('[DevReset] Failed to clear localStorage:', e);
        }

        // Clear sessionStorage
        try {
            sessionStorage.clear();
            console.log('[DevReset] sessionStorage cleared');
        } catch (e) {
            console.error('[DevReset] Failed to clear sessionStorage:', e);
        }

        // Force reload
        console.log('[DevReset] Reloading page...');
        window.location.reload();
    };

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="fixed bottom-24 right-4 z-[100] px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-mono rounded-lg shadow-lg flex items-center gap-1.5 transition-colors border border-red-500"
            title="Clear all app state and reload (DEV only)"
        >
            <Trash2 className="w-3.5 h-3.5" />
            <span>DEV: Reset</span>
        </motion.button>
    );
}
