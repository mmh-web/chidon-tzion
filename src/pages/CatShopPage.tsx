import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { cats, rarityColors } from '../data/cats';
import { Confetti } from '../components/Confetti';

export function CatShopPage() {
  const navigate = useNavigate();
  const { progress, buyCat } = useProgress();
  const coins = progress.coins || 0;
  const owned = progress.ownedCats || [];
  const [justBought, setJustBought] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);

  const handleBuy = (catId: string, price: number) => {
    const success = buyCat(catId, price);
    if (success) {
      setJustBought(catId);
      setConfettiKey(prev => prev + 1);
      setTimeout(() => setJustBought(null), 2000);
    }
  };

  return (
    <div className="space-y-6" dir="ltr">
      <Confetti trigger={confettiKey > 0} key={confettiKey} intensity="big" />

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Cat Collection</h2>
        <p className="text-gray-500">Earn shekels by answering questions correctly!</p>
        <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full mt-2">
          <span className="text-2xl font-bold">₪</span>
          <span className="text-xl font-bold text-yellow-700">{coins}</span>
        </div>
      </div>

      {/* Owned cats showcase */}
      {owned.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-3">Your Cats ({owned.length}/{cats.length})</h3>
          <div className="flex flex-wrap gap-3">
            {owned.map(catId => {
              const cat = cats.find(c => c.id === catId);
              if (!cat) return null;
              return (
                <div key={catId} className="text-center animate-pop-in">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-14 h-14 rounded-full object-cover mx-auto" />
                  ) : (
                    <div className="text-4xl">{cat.emoji}</div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{cat.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shop grid */}
      <div className="grid grid-cols-2 gap-3">
        {cats.map(cat => {
          const isOwned = owned.includes(cat.id);
          const canAfford = coins >= cat.price;
          const colors = rarityColors[cat.rarity];
          const isJustBought = justBought === cat.id;

          return (
            <div
              key={cat.id}
              className={`
                rounded-xl p-4 border-2 text-center transition-all
                ${isOwned ? 'bg-green-50 border-green-300' : `${colors.bg} ${colors.border}`}
                ${isJustBought ? 'animate-pop-in' : ''}
              `}
            >
              <div className={`mb-2 ${isOwned ? '' : !canAfford ? 'grayscale opacity-40' : ''}`}>
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-20 h-20 rounded-full object-cover mx-auto" />
                ) : (
                  <div className="text-5xl">{cat.emoji}</div>
                )}
              </div>
              <p className="font-bold text-gray-800 text-sm">{cat.name}</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${colors.badge}`}>
                {cat.rarity}
              </span>

              {isOwned ? (
                <div className="mt-2 text-green-600 font-bold text-sm">Owned!</div>
              ) : (
                <button
                  onClick={() => handleBuy(cat.id, cat.price)}
                  disabled={!canAfford}
                  className={`
                    mt-2 w-full py-2 rounded-lg font-bold text-sm transition-all border-none cursor-pointer
                    ${canAfford
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 active:scale-95'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  ₪ {cat.price}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/')}
        className="w-full bg-white hover:bg-gray-50 text-gray-600 py-3 rounded-xl font-bold text-lg transition-colors border-2 border-gray-200 cursor-pointer"
      >
        Back to Home
      </button>
    </div>
  );
}
