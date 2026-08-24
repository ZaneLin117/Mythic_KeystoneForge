import { Modal } from '../Common/Modal.tsx'
import {
  setCollabColor,
  setCollabName,
  useSavedCollabColor,
  useSavedCollabName,
} from '../../store/collab/collabReducer.ts'
import { useCallback, useState } from 'react'
import { Button } from '../Common/Button.tsx'
import { TooltipStyled } from '../Common/TooltipStyled.tsx'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { generateCollabName } from '../../util/slugs/slugGenerator.ts'
import { ColorGrid } from '../Common/ColorGrid.tsx'
import { useI18n } from '../../i18n/useI18n.ts'

interface Props {
  onClose: () => void
}

export function CollabSettings({ onClose }: Props) {
  const dispatch = useAppDispatch()
  const { t } = useI18n()
  const [savedName, setSavedName] = useSavedCollabName()
  const [savedColor, setSavedColor] = useSavedCollabColor()
  const [isChoosingColor, setChoosingColor] = useState(false)

  const onChangeName = (newName: string) => {
    setSavedName(newName)
    dispatch(setCollabName(newName || generateCollabName()))
  }

  const onChangeColor = useCallback(
    (newColor: string) => {
      setChoosingColor(false)
      setSavedColor(newColor)
      dispatch(setCollabColor(newColor))
    },
    [dispatch, setSavedColor],
  )

  return (
    <Modal title={t('collab.settings')} onClose={onClose} closeOnEscape closeOnClickOutside>
      <div className="flex flex-col gap-2">
        <div>
          {t('collab.name')}
          <div className="flex gap-2">
            <input
              className="fancy w-full rounded-md"
              placeholder={`<${t('collab.random')}>`}
              onChange={(e) => onChangeName(e.target.value)}
              value={savedName}
            />
            <Button short onClick={() => onChangeName('')}>
              {t('collab.reset')}
            </Button>
          </div>
        </div>
        <div>
          {t('collab.color')}
          <div className="flex gap-2">
            <div
              className="min-h-10 flex-1 flex items-center rounded-md cursor-pointer p-2 text-gray-400 text-[15px] "
              style={{ backgroundColor: savedColor || 'rgb(78, 78, 87)' }}
              data-tooltip-id="collab-color-canvas-tooltip"
              onClick={() => setChoosingColor(true)}
            >
              {savedColor === '' ? `<${t('collab.random')}>` : ''}
            </div>
            <Button short onClick={() => onChangeColor('')}>
              {t('collab.reset')}
            </Button>
          </div>
          <TooltipStyled
            id="collab-color-canvas-tooltip"
            isOpen={isChoosingColor}
            clickable
            place="bottom"
            padding={8}
          >
            <ColorGrid onSelectColor={onChangeColor} />
          </TooltipStyled>
        </div>
      </div>
    </Modal>
  )
}
