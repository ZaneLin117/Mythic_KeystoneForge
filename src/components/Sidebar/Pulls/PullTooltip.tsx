import { mobCountPercentStr } from '../../../util/numbers.ts'
import type { PullDetailed } from '../../../util/types.ts'
import { useDungeon } from '../../../store/routes/routeHooks.ts'
import { useMemo } from 'react'
import { countMobs, mobEfficiency } from '../../../util/mobSpawns.ts'
import { useI18n } from '../../../i18n/useI18n.ts'
import { localizedMobName } from '../../../i18n/mdtLocale.ts'

interface Props {
  pull: PullDetailed
}

export function PullTooltip({ pull }: Props) {
  const { locale, t } = useI18n()
  const dungeon = useDungeon()

  const sortedCounts = useMemo(() => countMobs(pull.spawns, dungeon), [pull, dungeon])

  const { efficiencyScore, efficiencyColor } = mobEfficiency(
    { count: pull.count, health: pull.health },
    dungeon,
  )

  const { efficiencyScore: totalEffiency, efficiencyColor: totalEffiencyColor } = mobEfficiency(
    { count: pull.countCumulative, health: pull.healthCumulative },
    dungeon,
  )

  return (
    <>
      <div>
        {t('mob.forces')}: {pull.count} ({mobCountPercentStr(pull.count, dungeon.mdt.totalCount)})
      </div>
      <div>
        {t('mob.total')}: {pull.countCumulative} (
        {mobCountPercentStr(pull.countCumulative, dungeon.mdt.totalCount)})
      </div>
      {pull.count > 0 && (
        <div>
          {t('mob.pullEfficiency')}:{' '}
          <span style={{ color: efficiencyColor }}>{efficiencyScore}</span>
        </div>
      )}
      {totalEffiency > 0 && (
        <div>
          {t('mob.totalEfficiency')}:{' '}
          <span style={{ color: totalEffiencyColor }}>{totalEffiency}</span>
        </div>
      )}
      <div>
        {sortedCounts.map(({ mob, count }) => (
          <div key={mob.id}>
            {count}x {localizedMobName(mob, locale)}
          </div>
        ))}
      </div>
      {pull.kicksNeeded > 0 && (
        <div className="mt-1">
          <div>{t('mob.kicksNeeded', { count: pull.kicksNeeded })}</div>
          <div className="max-w-56 text-xs opacity-70">{t('mob.kickAssumption')}</div>
        </div>
      )}
    </>
  )
}
