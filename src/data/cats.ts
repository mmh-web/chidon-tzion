import { Cat } from '../types';

const base = import.meta.env.BASE_URL;

export const cats: Cat[] = [
  // Common (₪3-15)
  { id: 'whiskers', name: 'Whiskers', emoji: '🐱', image: `${base}cats/whiskers.jpg`, price: 3, rarity: 'common' },
  { id: 'sunny', name: 'Sunny', emoji: '😺', image: `${base}cats/sunny.jpg`, price: 5, rarity: 'common' },
  { id: 'shadow', name: 'Shadow', emoji: '🐈‍⬛', image: `${base}cats/shadow.jpg`, price: 8, rarity: 'common' },
  { id: 'mittens', name: 'Mittens', emoji: '😸', image: `${base}cats/mittens.jpg`, price: 12, rarity: 'common' },
  // Rare (₪15-40)
  { id: 'siamese', name: 'Siamese', emoji: '😽', image: `${base}cats/siamese.jpg`, price: 15, rarity: 'rare' },
  { id: 'captain-meow', name: 'Captain Meow', emoji: '😼', image: `${base}cats/captain-meow.jpg`, price: 20, rarity: 'rare' },
  { id: 'ninja', name: 'Ninja', emoji: '🐈', image: `${base}cats/ninja.jpg`, price: 25, rarity: 'rare' },
  { id: 'persian', name: 'Persian', emoji: '😻', image: `${base}cats/persian.jpg`, price: 30, rarity: 'rare' },
  { id: 'calico', name: 'Calico', emoji: '😺', image: `${base}cats/calico.jpg`, price: 35, rarity: 'rare' },
  // Epic (₪40-100)
  { id: 'leo', name: 'Leo the Lion', emoji: '🦁', image: `${base}cats/leo.jpg`, price: 50, rarity: 'epic' },
  { id: 'tiger', name: 'Tiger', emoji: '🐯', image: `${base}cats/tiger.jpg`, price: 65, rarity: 'epic' },
  { id: 'panther', name: 'Panther', emoji: '🐆', image: `${base}cats/panther.jpg`, price: 80, rarity: 'epic' },
  { id: 'king-kitty', name: 'King Kitty', emoji: '😾', image: `${base}cats/king-kitty.jpg`, price: 100, rarity: 'epic' },
  // Legendary (₪120+)
  { id: 'sphinx', name: 'Sphinx', emoji: '🙀', image: `${base}cats/sphinx.jpg`, price: 120, rarity: 'legendary' },
  { id: 'unicat', name: 'Unicat', emoji: '🦄', image: `${base}cats/unicat.jpg`, price: 150, rarity: 'legendary' },
  { id: 'sabra-cat', name: 'Sabra Cat', emoji: '😿', image: `${base}cats/sabra-cat.jpg`, price: 200, rarity: 'legendary' },
];

export const rarityColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  common: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', badge: 'bg-gray-200 text-gray-700' },
  rare: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-200 text-blue-700' },
  epic: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', badge: 'bg-purple-200 text-purple-700' },
  legendary: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-600', badge: 'bg-yellow-200 text-yellow-700' },
};
