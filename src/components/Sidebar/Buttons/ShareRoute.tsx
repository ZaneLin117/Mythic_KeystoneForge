import { Button } from '../../Common/Button.tsx'
import { routeToMdtString } from '../../../util/mdtUtil.ts'
import { addToast } from '../../../store/reducers/toastReducer.ts'
import { ShareIcon } from '@heroicons/react/24/outline'
import { useCallback, useState } from 'react'
import { useRoute } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { shareRouteApi } from '../../../api/shareRouteApi.ts'
import { copyText } from '../../../util/dev.ts'
import { useI18n } from '../../../i18n/useI18n.ts'

interface Props {
  hidden?: boolean
}

export function ShareRoute({ hidden }: Props) {
  const dispatch = useAppDispatch()
  const route = useRoute()
  const [loading, setLoading] = useState(false)
  const { t } = useI18n()

  const handleClick = useCallback(async () => {
    try {
      setLoading(true)
      const str = await routeToMdtString(route)
      const routeId = await shareRouteApi(route.uid, str)
      const url = window.location.origin + `?id=${encodeURIComponent(routeId)}`
      await copyText(url)
      dispatch(addToast({ message: t('share.copied') }))
    } catch (err) {
      dispatch(addToast({ message: t('share.failed', { message: String(err) }), type: 'error' }))
    }
    setLoading(false)
  }, [dispatch, route, t])

  return (
    <Button
      Icon={ShareIcon}
      short
      className={`flex-1 ${hidden ? '[&]:hidden' : ''}`}
      onClick={handleClick}
      disabled={loading}
    >
      {t('action.share')}
    </Button>
  )
}
