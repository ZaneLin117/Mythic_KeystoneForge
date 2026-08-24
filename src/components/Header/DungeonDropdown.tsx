import { useMemo } from 'react'
import { dungeons } from '../../data/dungeons.ts'
import { useIsGuestCollab } from '../../store/collab/collabReducer.ts'
import { useDungeon } from '../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { Button } from '../Common/Button.tsx'
import { setDungeon } from '../../store/routes/routesReducer.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { localizedDungeonNames } from '../../i18n/dungeonNames.ts'

export function DungeonDropdown() {
  const dispatch = useAppDispatch()
  const { locale } = useI18n()
  const dungeon = useDungeon()
  const isGuestCollab = useIsGuestCollab()

  const selected = useMemo(() => dungeons.find(({ key }) => key === dungeon.key), [dungeon])

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {dungeons.map((dungeon) => {
        const names = localizedDungeonNames(dungeon, locale)
        return (
          <Button
            key={dungeon.key}
            className="[&]:p-1.5"
            color={selected?.key === dungeon.key ? 'green' : 'red'}
            twoDimensional
            onClick={() => dispatch(setDungeon(dungeon.key))}
            disabled={isGuestCollab}
            tooltip={names.full}
            tooltipId={`dungeon-tooltip-${dungeon.key}`}
            tooltipPlace="bottom"
          >
            <img
              className="rounded border border-gray-600 w-10 h-10"
              src={`https://wow.zamimg.com/images/wow/icons/large/${dungeon.icon}.jpg`}
              alt={names.full}
            />
            <div className="absolute bottom-0 text-outline">{names.short}</div>
          </Button>
        )
      })}
    </div>
  )
}
