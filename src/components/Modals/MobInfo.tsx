import { Panel } from '../Common/Panel.tsx'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { selectSelectedSpawn, selectSpawn } from '../../store/reducers/hoverReducer.ts'
import { useDungeon } from '../../store/routes/routeHooks.ts'
import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'
import { mobCcTypes } from '../../util/mobSpawns.ts'
import { MobSpellInfo } from './MobSpellInfo.tsx'
import { dungeonSpells, getIconLink } from '../../data/spells/spells.ts'
import { shortRoundedNumber } from '../../util/numbers.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import {
  localizeMdtText,
  localizedMobName,
  localizedSpellName,
} from '../../i18n/mdtLocale.ts'

export function MobInfo() {
  const { locale, t } = useI18n()
  const dispatch = useAppDispatch()
  const selectedSpawn = useRootSelector(selectSelectedSpawn)
  const dungeon = useDungeon()
  if (selectedSpawn === null) return false

  const mobSpawn = dungeon.mobSpawns[selectedSpawn]
  if (!mobSpawn) return false

  const { mob } = mobSpawn
  const ccTypes = mobCcTypes(mob).map((ccType) => {
    if (ccType === 'Boss') return t('mob.boss')
    if (ccType === 'Immune to all CC') return t('mob.immuneAllCc')
    if (ccType === 'Susceptible to standard CC') return t('mob.susceptibleCc')
    if (ccType.startsWith('Immune to ')) {
      return t('mob.immuneTo', { type: localizeMdtText(ccType.slice(10), locale) })
    }
    return localizeMdtText(ccType, locale)
  })
  const spells = dungeonSpells[dungeon.key][mob.id]?.sort((a, b) => {
    const nameA = localizedSpellName(a, locale)
    const nameB = localizedSpellName(b, locale)
    return nameA === nameB ? a.id - b.id : nameA.localeCompare(nameB, locale)
  })

  return (
    <Panel blue>
      <div>
        <div className="flex items-center justify-between gap-2">
          <a href={`https://www.wowhead.com/npc=${mob.id}`} target="_blank" rel="noreferrer">
            <div className="font-bold text-lg">{localizedMobName(mob, locale)}</div>
          </a>
          <XMarkIcon
            width={20}
            height={20}
            className="cursor-pointer -mt-2"
            onClick={() => dispatch(selectSpawn(null))}
          />
        </div>
        <div className="flex justify-between gap-2">
          <div>{localizeMdtText(mob.creatureType, locale)}</div>
          <div>ID: {mob.id}</div>
        </div>
        <div>
          {t('mob.baseHp')}: {shortRoundedNumber(mob.health)}
        </div>
        {ccTypes.map((ccType) => (
          <div key={ccType}>{ccType}</div>
        ))}
        {mob.stealthDetect && (
          <div className="flex gap-2">
            <img
              src={getIconLink('ability_eyeoftheowl')}
              width={24}
              height={24}
              alt="stealth detect"
              className="rounded-md rounded-r-none"
            />
            {t('mob.detectsStealth')}
          </div>
        )}
      </div>
      {!!spells?.length && (
        <div className="flex flex-col gap-2">
          {spells.map((spell) => (
            <MobSpellInfo key={spell.id} spell={spell} dungeonKey={dungeon.key} mob={mob} />
          ))}
        </div>
      )}
    </Panel>
  )
}
