import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import App from '../App.jsx'

// Mock useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { name: 'Test User' },
    isLoading: false,
  }),
}))

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    )
  })

  it('shows loading state when isLoading is true', () => {
    vi.mock('../hooks/useAuth', () => ({
      useAuth: () => ({
        user: null,
        isLoading: true,
      }),
    }))

    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('redirects to dashboard when user is logged in', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    )

    // Should redirect to dashboard when user is logged in
    expect(window.location.pathname).toBe('/dashboard')
  })
})
