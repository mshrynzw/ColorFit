import { AppLayout } from '../components/layout/AppLayout'
import { HomePage } from '../routes/HomePage'
import { EditorPage, ResultPage, SettingsPage } from './lazy-pages'

export const appRoutes = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'editor', element: <EditorPage /> },
      { path: 'result', element: <ResultPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]
