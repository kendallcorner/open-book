import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { LibraryProvider } from './contexts/LibraryContext.tsx'

// Create a client
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LibraryProvider>
        <App />
      </LibraryProvider>
    </QueryClientProvider>
  </StrictMode>,
)
