import { lazy } from 'react'

export const EditorPage = lazy(async () => {
  const module = await import('../routes/EditorPage')
  return { default: module.EditorPage }
})

export const ResultPage = lazy(async () => {
  const module = await import('../routes/ResultPage')
  return { default: module.ResultPage }
})

export const SettingsPage = lazy(async () => {
  const module = await import('../routes/SettingsPage')
  return { default: module.SettingsPage }
})
