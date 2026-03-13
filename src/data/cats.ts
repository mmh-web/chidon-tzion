import { Cat } from '../types';

export const cats: Cat[] = [
  // Common (₪3-15)
  { id: 'whiskers', name: 'Whiskers', emoji: '🐱', price: 3, rarity: 'common' },
  { id: 'sunny', name: 'Sunny', emoji: '😺', price: 5, rarity: 'common' },
  { id: 'shadow', name: 'Shadow', emoji: '🐈‍⬛', price: 8, rarity: 'common' },
  { id: 'mittens', name: 'Mittens', emoji: '🐾', price: 12, rarity: 'common' },
  // Rare (₪15-40)
  { id: 'siamese', name: 'Siamese', emoji: '😸', price: 15, rarity: 'rare' },
  { id: 'captain-meow', name: 'Captain Meow', emoji: '😼', price: 20, rarity: 'rare' },
  { id: 'ninja', name: 'Ninja', emoji: '🐈', price: 25, rarity: 'rare' },
  { id: 'persian', name: 'Persian', emoji: '😻', price: 30, rarity: 'rare' },
  { id: 'calico', name: 'Calico', emoji: '🐱', price: 35, rarity: 'rare' },
  // Epic (₪40-100)
  { id: 'leo', name: 'Leo the Lion', emoji: '🦁', price: 50, rarity: 'epic' },
  { id: 'tiger', name: 'Tiger', emoji: '🐯', price: 65, rarity: 'epic' },
  { id: 'panther', name: 'Panther', emoji: '🐆', price: 80, rarity: 'epic' },
  { id: 'king-kitty', name: 'King Kitty', emoji: '👑', price: 100, rarity: 'epic' },
  // Legendary (₪120+)
  { id: 'sphinx', name: 'Sphinx', emoji: '🏛️', price: 120, rarity: 'legendary' },
  { id: 'unicat', name: 'Unicat', emoji: '🦄', price: 150, rarity: 'legendary' },
  { id: 'sabra-cat', name: 'Sabra Cat', emoji: '🇮🇱', price: 200, rarity: 'legendary' },
];

export const rarityColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  common: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', badge: 'bg-gray-200 text-gray-700' },
  rare: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-200 text-blue-700' },
  epic: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', badge: 'bg-purple-200 text-purple-700' },
  legendary: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-600', badge: 'bg-yellow-200 text-yellow-700' },
};
