import { TooltipStyled } from '../Common/TooltipStyled.tsx'
import { type DungeonKey } from '../../data/dungeonKeys.ts'
import type { Mob, Spell, SpellAttribute } from '../../data/types.ts'
import { BoltIcon, InformationCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { SootheIcon } from '../Common/Icons/SootheIcon.tsx'
import { DiseaseIcon } from '../Common/Icons/DiseaseIcon.tsx'
import { BleedIcon } from '../Common/Icons/BleedIcon.tsx'
import { CurseIcon } from '../Common/Icons/CurseIcon.tsx'
import { PoisonIcon } from '../Common/Icons/PoisonIcon.tsx'
import { type FC, type SVGProps } from 'react'
import { dungeonSpells, getIconLink } from '../../data/spells/spells.ts'
import { MELEE_LOCKOUT } from '../../util/interrupts.ts'
import { roundTo } from '../../util/numbers.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import {
  localizeMdtText,
  localizedSpellDescription,
  localizedSpellName,
} from '../../i18n/mdtLocale.ts'

interface Props {
  spell: Spell
  dungeonKey: DungeonKey
  mob: Mob
}

interface AttributeIcon {
  name: SpellAttribute
  Icon: FC<SVGProps<SVGSVGElement>>
  label?: string
}

const attributeIcons: AttributeIcon[] = [
  { name: 'interruptible', Icon: BoltIcon },
  { name: 'bleed', Icon: BleedIcon },
  { name: 'curse', Icon: CurseIcon },
  { name: 'disease', Icon: DiseaseIcon },
  { name: 'poison', Icon: PoisonIcon },
  { name: 'magic', Icon: SparklesIcon },
  { name: 'enrage', Icon: SootheIcon },
  // { name: 'Purge', Icon: PurgeIcon },
  // { name: 'Movement', Icon: ChainIcon, label: 'Movement dispel' },
]

export function MobSpellInfo({ spell, mob, dungeonKey }: Props) {
  const { locale, t } = useI18n()
  const { icon, aoe, damage, physical, id } = spell
  const localizedName = localizedSpellName(spell, locale)
  const localizedDescription = localizedSpellDescription(spell.id, locale)
  const effectTooltipId = `spell-effect-${dungeonKey}-${mob.id}-${id}`
  const spellDetailsTooltipId = `spell-details-${id}`
  const kickTooltipId = `spell-kick-${id}`

  const damageText =
    damage && `${damage} ${aoe ? 'AoE' : 'ST'} ${physical ? 'physical' : 'magic'} damage`

  const isAlternateCast =
    spell.castTime &&
    dungeonSpells[dungeonKey][mob.id]?.find((s) => s.id !== spell.id && s.name === spell.name)

  // The kick interval is the wait until the mob can cast again, plus the cast time the kicker has
  // to react in. Whichever of the spell's cooldown and the interrupt lockout is longer sets the
  // wait, so a value at the lockout means the spell itself has no meaningful cooldown.
  const castSeconds = (spell.castTime ?? 0) / 1000
  const waitSeconds = spell.cooldown ? roundTo(spell.cooldown - castSeconds, 1) : 0
  const waitLabel = waitSeconds <= MELEE_LOCKOUT ? t('spell.kickLockout') : t('spell.cooldown')

  return (
    <div
      className={`flex flex-col border border-gray-500 rounded-md ${
        localizedDescription ? 'spell-effect-anchor' : 'overflow-hidden'
      }`}
      data-tooltip-id={localizedDescription ? effectTooltipId : undefined}
    >
      <div className="h-8 flex items-center">
        <button
          type="button"
          disabled={!localizedDescription}
          aria-label={t('spell.showEffect')}
          data-tooltip-id={localizedDescription ? effectTooltipId : undefined}
        >
          <img
            src={getIconLink(icon)}
            width={30}
            height={30}
            alt={localizedName}
            className="rounded-md rounded-r-none"
          />
        </button>

        <div
          className={`gritty flex flex-grow justify-between items-center gap-6 pl-2 h-full opacity-90 text-nowrap rounded-md rounded-l-none
                 ${isAlternateCast ? 'bg-fancy-orange' : 'bg-fancy-red'}`}
        >
          <button
            type="button"
            className="text-left"
            disabled={!localizedDescription}
            aria-label={t('spell.showEffect')}
            data-tooltip-id={localizedDescription ? effectTooltipId : undefined}
          >
            <span>{localizedName}</span>
            <span className="text-xs">
              {' '}
              {spell.id} {isAlternateCast && ` (${t('spell.castVariant')})`}
            </span>
          </button>
          <div className={`flex items-center gap-1 ${damage ? '' : 'pr-1'}`}>
            {localizedDescription && (
              <button
                type="button"
                className="flex items-center"
                aria-label={t('spell.showEffect')}
                data-tooltip-id={effectTooltipId}
              >
                <InformationCircleIcon height={20} />
              </button>
            )}
            {attributeIcons.map(
              ({ name, Icon, label }) =>
                spell.attributes?.includes(name) && (
                  <Icon
                    key={name}
                    height={20}
                    data-tooltip-id={spellDetailsTooltipId}
                    data-tooltip-content={
                      label ?? localizeMdtText(name[0]?.toUpperCase() + name.substring(1), locale)
                    }
                  />
                ),
            )}
            {!!spell.cooldown && (
              <>
                <span className="text-xs" data-tooltip-id={kickTooltipId}>
                  {spell.cooldown}s
                </span>
                <TooltipStyled id={kickTooltipId} place="top">
                  <div>{t('spell.secondsUntilKick')}</div>
                  <div>
                    {waitSeconds}s {waitLabel}
                    {castSeconds > 0 && ` + ${castSeconds}s ${t('spell.castTime')}`}
                  </div>
                </TooltipStyled>
              </>
            )}
            <TooltipStyled id={spellDetailsTooltipId} place="top" />
            {damageText && (
              <a
                className="flex h-full"
                href={`https://not-even-close.com/spell/${id}?trash=${!mob.isBoss}`}
                target="_blank"
                rel="noreferrer"
                data-tooltip-id={`spell-${id}-nec`}
              >
                <img
                  src={getIconLink('ability_argus_soulburst')}
                  width={30}
                  height={30}
                  alt="stealth detect"
                  className="rounded-md rounded-l-none"
                />
              </a>
            )}
            <TooltipStyled id={`spell-${id}-nec`} place="top">
              <div>{damageText}</div>
              <div>{t('spell.viewDetails')}</div>
            </TooltipStyled>
          </div>
        </div>
      </div>
      {localizedDescription && (
        <TooltipStyled
          id={effectTooltipId}
          place="right"
          positionStrategy="fixed"
          offset={12}
          delayShow={120}
          noArrow
          className="spell-effect-tooltip"
          enabledOnMobile
          openEvents={{ mouseenter: true, focus: true, click: true }}
          closeEvents={{ mouseleave: true, blur: true }}
          globalCloseEvents={{
            escape: true,
            scroll: true,
            resize: true,
            clickOutsideAnchor: true,
          }}
        >
          <div className="spell-effect-tooltip-content">
            <img
              src={getIconLink(icon)}
              width={64}
              height={64}
              alt=""
              aria-hidden="true"
              className="spell-effect-tooltip-icon"
            />
            <div className="min-w-0">
              <div className="spell-effect-tooltip-title">{localizedName}</div>
              <div className="spell-effect-tooltip-description">{localizedDescription}</div>
            </div>
          </div>
        </TooltipStyled>
      )}
    </div>
  )
}
