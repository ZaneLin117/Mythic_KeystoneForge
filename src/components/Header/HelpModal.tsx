import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { Modal } from '../Common/Modal.tsx'
import { keyText, shortcuts, type Shortcut } from '../../data/shortcuts.ts'
import { isMac, isTouch } from '../../util/dev.ts'
import type { TranslationKey } from '../../i18n/i18n.tsx'
import { useI18n } from '../../i18n/useI18n.ts'

interface Props {
  onClose: () => void
}

const shortcutDefinitions: Array<{ key: TranslationKey; shortcuts: Shortcut[] }> = [
  { key: 'shortcut.undo', shortcuts: shortcuts.undo },
  { key: 'shortcut.redo', shortcuts: shortcuts.redo },
  { key: 'shortcut.import', shortcuts: shortcuts.importRoute },
  { key: 'shortcut.export', shortcuts: shortcuts.exportRoute },
  { key: 'shortcut.nextPull', shortcuts: shortcuts.pullDown },
  { key: 'shortcut.previousPull', shortcuts: shortcuts.pullUp },
  { key: 'shortcut.addAfter', shortcuts: shortcuts.appendPull },
  { key: 'shortcut.addEnd', shortcuts: shortcuts.addPull },
  { key: 'shortcut.addBefore', shortcuts: shortcuts.prependPull },
  { key: 'shortcut.clearPull', shortcuts: shortcuts.clearPull },
  {
    key: 'shortcut.deletePull',
    shortcuts: shortcuts.deletePull.concat(shortcuts.backspacePull),
  },
  { key: 'shortcut.draw', shortcuts: shortcuts.draw },
  { key: 'shortcut.find', shortcuts: shortcuts.findMob },
  { key: 'shortcut.help', shortcuts: shortcuts.help },
]

function SectionTitle({ children }: { children: string }) {
  return <div className="mb-1 mt-3 text-sm font-bold tracking-wide text-cyan-200">{children}</div>
}

export function HelpModal({ onClose }: Props) {
  const { t } = useI18n()
  const shortcutDescriptions = shortcutDefinitions
    .map(({ key, shortcuts: shortcutList }) => ({
      desc: t(key),
      texts: shortcutList.map((shortcut) => keyText(shortcut)),
    }))
    .filter(({ texts }) => texts.length)
    .concat({ desc: t('shortcut.selectPull'), texts: ['1–9'] })

  return (
    <Modal
      title={t('help.title')}
      width={820}
      onClose={onClose}
      closeOnEscape
      closeOnClickOutside
      closeButton
      contents={
        <div className="grid gap-6 md:grid-cols-[1fr_330px]">
          <div className="leading-relaxed text-slate-200">
            <SectionTitle>{t('help.quickStart')}</SectionTitle>
            <ol className="list-decimal space-y-1 pl-5">
              <li>{t('help.quickStart1')}</li>
              <li>{t('help.quickStart2')}</li>
              <li>{t('help.quickStart3')}</li>
              <li>{t('help.quickStart4')}</li>
            </ol>

            <SectionTitle>{t('help.importExport')}</SectionTitle>
            <div>{t('help.importExport1')}</div>
            <div>{t('help.importExport2')}</div>

            <SectionTitle>{t('help.notes')}</SectionTitle>
            <div>{t('help.notes1')}</div>

            {!isTouch && (
              <>
                <SectionTitle>{t('help.tips')}</SectionTitle>
                <div className="space-y-1">
                  <div>{t('help.tip1').replace('Ctrl', isMac ? 'Cmd' : 'Ctrl')}</div>
                  <div>{t('help.tip2')}</div>
                  <div>{t('help.tip3')}</div>
                </div>
              </>
            )}

            <div className="mt-5 rounded-lg border border-cyan-300/20 bg-cyan-950/30 p-3 text-sm text-slate-300">
              <div>{t('help.source')}</div>
              <a
                className="mt-1 inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-100"
                href="https://github.com/acornellier/threechest"
                target="_blank"
                rel="noreferrer"
              >
                {t('help.upstream')}
                <ArrowTopRightOnSquareIcon width={14} height={14} />
              </a>
            </div>
          </div>

          {!isTouch && (
            <div>
              <SectionTitle>{t('help.shortcuts')}</SectionTitle>
              <div className="flex flex-col gap-1.5 text-sm">
                {shortcutDescriptions.map(({ desc, texts }) => (
                  <div key={desc} className="flex items-center justify-between gap-4">
                    <div className="text-slate-300">{desc}</div>
                    <div className="flex gap-1.5">
                      {texts.map((text) => (
                        <kbd
                          key={text}
                          className="min-w-7 rounded border border-cyan-200/25 bg-slate-900/75 px-1.5 py-0.5 text-center text-cyan-100"
                        >
                          {text}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      }
    />
  )
}
