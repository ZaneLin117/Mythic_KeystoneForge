import type { DropdownOption } from '../../Common/Dropdown.tsx'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SampleRoute } from '../../../util/types.ts'
import { useSampleRoutes } from '../../../util/hooks/useSampleRoutes.ts'
import { setPreviewRouteAsync } from '../../../store/reducers/importReducer.ts'
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { setRouteFromSample } from '../../../store/routes/routesReducer.ts'
import { addToast } from '../../../store/reducers/toastReducer.ts'
import {
  useActualCompareRoute,
  useActualRoute,
  useDungeon,
} from '../../../store/routes/routeHooks.ts'
import { useCompareOptionAction } from '../../Compare/useCompareOptionAction.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { classColors } from '../../../util/colors.ts'
import {
  pickSpecRankings,
  pickTopRankings,
  pickVariedComps,
  type Spec,
  tankSpecs,
  type WclRankingTeamMember,
} from '../../../util/wclRankings.ts'
import { trackEvent } from '../../../util/analytics.ts'
import { useI18n } from '../../../i18n/useI18n.ts'
import { getIconLink } from '../../../data/spells/spells.ts'
import { useOutsideClick } from '../../../util/hooks/useOutsideClick.ts'

type SampleRouteOption = SampleRoute & DropdownOption

const routeSources = ['wcl', 'network'] as const
type RouteSource = (typeof routeSources)[number]

const filterModes = ['varied', 'top', 'spec'] as const
type FilterMode = (typeof filterModes)[number]

const roleToNum = (role: WclRankingTeamMember['role']) =>
  role === 'Tank' ? 0 : role === 'Healer' ? 1 : 2

function sortTeam(member1: WclRankingTeamMember, member2: WclRankingTeamMember) {
  if (member1.role !== member2.role) {
    return roleToNum(member1.role) - roleToNum(member2.role)
  }

  if (member1.class !== member2.class) {
    return member1.class.localeCompare(member2.class)
  }

  return member1.name.localeCompare(member2.name)
}

