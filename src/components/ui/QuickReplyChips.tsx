import { motion } from 'framer-motion';
import type { QuickReply } from '../../types';

interface QuickReplyChipsProps {
    options: QuickReply[];
    onSelect: (option: QuickReply) => void;
    className?: string;
}

export function QuickReplyChips({ options, onSelect, className = '' }: QuickReplyChipsProps) {
    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {options.map((option, index) => (
                <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(option)}
                    className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 
                     border border-slate-700 hover:border-purple-500/50
                     text-sm text-slate-200 font-medium
                     transition-colors duration-200
                     shadow-sm hover:shadow-md"
                >
                    {option.label}
                </motion.button>
            ))}
        </div>
    );
}
