import { AppLayout } from '../components/layout/AppLayout'
import { EditorPage } from '../routes/EditorPage'
import { HomePage } from '../routes/HomePage'
import { ResultPage } from '../routes/ResultPage'
import { SettingsPage } from '../routes/SettingsPage'

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
