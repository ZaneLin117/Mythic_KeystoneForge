import { Button } from '../Common/Button.tsx'
import { CloudArrowDownIcon } from '@heroicons/react/24/outline'
import { useRoutesSelector } from '../../store/routes/routeHooks.ts'
import { useIsGuestCollab } from '../../store/collab/collabReducer.ts'
import { useCallback } from 'react'
import { setRouteForCollab } from '../../store/routes/routesReducer.ts'
import { addToast } from '../../store/reducers/toastReducer.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { useI18n } from '../../i18n/useI18n.ts'

export function RestoreBackup() {
  const dispatch = useAppDispatch()
  const { t } = useI18n()
  const backupRoute = useRoutesSelector((state) => state.collabBackupRoute)
  const isGuestCollab = useIsGuestCollab()

  const onRestoreBackup = useCallback(() => {
    if (!backupRoute) return
    dispatch(setRouteForCollab(backupRoute))
    dispatch(addToast({ message: t('collab.restored') }))
  }, [backupRoute, dispatch, t])

  if (!backupRoute || isGuestCollab) return null

  return (
    <div className="flex gap-1">
      <Button
        Icon={CloudArrowDownIcon}
        short
        outline
        onClick={onRestoreBackup}
        className="w-full"
        tooltip={t('collab.restoreTooltip')}
        tooltipId="collab-restore-route-tooltip"
      >
        {t('collab.restore')}
      </Button>
    </div>
  )
}
