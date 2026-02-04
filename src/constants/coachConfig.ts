/**
 * Shared Avatar and Personality Constants
 * Single source of truth for onboarding and edit screens
 */

import type { CoachPersonality } from '../types';

// ============================================
// AVATARS - "Ready Player One" Sci-Fi Style
// Using bottts-neutral for 3D robot aesthetic
// ============================================

export interface Avatar {
    id: string;
    name: string;
    avatarUrl: string;
    gradientFrom: string;
    gradientTo: string;
    glowColor: string;  // Holographic glow effect
    borderColor: string; // Neon border
}

export const AVATARS: Avatar[] = [
    {
        id: 'aura',
        name: 'Aura',
        avatarUrl: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=aura&backgroundColor=7c3aed',
        gradientFrom: 'from-violet-600',
        gradientTo: 'to-purple-700',
        glowColor: 'rgba(139, 92, 246, 0.6)',  // Violet glow
        borderColor: 'rgba(167, 139, 250, 0.8)'
    },
    {
        id: 'zenith',
        name: 'Zenith',
        avatarUrl: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=zenith&backgroundColor=d97706',
        gradientFrom: 'from-amber-500',
        gradientTo: 'to-orange-600',
        glowColor: 'rgba(251, 191, 36, 0.6)',  // Amber glow
        borderColor: 'rgba(252, 211, 77, 0.8)'
    },
    {
        id: 'echo',
        name: 'Echo',
        avatarUrl: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=echo&backgroundColor=0891b2',
        gradientFrom: 'from-cyan-500',
        gradientTo: 'to-teal-600',
        glowColor: 'rgba(6, 182, 212, 0.6)',   // Cyan glow
        borderColor: 'rgba(34, 211, 238, 0.8)'
    }
];

// ============================================
// PERSONALITIES - 5 Core Intelligence Modules
// ============================================

export interface PersonalityOption {
    id: CoachPersonality;
    name: string;
    title: string;
    description: string;
    traits: string[];
    gradientFrom: string;
    gradientTo: string;
    recommended?: boolean;
}

export const PERSONALITIES: PersonalityOption[] = [
    {
        id: 'creative',
        name: 'The Creative',
        title: 'Innovation Guide',
        description: 'Unconventional thinking. Uses metaphors, design thinking, and wildcard options.',
        traits: ['Imaginative', 'Unconventional', 'Inspiring'],
        gradientFrom: 'from-pink-500',
        gradientTo: 'to-rose-600'
    },
    {
        id: 'analyst',
        name: 'The Analyst',
        title: 'Data Master',
        description: 'Precise, data-driven insights. Presents pros/cons and percentages.',
        traits: ['Logical', 'Precise', 'Objective'],
        gradientFrom: 'from-blue-500',
        gradientTo: 'to-indigo-600'
    },
    {
        id: 'commander',
        name: 'The Commander',
        title: 'Action Leader',
        description: 'Direct and bold coaching. Pushes for action with short, decisive guidance.',
        traits: ['Direct', 'Bold', 'Results-focused'],
        gradientFrom: 'from-amber-500',
        gradientTo: 'to-orange-600'
    },
    {
        id: 'sage',
        name: 'The Sage',
        title: 'Wisdom Keeper',
        description: 'Calm and philosophical. Asks deep "Why" questions and considers long-term.',
        traits: ['Thoughtful', 'Patient', 'Reflective'],
        gradientFrom: 'from-emerald-500',
        gradientTo: 'to-teal-600'
    },
    {
        id: 'mix',
        name: 'The Mix',
        title: 'Adaptive Pathfinder',
        description: 'Switches between modes based on your needs. High EQ, reads the room.',
        traits: ['Adaptive', 'Versatile', 'Balanced'],
        gradientFrom: 'from-violet-500',
        gradientTo: 'to-purple-600',
        recommended: true
    }
];

// Helper to get avatar by ID
export function getAvatarById(id: string): Avatar | undefined {
    return AVATARS.find(a => a.id === id);
}

// Helper to get personality by ID
export function getPersonalityById(id: CoachPersonality): PersonalityOption | undefined {
    return PERSONALITIES.find(p => p.id === id);
}

// Default selections
export const DEFAULT_AVATAR = AVATARS[0];  // Aura
export const DEFAULT_PERSONALITY: CoachPersonality = 'mix';