export function SampleRoutes() {
  const dispatch = useAppDispatch()
  const { t } = useI18n()
  const dungeon = useDungeon()
  const route = useActualRoute()
  const compareRoute = useActualCompareRoute()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState<RouteSource>('wcl')
  const [selectedMode, setSelectedMode] = useState<FilterMode | null>(null)
  const [selectedSpec, setSelectedSpec] = useState<Spec>(tankSpecs[0]!)
  const { sampleRoutes: routes, loading } = useSampleRoutes(dungeon.key)

  const wclRoutes = useMemo(() => routes.filter((item) => item.wclRanking), [routes])
  const networkRoutes = useMemo(() => routes.filter((item) => !item.wclRanking), [routes])

  const routesByMode = useMemo(() => {
    const rankings = wclRoutes.map((item) => item.wclRanking!)

    function pickRankingsFromFilterMode(mode: FilterMode) {
      if (mode === 'spec') return pickSpecRankings(rankings, selectedSpec, 10)
      if (mode === 'top') return pickTopRankings(rankings, 10)
      if (mode === 'varied') return pickVariedComps(rankings, 10)
      return []
    }

    return Object.fromEntries(
      filterModes.map((mode) => {
        const pickedRankings = pickRankingsFromFilterMode(mode)
        return [
          mode,
          wclRoutes.filter((item) => item.wclRanking && pickedRankings.includes(item.wclRanking)),
        ]
      }),
    ) as Record<FilterMode, SampleRoute[]>
  }, [selectedSpec, wclRoutes])

  const mode =
    selectedMode ?? filterModes.find((item) => routesByMode[item].length) ?? filterModes[0]

  const options: SampleRouteOption[] = useMemo(() => {
    const visibleRoutes = selectedSource === 'network' ? networkRoutes : routesByMode[mode]
    return visibleRoutes.map((item) => ({
      ...item,
      id: item.route.uid,
      content: item.route.name,
    }))
  }, [mode, networkRoutes, routesByMode, selectedSource])

  const getRoute = useCallback((option: SampleRouteOption) => option.route, [])
  const optionAction = useCompareOptionAction<SampleRouteOption>({
    tooltipId: 'sample-routes-compare-tooltip',
    routeUid: route.uid,
    compareRouteUid: compareRoute?.uid,
    getRoute,
  })

  const clearPreviews = useCallback(() => {
    dispatch(setPreviewRouteAsync(null))
    optionAction.onHover?.(null)
  }, [dispatch, optionAction])

  const close = useCallback(() => {
    setOpen(false)
    clearPreviews()
  }, [clearPreviews])

  const pickerRef = useOutsideClick(close)

  useEffect(() => {
    close()
  }, [close, dungeon.key])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      close()
      triggerRef.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [close, open])

  const toggleOpen = useCallback(() => {
    setOpen((wasOpen) => {
      if (!wasOpen) trackEvent('sample_routes_open', { dungeon: dungeon.key })
      return !wasOpen
    })
  }, [dungeon.key])

  const onSelect = useCallback(
    (option: SampleRouteOption) => {
      clearPreviews()
      dispatch(setRouteFromSample(option))
      dispatch(addToast({ message: t('route.importedCopy', { name: option.route.name }) }))
      setOpen(false)
    },
    [clearPreviews, dispatch, t],
  )

  const handleModeChange = useCallback((nextMode: FilterMode) => {
    setSelectedMode(nextMode)
    setSelectedSpec((previous) => previous ?? tankSpecs[0]!)
  }, [])

  const sourceLabel = (source: RouteSource) =>
    t(source === 'wcl' ? 'route.source.wcl' : 'route.source.network')

  return (
    <div ref={pickerRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="sample-route-picker"
        aria-haspopup="dialog"
        onClick={toggleOpen}
        className={`group flex min-h-12 items-center gap-2 rounded-xl border px-3 text-sm font-semibold shadow-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 motion-reduce:transition-none ${
          open
            ? 'border-cyan-300/70 bg-cyan-800/95 text-white shadow-cyan-950/60'
            : 'border-slate-500/60 bg-slate-900/90 text-cyan-50 hover:border-cyan-300/60 hover:bg-slate-800'
        }`}
      >
        <MagnifyingGlassIcon width={19} height={19} aria-hidden="true" />
        <span className="hidden xl:inline">{t('route.sampleRoutes')}</span>
        <span className="min-w-5 rounded-full bg-cyan-950/80 px-1.5 py-0.5 text-center text-[11px] text-cyan-100">
          {options.length}
        </span>
        <ChevronDownIcon
          width={17}
          height={17}
          aria-hidden="true"
          className={`transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <section
          id="sample-route-picker"
          role="dialog"
          aria-label={t('route.sampleRoutes')}
          className="fixed left-4 right-4 top-20 z-50 flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-2xl border border-cyan-200/35 bg-slate-950/95 shadow-2xl shadow-black/70 backdrop-blur-xl sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+0.65rem)] sm:w-[23rem]"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-cyan-950/90 to-slate-900/90 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold tracking-wide text-white">{t('route.sampleRoutes')}</h2>
                <p className="mt-0.5 text-xs text-cyan-100/65">
                  {t('route.availableCount', { count: options.length })}
                </p>
              </div>
              <MagnifyingGlassIcon
                width={22}
                height={22}
                className="text-cyan-200/70"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-b border-white/10 p-3">
            <div
              className="grid grid-cols-2 gap-1 rounded-xl bg-black/25 p-1"
              role="group"
              aria-label={t('route.source.label')}
            >
              {routeSources.map((source) => (
                <button
                  key={source}
                  type="button"
                  aria-pressed={selectedSource === source}
                  onClick={() => setSelectedSource(source)}
                  className={`min-h-10 rounded-lg border px-3 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 motion-reduce:transition-none ${
                    selectedSource === source
                      ? 'border-cyan-300/65 bg-cyan-700/70 text-white shadow-inner'
                      : 'border-transparent text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {sourceLabel(source)}
                </button>
              ))}
            </div>

            {selectedSource === 'wcl' && (
              <div className="grid grid-cols-3 gap-1" aria-label={t('route.sampleRoutes')}>
                {filterModes.map((filterMode) => (
                  <button
                    key={filterMode}
                    type="button"
                    aria-pressed={mode === filterMode}
                    onClick={() => handleModeChange(filterMode)}
                    className={`min-h-9 rounded-lg px-2 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 motion-reduce:transition-none ${
                      mode === filterMode
                        ? 'bg-slate-600 text-white'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {filterMode === 'varied'
                      ? t('route.filter.varied')
                      : filterMode === 'top'
                        ? t('route.filter.top')
                        : t('route.filter.tank')}
                  </button>
                ))}
              </div>
            )}

            {selectedSource === 'wcl' && mode === 'spec' && (
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
                {tankSpecs.map((spec) => {
                  const selected =
                    selectedSpec.class === spec.class && selectedSpec.spec === spec.spec
                  return (
                    <button
                      key={`${spec.class}-${spec.spec}`}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedSpec(spec)}
                      className={`shrink-0 overflow-hidden rounded-lg border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 ${
                        selected
                          ? 'border-cyan-300'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={getIconLink(spec.icon)}
                        width={32}
                        height={32}
                        alt={`${spec.spec} ${spec.class}`}
                      />
                    </button>
                  )
                })}
              </div>
            )}

            {selectedSource === 'wcl' && loading && (
              <div className="flex items-center gap-2 text-sm text-slate-300" role="status">
                <ArrowPathIcon width={17} height={17} className="animate-spin" aria-hidden="true" />
                {t('route.loadingRanked')}
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {options.length === 0 && !loading ? (
              <div className="grid min-h-28 place-items-center px-6 text-center text-sm text-slate-400">
                {t('route.noRoutes')}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5" role="list">
                {options.map((option) => {
                  const { wclRanking } = option
                  const compareDisabled = optionAction.disabled?.(option) ?? false
                  const compareActive = optionAction.isActive?.(option) ?? false
                  return (
                    <div
                      key={option.id}
                      role="listitem"
                      className="group flex min-h-14 overflow-hidden rounded-xl border border-slate-600/70 bg-slate-800/80 transition-colors hover:border-cyan-300/60 hover:bg-slate-700/90"
                      onMouseEnter={() => {
                        dispatch(setPreviewRouteAsync({ routeId: option.id, route: option.route }))
                      }}
                      onMouseLeave={clearPreviews}
                      onFocus={() => {
                        dispatch(setPreviewRouteAsync({ routeId: option.id, route: option.route }))
                      }}
                      onBlur={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget)) clearPreviews()
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onSelect(option)}
                        aria-label={t('route.importSample', { name: option.route.name })}
                        className="min-w-0 flex-1 px-3 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-yellow-300"
                      >
                        <div className="flex min-w-0 items-center gap-1.5">
                          {wclRanking && 'rank' in wclRanking && (
                            <span className="shrink-0 rounded bg-cyan-800 px-1.5 py-0.5 text-[11px] font-bold text-cyan-50">
                              {t('route.rank', { rank: wclRanking.rank ?? '-' })}
                            </span>
                          )}
                          <span className="truncate text-sm font-bold text-white">
                            {option.route.name}
                          </span>
                        </div>
                        {option.author && (
                          <div className="mt-0.5 text-xs text-cyan-200/80">
                            {t('route.author', { author: option.author })}
                          </div>
                        )}
                        {wclRanking && (
                          <div className="mt-1 flex flex-wrap gap-x-1.5 gap-y-0.5">
                            {wclRanking.team.toSorted(sortTeam).map((member) => (
                              <span
                                key={member.id}
                                className="whitespace-nowrap text-[11px]"
                                style={{ color: classColors[member.class] }}
                              >
                                {member.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>

                      {wclRanking && (
                        <a
                          href={`https://www.warcraftlogs.com/reports/${wclRanking.report.code}?fight=${wclRanking.report.fightID}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t('route.openWclReport', { name: option.route.name })}
                          className="grid w-11 shrink-0 place-items-center border-l border-white/10 text-cyan-200 transition-colors hover:bg-cyan-900/70 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-yellow-300"
                        >
                          <ArrowTopRightOnSquareIcon width={18} height={18} aria-hidden="true" />
                        </a>
                      )}

                      <button
                        type="button"
                        disabled={compareDisabled}
                        aria-pressed={compareActive}
                        aria-label={t('route.compareSample', { name: option.route.name })}
                        onClick={() => optionAction.onClick(option)}
                        onMouseEnter={() => optionAction.onHover?.(option)}
                        onMouseLeave={() => optionAction.onHover?.(null)}
                        className={`grid w-11 shrink-0 place-items-center border-l border-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-yellow-300 ${
                          compareActive
                            ? 'bg-cyan-700 text-white'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        } disabled:cursor-not-allowed disabled:opacity-30`}
                      >
                        <ArrowsRightLeftIcon width={18} height={18} aria-hidden="true" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
