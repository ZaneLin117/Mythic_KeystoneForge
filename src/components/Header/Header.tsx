import { DungeonDropdown } from './DungeonDropdown.tsx'
import { sidebarWidth } from '../Sidebar/Sidebar.tsx'
import { UndoRedo } from './UndoRedo.tsx'
import { DrawToolbar } from '../Map/Draw/DrawToolbar.tsx'
import { useRootSelector } from '../../store/storeUtil.ts'
import { selectIsLive } from '../../store/reducers/mapReducer.ts'
import { MobileDungeonDropdown } from './MobileDungeonDropdown.tsx'
import { MobSearch } from './MobSearch.tsx'
import { MapIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../i18n/useI18n.ts'
import type { CSSProperties } from 'react'
import { SampleRoutes } from '../Sidebar/Buttons/SampleRoutes.tsx'

export function Header() {
  const { t } = useI18n()
  const isLive = useRootSelector(selectIsLive)
  const sidebarCollapsed = useRootSelector((state) => state.map.sidebarCollapsed)

  const actualSidebarWidth = sidebarCollapsed ? 0 : sidebarWidth + 20
  return (
    <div className="z-10 fixed pt-4 px-4 w-full grid items-center pointer-events-none">
      <div className={`pointer-events-none flex flex-col items-start gap-4`}>
        {!isLive && (
          <div
            className="header-primary-row flex flex-nowrap items-start gap-2 pointer-events-auto sm:items-center sm:gap-4"
            style={{ '--header-sidebar-offset': `${actualSidebarWidth}px` } as CSSProperties}
          >
            <div className="brand-card hidden lg:flex min-w-fit items-center gap-2.5 px-3 py-2">
              <div className="brand-mark">
                <MapIcon width={26} height={26} />
              </div>
              <div className="leading-none">
                <div className="text-lg font-bold tracking-wide">{t('brand.name')}</div>
                <div className="mt-1 text-[9px] uppercase tracking-[0.22em] text-cyan-200/75">
                  {t('brand.tagline')}
                </div>
              </div>
            </div>
            <div className="hidden min-w-0 flex-1 sm:block">
              <DungeonDropdown />
            </div>
            <div className="sm:hidden">
              <MobileDungeonDropdown />
            </div>
            <SampleRoutes />
          </div>
        )}
        <div
          className={`items-start gap-6 h-full pointer-events-auto ${sidebarCollapsed ? 'flex' : 'hidden sm:flex'}`}
        >
          <UndoRedo />
          <MobSearch />
          {!isLive && <DrawToolbar />}
        </div>
      </div>
    </div>
  )
}
