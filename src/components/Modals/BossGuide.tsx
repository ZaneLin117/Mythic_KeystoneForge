import { BookOpenIcon } from '@heroicons/react/24/outline'
import type { BossGuide as BossGuideData } from '../../data/bossGuides.ts'

interface Props {
  guide: BossGuideData
  label: string
}

export function BossGuide({ guide, label }: Props) {
  return (
    <section
      className="rounded-md border border-amber-500/60 bg-amber-950/80 px-3 py-2 text-amber-50 shadow-inner"
      role="note"
      aria-label={`${guide.encounter}${label}`}
    >
      <div className="flex items-center gap-1.5 text-sm font-bold text-amber-300">
        <BookOpenIcon width={18} height={18} aria-hidden="true" />
        <span>
          {guide.encounter} · {label}
        </span>
      </div>
      <p className="mt-1 whitespace-normal text-sm leading-5">{guide.text}</p>
    </section>
  )
}
