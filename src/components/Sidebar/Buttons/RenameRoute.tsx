import type { Dispatch, SetStateAction } from 'react'
import { Button } from '../../Common/Button.tsx'
import { CheckIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../../i18n/useI18n.ts'

interface Props {
  isRenaming: boolean
  onClickRename: Dispatch<SetStateAction<boolean>>
  hidden?: boolean
}

export function RenameRoute({ isRenaming, onClickRename, hidden }: Props) {
  const { t } = useI18n()

  return (
    <Button
      Icon={isRenaming ? CheckIcon : PencilIcon}
      iconSize={20}
      onClick={() => onClickRename((v) => !v)}
      short
      className={`flex-1 ${hidden ? '[&]:hidden' : ''}`}
      tooltipId="rename-route-tooltip"
      tooltip={t('action.renameRoute')}
    />
  )
}
