import { Button } from '../Common/Button.tsx'
import { GithubIcon } from '../Common/Icons/GithubIcon.tsx'
import { GoogleIcon } from '../Common/Icons/GoogleIcon.tsx'
import { useCallback, useState } from 'react'
import { HelpModal } from './HelpModal.tsx'
import { useShortcut } from '../../util/hooks/useShortcut.ts'
import { shortcuts } from '../../data/shortcuts.ts'
import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'
import { isMobile } from '../../util/dev.ts'
import { selectIsLive } from '../../store/reducers/mapReducer.ts'
import { selectSyncState, selectUser } from '../../store/reducers/cloudReducer.ts'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from '../../store/firestore.ts'
import { pullChangedRoutes, pushChangedRoutes } from '../../store/routes/routeCloudThunks.ts'
import { Panel } from '../Common/Panel.tsx'
import { useKeyHeld } from '../../util/hooks/useKeyHeld.ts'
import { ArrowPathIcon, LanguageIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../i18n/useI18n.ts'
import { cloudFeaturesEnabled } from '../../config/features.ts'

export function Footer() {
  const { locale, t, toggleLocale } = useI18n()
  const isLive = useRootSelector(selectIsLive)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const sidebarCollapsed = useRootSelector((state) => state.map.sidebarCollapsed)

  const onHelp = useCallback(() => setHelpModalOpen(true), [])
  useShortcut(shortcuts.help, onHelp)

  if ((sidebarCollapsed && isMobile) || isLive) return false

  return (
    <>
      <div className="fixed bottom-0 z-20 transition-all">
        <div className="my-1 mx-2 flex items-center gap-2 h-12">
          {cloudFeaturesEnabled && <UserMenu />}
          <Button
            Icon={LanguageIcon}
            iconSize={20}
            onClick={toggleLocale}
            tooltip={locale === 'zh-CN' ? t('action.switchEnglish') : t('action.switchChinese')}
            tooltipId="locale-switch-tooltip"
          >
            {locale === 'zh-CN' ? 'EN' : '中'}
          </Button>
          <a href="https://github.com/acornellier/threechest" target="_blank" rel="noreferrer">
            <Button
              Icon={GithubIcon}
              tooltip={t('help.upstream')}
              tooltipId="upstream-source-tooltip"
            >
              <span className="hidden sm:inline">{t('action.source')}</span>
            </Button>
          </a>
          <Button justifyStart onClick={() => setHelpModalOpen(true)}>
            {t('action.help')}
          </Button>
        </div>
      </div>
      {helpModalOpen && <HelpModal onClose={() => setHelpModalOpen(false)} />}
    </>
  )
}

function UserMenu() {
  const { t } = useI18n()
  const dispatch = useAppDispatch()
  const user = useRootSelector(selectUser)
  const syncState = useRootSelector(selectSyncState)
  const [open, setOpen] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [pulling, setPulling] = useState(false)
  const isShiftKeyDown = useKeyHeld('Shift')

  const onSignIn = useCallback(() => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(console.error)
  }, [])

  const onSignOut = useCallback(() => {
    signOut(auth).catch(console.error)
    setOpen(false)
  }, [])

  const onPushAll = useCallback(async () => {
    if (!user) return
    setPushing(true)
    try {
      await dispatch(pushChangedRoutes(user.uid))
    } finally {
      setPushing(false)
    }
  }, [dispatch, user])

  const onPullAll = useCallback(async () => {
    if (!user) return
    setPulling(true)
    try {
      await dispatch(pullChangedRoutes(user.uid))
    } finally {
      setPulling(false)
    }
  }, [dispatch, user])

  if (!user) {
    return (
      <Button Icon={GoogleIcon} iconSize={18} onClick={onSignIn}>
        {t('action.signIn')}
      </Button>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full ring-1 ring-black outline-none min-w-8 flex justify-center mb-1"
      >
        {syncState !== 'idle' ? (
          <ArrowPathIcon width={24} height={24} className="animate-spin [animation-duration:6s]" />
        ) : user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? 'User'}
            className="w-8 h-8 rounded-full block"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
            {user.displayName?.[0] ?? '?'}
          </div>
        )}
      </button>
      {open && (
        <Panel className="bottom-full min-w-40" style={{ position: 'absolute' }}>
          {isShiftKeyDown && (
            <Button onClick={onPushAll} disabled={pushing || syncState === 'syncing'}>
              {pushing ? t('action.pushingCloud') : t('action.pushCloud')}
            </Button>
          )}
          <Button onClick={onPullAll} disabled={pulling || syncState === 'syncing'}>
            {pulling ? t('action.pullingCloud') : t('action.pullCloud')}
          </Button>
          <Button onClick={onSignOut}>{t('action.signOut')}</Button>
        </Panel>
      )}
    </>
  )
}
