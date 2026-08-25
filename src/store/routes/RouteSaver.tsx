import { useEffect } from 'react'
import { saveRoute, updateSavedRoutes } from './routesReducer.ts'
import { importFirestoreRoute, importMdtRoute } from '../reducers/importReducer.ts'
import { useIsGuestCollab } from '../collab/collabReducer.ts'

import { useActualRoute } from './routeHooks.ts'
import { useAppDispatch } from '../storeUtil.ts'
import { routeSharingEnabled } from '../../config/features.ts'

function clearImportQuery() {
  window.history.replaceState(null, '', import.meta.env.BASE_URL)
}

export function RouteSaver() {
  const dispatch = useAppDispatch()
  const route = useActualRoute()
  const isGuestCollab = useIsGuestCollab()

  // initial import from URL on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)

    const routeId = urlParams.get('id')
    if (routeId && routeSharingEnabled) {
      dispatch(importFirestoreRoute({ routeId }))
      clearImportQuery()
      return
    }

    const mdtString = urlParams.get('mdt')
    if (mdtString) {
      dispatch(importMdtRoute({ text: mdtString }))
      clearImportQuery()
      return
    }

    if (routeId) clearImportQuery()
  }, [dispatch])

  // Whenever route UID or name changes, update saved routes, unless guest
  useEffect(() => {
    if (!isGuestCollab) dispatch(updateSavedRoutes())
  }, [dispatch, route.uid, route.name, isGuestCollab])

  // Whenever route changes, save it, unless guest
  useEffect(() => {
    if (!isGuestCollab) saveRoute(route)
  }, [isGuestCollab, route])

  return null
}
