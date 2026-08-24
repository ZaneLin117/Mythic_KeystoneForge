import { Button } from '../../Common/Button.tsx'
import { deleteRoute } from '../../../store/routes/routesReducer.ts'
import { TrashIcon } from '@heroicons/react/24/outline'

import { useAppDispatch } from '../../../store/storeUtil.ts'
import { useI18n } from '../../../i18n/useI18n.ts'

export function DeleteRoute() {
  const dispatch = useAppDispatch()
  const { t } = useI18n()

  return (
    <Button
      Icon={TrashIcon}
      short
      className="flex-1"
      onClick={() => dispatch(deleteRoute())}
      tooltip={t('action.deleteRoute')}
      tooltipId="delete-route-tooltip"
    />
  )
}
