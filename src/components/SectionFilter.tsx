import { Section } from '../types';

interface Props {
  sections: Section[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function SectionFilter({ sections, selected, onChange }: Props) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length > 1) {
        onChange(selected.filter(s => s !== id));
      }
    } else {
      onChange([...selected, id]);
    }
  };

  const selectAll = () => onChange(sections.map(s => s.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800 m-0">Choose Topics</h2>
        <button
          onClick={selectAll}
          className="text-sm text-israel-blue hover:underline bg-transparent border-none cursor-pointer"
        >
          Select All
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {sections.map(section => {
          const isSelected = selected.includes(section.id);
          return (
            <button
              key={section.id}
              onClick={() => toggle(section.id)}
              className={`
                p-4 rounded-xl border-2 transition-all text-right cursor-pointer
                ${isSelected
                  ? 'border-israel-blue bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="text-2xl mb-1">{section.icon}</div>
              <div className={`font-bold text-sm ${isSelected ? 'text-israel-blue' : 'text-gray-600'}`}>
                {section.title}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {section.questions.length} questions
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
