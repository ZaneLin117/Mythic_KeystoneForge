import { Button } from '../../Common/Button.tsx'
import { addToast } from '../../../store/reducers/toastReducer.ts'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useShortcut } from '../../../util/hooks/useShortcut.ts'
import { useCallback } from 'react'
import { shortcuts } from '../../../data/shortcuts.ts'
import { useRoute } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { routeToMdtString } from '../../../util/mdtUtil.ts'
import { copyText } from '../../../util/dev.ts'
import { useI18n } from '../../../i18n/useI18n.ts'

interface Props {
  hidden?: boolean
}

export function ExportRoute({ hidden }: Props) {
  const dispatch = useAppDispatch()
  const route = useRoute()
  const { t } = useI18n()

  const handleClick = useCallback(async () => {
    try {
      const str = await routeToMdtString(route)
      await copyText(str)
      dispatch(addToast({ message: t('export.copied') }))
    } catch (err) {
      dispatch(addToast({ message: t('export.failed', { message: String(err) }), type: 'error' }))
    }
  }, [dispatch, route, t])

  useShortcut(shortcuts.exportRoute, handleClick)

  return (
    <Button
      Icon={ArrowDownTrayIcon}
      short
      className={`flex-1 ${hidden ? '[&]:hidden' : ''}`}
      onClick={handleClick}
      shortcut={shortcuts.exportRoute[0]}
      justifyStart
    >
      {t('action.exportMdt')}
    </Button>
  )
}
