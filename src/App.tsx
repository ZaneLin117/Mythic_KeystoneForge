import { Page } from './components/Page.tsx'
import { Provider } from 'react-redux'
import { persistor, store } from './store/store.ts'
import { PersistGate } from 'redux-persist/integration/react'
import { ErrorBoundary } from './components/Common/ErrorBoundary.tsx'
import { Analytics } from '@vercel/analytics/react'
import { I18nProvider } from './i18n/I18nProvider.tsx'
import { analyticsEnabled } from './config/features.ts'

export default function App() {
  return (
    <I18nProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ErrorBoundary>
            <Page />
          </ErrorBoundary>
        </PersistGate>
        {analyticsEnabled && <Analytics />}
      </Provider>
    </I18nProvider>
  )
}
