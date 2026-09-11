import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { authService } from '../services/authService.js';

vi.mock('../services/authService.js', () => ({
  authService: {
    login: vi.fn(),
    me: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  },
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders email and password fields plus demo account shortcuts', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/you@nlcindia/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Staff')).toBeInTheDocument();
  });

  it('fills the form when a demo account shortcut is clicked', () => {
    renderLogin();
    fireEvent.click(screen.getByText('Manager'));
    expect(screen.getByPlaceholderText(/you@nlcindia/i)).toHaveValue('manager@nlcindia.example');
  });

  it('calls authService.login with the entered credentials on submit', async () => {
    authService.login.mockResolvedValue({
      user: { id: '1', name: 'Test Manager', email: 'manager@nlcindia.example', role: 'manager' },
      token: 'fake-token',
    });

    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/you@nlcindia/i), { target: { value: 'manager@nlcindia.example' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Manager@123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(authService.login).toHaveBeenCalledWith('manager@nlcindia.example', 'Manager@123'));
  });
});
