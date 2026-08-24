import { Button } from '../../Common/Button.tsx'
import { newRoute } from '../../../store/routes/routesReducer.ts'
import { PlusCircleIcon } from '@heroicons/react/24/outline'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { useI18n } from '../../../i18n/useI18n.ts'

export function NewRoute() {
  const dispatch = useAppDispatch()
  const { t } = useI18n()

  return (
    <Button
      Icon={PlusCircleIcon}
      short
      className="flex-1"
      onClick={() => dispatch(newRoute())}
      tooltip={t('action.newRoute')}
      tooltipId="new-route-tooltip"
    />
  )
}
