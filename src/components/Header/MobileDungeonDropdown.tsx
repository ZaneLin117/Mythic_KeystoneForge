import { useMemo, useState } from 'react'
import { dungeons } from '../../data/dungeons.ts'
import { useIsGuestCollab } from '../../store/collab/collabReducer.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { Button } from '../Common/Button.tsx'
import { setDungeon } from '../../store/routes/routesReducer.ts'
import { useDungeon } from '../../store/routes/routeHooks.ts'
import type { DungeonKey } from '../../data/dungeonKeys.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { localizedDungeonNames } from '../../i18n/dungeonNames.ts'

export function MobileDungeonDropdown() {
  const dispatch = useAppDispatch()
  const { locale } = useI18n()
  const dungeon = useDungeon()
  const isGuestCollab = useIsGuestCollab()

  const [expanded, setExpanded] = useState(false)
  const selected = useMemo(() => dungeons.find(({ key }) => key === dungeon.key), [dungeon])

  const handleSelect = (key: DungeonKey) => {
    setExpanded(false)
    dispatch(setDungeon(key))
  }

  if (!selected) {
    console.error(`Invalid dungeon key selected: ${dungeon.key}`)
    return null
  }

  const selectedNames = localizedDungeonNames(selected, locale)

  return (
    <div className="flex-col sm:flex-row flex items-center gap-1 flex-wrap">
      <Button
        className="[&]:p-1.5"
        twoDimensional
        onClick={() => setExpanded((val) => !val)}
        disabled={isGuestCollab}
      >
        <img
          className="rounded border border-gray-600 w-10 h-10"
          src={`https://wow.zamimg.com/images/wow/icons/large/${selected.icon}.jpg`}
          alt={selectedNames.full}
        />
        <div className="absolute bottom-0 text-outline">{selectedNames.short}</div>
      </Button>
      {expanded &&
        dungeons
          .filter((dungeon) => dungeon.key !== selected.key)
          .map((dungeon) => {
            const names = localizedDungeonNames(dungeon, locale)
            return (
              <Button
                key={dungeon.key}
                className="[&]:p-1.5"
                twoDimensional
                onClick={() => handleSelect(dungeon.key)}
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
