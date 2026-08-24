import { Button } from '../../Common/Button.tsx'
import { duplicateRoute } from '../../../store/routes/routesReducer.ts'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'

import { useAppDispatch } from '../../../store/storeUtil.ts'
import { useI18n } from '../../../i18n/useI18n.ts'

export function DuplicateRoute() {
  const dispatch = useAppDispatch()
  const { t } = useI18n()

  return (
    <Button
      Icon={DocumentDuplicateIcon}
      short
      className="flex-1"
      onClick={() => dispatch(duplicateRoute())}
      tooltipId="duplicate-route-tooltip"
      tooltip={t('action.duplicateRoute')}
    />
  )
}
