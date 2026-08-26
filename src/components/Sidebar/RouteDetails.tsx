import { Panel } from '../Common/Panel.tsx'
import { ImportRoute } from './Buttons/ImportRoute.tsx'
import { NewRoute } from './Buttons/NewRoute.tsx'
import { DeleteRoute } from './Buttons/DeleteRoute.tsx'
import { DuplicateRoute } from './Buttons/DuplicateRoute.tsx'
import { ExportRoute } from './Buttons/ExportRoute.tsx'
import { ShareRoute } from './Buttons/ShareRoute.tsx'
import { RouteDropdown } from './RouteDropdown.tsx'
import { RenameRoute } from './Buttons/RenameRoute.tsx'
import { useCallback, useEffect, useState } from 'react'
import { setName } from '../../store/routes/routesReducer.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { RenameRouteInput } from './Buttons/RenameRouteInput.tsx'
import { useActualRoute } from '../../store/routes/routeHooks.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { routeSharingEnabled } from '../../config/features.ts'

interface Props {
  collapsed?: boolean
}

export function RouteDetails({ collapsed }: Props) {
  const { t } = useI18n()
  const dispatch = useAppDispatch()
  const [isRenaming, setRenaming] = useState(false)
  const route = useActualRoute()
  const [input, setInput] = useState('')

  useEffect(() => {
    const oldDefaultName = route.name.match(/^Default threechest\.io( \d+)?$/)
    if (oldDefaultName) {
      dispatch(setName(t('route.untitled') + (oldDefaultName[1] ?? '')))
    }
  }, [dispatch, route.name, t])

  const open = useCallback(() => {
    setInput(route.name)
    setRenaming(true)
  }, [route.name, setRenaming])

  const close = useCallback(() => {
    dispatch(setName(input))
    setRenaming(false)
  }, [dispatch, input, setRenaming])

  const onClickRename = useCallback(() => {
    if (isRenaming) close()
    else open()
  }, [close, isRenaming, open])

  return (
    <Panel noRightBorder>
      <div className={`flex items-center justify-between px-0.5 ${collapsed ? 'hidden' : ''}`}>
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100/80">
          {t('route.workspace')}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-200/80">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]" />
          {t('status.localAutosave')}
        </div>
      </div>
      <div className="flex gap-2 pointer-events-auto">
        {isRenaming ? (
          <RenameRouteInput input={input} setInput={setInput} onClose={close} />
        ) : (
          <RouteDropdown />
        )}
      </div>
      <div className={`flex gap-2 ${collapsed ? 'hidden' : ''}`}>
        <RenameRoute isRenaming={isRenaming} onClickRename={onClickRename} />
        <NewRoute />
        <DuplicateRoute />
        <DeleteRoute />
      </div>
      <ImportRoute hidden={collapsed} />
      <div className={`flex gap-1 ${collapsed ? '[&]:hidden' : ''}`}>
        <ExportRoute hidden={collapsed} />
        {routeSharingEnabled && <ShareRoute hidden={collapsed} />}
      </div>
    </Panel>
  )
}
