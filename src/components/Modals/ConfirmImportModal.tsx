import { Button } from '../Common/Button.tsx'
import { clearImportingRoute } from '../../store/reducers/importReducer.ts'
import { setRouteFromMdt } from '../../store/routes/routesReducer.ts'
import { dungeonsByMdtIdx } from '../../data/dungeons.ts'
import { Modal } from '../Common/Modal.tsx'
import { useCallback } from 'react'
import { useShortcut } from '../../util/hooks/useShortcut.ts'
import { shortcuts } from '../../data/shortcuts.ts'
import type { MdtRoute } from '../../util/types.ts'
import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'
import { useI18n } from '../../i18n/useI18n.ts'
import { localizedDungeonNames } from '../../i18n/dungeonNames.ts'

interface Props {
  importingRoute: MdtRoute
}

export function ConfirmImportModalComponent({ importingRoute }: Props) {
  const dispatch = useAppDispatch()
  const { locale, t } = useI18n()

  const cancel = useCallback(() => {
    dispatch(clearImportingRoute())
  }, [dispatch])

  const confirm = useCallback(
    (copy: boolean) => {
      if (!importingRoute) return
      dispatch(setRouteFromMdt({ mdtRoute: importingRoute, copy }))
      dispatch(clearImportingRoute())
    },
    [dispatch, importingRoute],
  )

  const makeCopy = useCallback(() => confirm(true), [confirm])
  const overwrite = useCallback(() => confirm(false), [confirm])

  useShortcut(shortcuts.confirm, overwrite)

  if (!importingRoute) return false

  const dungeon = dungeonsByMdtIdx[importingRoute.value.currentDungeonIdx]
  const dungeonName = dungeon ? localizedDungeonNames(dungeon, locale).full : '-'

  return (
    <Modal
      title={t('import.existsTitle')}
      onClose={cancel}
      closeOnEscape
      contents={
        <div className="leading-loose">
          <p>{t('import.existsPrompt')}</p>
          <p>{t('import.routeName', { name: importingRoute.text })}</p>
          <p>{t('import.dungeon', { name: dungeonName })}</p>
        </div>
      }
      buttons={
        <>
          <Button outline onClick={cancel}>
            {t('action.cancel')}
          </Button>
          <Button onClick={makeCopy}>{t('action.makeCopy')}</Button>
          <Button justifyStart onClick={overwrite} shortcut={shortcuts.confirm[0]}>
            {t('action.overwrite')}
          </Button>
        </>
      }
    />
  )
}

export function ConfirmImportModal() {
  const importingRoute = useRootSelector((state) => state.import.importingRoute)
  if (!importingRoute) return false
  return <ConfirmImportModalComponent importingRoute={importingRoute} />
}
