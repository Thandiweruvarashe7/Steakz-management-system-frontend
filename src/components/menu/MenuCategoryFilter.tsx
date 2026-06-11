import { cn } from '@/lib/utils'
import { MENU_CATEGORIES } from '@/constants/nav'

interface MenuCategoryFilterProps {
  value: string
  onChange: (value: string) => void
}

export function MenuCategoryFilter({ value, onChange }: MenuCategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      {MENU_CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={cn(
            'flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all border',
            value === cat.value
              ? 'bg-maroon text-white border-maroon shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-maroon hover:text-maroon'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
