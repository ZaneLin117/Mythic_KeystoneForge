import { UserGroupIcon } from '@heroicons/react/24/outline'
import { Button } from '../Common/Button.tsx'
import { useCallback } from 'react'
import { endCollab, startCollab } from '../../store/collab/collabReducer.ts'
import { addToast } from '../../store/reducers/toastReducer.ts'
import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'
import { generateCollabRoom } from '../../util/slugs/slugGenerator.ts'
import { useI18n } from '../../i18n/useI18n.ts'

interface Props {
  active: boolean
  shareUrl: (room: string) => Promise<void>
}

export function CollabButton({ active, shareUrl }: Props) {
  const dispatch = useAppDispatch()
  const { t } = useI18n()
  const wsConnected = useRootSelector((state) => state.collab.wsConnected)

  const onClick = useCallback(async () => {
    if (active) {
      dispatch(endCollab())
      dispatch(addToast({ message: t('collab.ended'), type: 'info' }))
    } else {
      const room = generateCollabRoom()
      dispatch(startCollab(room))
      await shareUrl(room)
      dispatch(addToast({ message: t('collab.started') }))
    }
  }, [dispatch, active, shareUrl, t])

  return (
    <Button
      color={!active ? 'red' : !wsConnected ? 'yellow' : 'green'}
      Icon={UserGroupIcon}
      outline={!active}
      short
      twoDimensional={active}
      onClick={onClick}
      className="w-full"
    >
      {!active ? t('collab.start') : !wsConnected ? t('collab.connecting') : t('collab.leave')}
    </Button>
  )
}
