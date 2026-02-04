import { motion } from 'framer-motion';
import { Home, Send, User } from 'lucide-react';

type NavItem = 'home' | 'chat' | 'profile';

interface BottomNavProps {
    activeItem: NavItem;
    onNavigate: (item: NavItem) => void;
    className?: string;
}

export function BottomNav({ activeItem, onNavigate, className = '' }: BottomNavProps) {
    const navItems = [
        { id: 'home' as NavItem, icon: Home, label: 'Home' },
        { id: 'chat' as NavItem, icon: Send, label: 'Chat' },
        { id: 'profile' as NavItem, icon: User, label: 'Profile' },
    ];

    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-pb ${className}`}>
            <nav className="flex items-center justify-around h-16 max-w-lg mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;

                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            whileTap={{ scale: 0.9 }}
                            className={`relative flex flex-col items-center justify-center w-16 h-full
                         transition-colors ${isActive ? 'text-slate-900' : 'text-slate-400'}`}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />

                            {/* Active indicator line */}
                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-900 rounded-full"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </nav>
        </div>
    );
}
