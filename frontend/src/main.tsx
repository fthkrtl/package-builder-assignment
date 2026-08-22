import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme, useMediaQuery } from '@mui/material'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { PackagesListPage } from './routes/PackagesListPage'
import { WizardPage } from './routes/WizardPage'

const router = createBrowserRouter([
  { path: '/', element: <PackagesListPage /> },
  { path: '/packages/new', element: <WizardPage /> },
  { path: '/packages/:id', element: <WizardPage /> },
])

function App() {
  // MUI defaults on purpose — visual design is out of scope for this assignment.
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = createTheme({ palette: { mode: prefersDark ? 'dark' : 'light' } })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
