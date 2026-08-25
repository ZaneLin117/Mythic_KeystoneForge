import { useCallback, useEffect, useState } from 'react'
import { Button } from '../../Common/Button.tsx'
import { Modal } from '../../Common/Modal.tsx'
import { importMdtRoute, importWclRoute } from '../../../store/reducers/importReducer.ts'
import { ArrowUpTrayIcon, ClipboardIcon } from '@heroicons/react/24/outline'
import { isEventInInput, shortcuts } from '../../../data/shortcuts.ts'
import { useAppDispatch, useRootSelector } from '../../../store/storeUtil.ts'
import { useI18n } from '../../../i18n/useI18n.ts'

const canPasteFromClipboard = typeof navigator.clipboard?.readText === 'function'

interface Props {
  hidden?: boolean
}

export function ImportRoute({ hidden }: Props) {
  const dispatch = useAppDispatch()
  const { t } = useI18n()
  const isImporting = useRootSelector((state) => state.import.isImporting)
  const [input, setInput] = useState('')
  const [inputModalOpen, setInputModalOpen] = useState(false)

  const handlePaste = useCallback(
    (text: string) => {
      if (text?.includes('warcraftlogs.com')) dispatch(importWclRoute({ url: text }))
      else dispatch(importMdtRoute({ text }))
    },
    [dispatch],
  )

  const onGlobalPaste = useCallback(
    async (event: ClipboardEvent) => {
      if (isEventInInput(event) || !event.clipboardData) return
      handlePaste(event.clipboardData.getData('text'))
    },
    [handlePaste],
  )

  useEffect(() => {
    window.addEventListener('paste', onGlobalPaste)
    return () => {
      window.removeEventListener('paste', onGlobalPaste)
    }
  }, [onGlobalPaste])

  const onClose = useCallback(() => {
    setInputModalOpen(false)
    setInput('')
  }, [])

  const handleClick = useCallback(async () => {
    if (canPasteFromClipboard) {
      try {
        const text = await navigator.clipboard.readText()
        if (text) {
          handlePaste(text)
          return
        }
      } catch {
        // Clipboard permission is optional; the manual input below works without it.
      }
    }

    setInputModalOpen(true)
  }, [handlePaste])

  const modalConfirm = () => {
    handlePaste(input)
    onClose()
  }

  return (
    <>
      <Button
        Icon={canPasteFromClipboard ? ClipboardIcon : ArrowUpTrayIcon}
        short
        onClick={handleClick}
        shortcut={shortcuts.importRoute[0]}
        className={`${hidden ? '[&]:hidden' : ''}`}
        tooltip={t('import.tooltip')}
        tooltipId="import-route-tooltip"
        disabled={isImporting}
      >
        {isImporting ? t('action.importing') : t('action.importMdt')}
      </Button>
      {inputModalOpen && (
        <Modal
          title={t('import.title')}
          onClose={onClose}
          closeOnEscape
          closeOnClickOutside
          contents={
            <textarea
              autoFocus
              className="p-2 w-full h-[100px] resize-none text-black"
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder={t('import.placeholder')}
            />
          }
          buttons={
            <>
              <Button outline onClick={onClose}>
                {t('action.cancel')}
              </Button>
              <Button onClick={modalConfirm} disabled={!input.trim()}>
                {t('action.confirm')}
              </Button>
            </>
          }
        />
      )}
    </>
  )
}
