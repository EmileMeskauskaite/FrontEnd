import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginPage from '../src/LoginPage';
import '@testing-library/jest-dom'; // Import the jest-dom matchers
import React from 'react';

// Mock the navigate function from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock localStorage
beforeEach(() => {
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
});

// Mock fetch globally
beforeEach(() => {
    global.fetch = jest.fn((url, options) => {
        if (url.includes('/api/user/login')) {
            const { userName, password } = JSON.parse(options.body);

            // Simulate a successful login for specific credentials
            if (userName === 'testuser' && password === 'password123') {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            id: 1,
                            userName: 'Test User',
                            password: 'string',
                            firstName: 'John',
                            lastName: 'Doe',
                            dateOfBirth: '2024-12-07T18:57:55.403Z',
                            email: 'john.doe@example.com',
                        }),
                });
            }

            // Simulate an unauthorized response for invalid credentials
            return Promise.resolve({
                ok: false,
                status: 401,
                json: () =>
                    Promise.resolve({
                        message: 'Unauthorized',
                    }),
            });
        }

        return Promise.reject(new Error('Unknown API call'));
    });
});

// Clear mocks after each test
afterEach(() => {
    jest.clearAllMocks();
});

test('handles successful login', async () => {
    render(
        <Router>
            <LoginPage />
        </Router>
    );

    // Enter credentials
    fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
    });

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for fetch and navigation
    await screen.findByRole('button', { name: /login/i });

    // Assert localStorage is updated
    expect(localStorage.setItem).toHaveBeenCalledWith(
        'userData',
        JSON.stringify({
            id: 1,
            userName: 'Test User',
            password: 'string',
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '2024-12-07T18:57:55.403Z',
            email: 'john.doe@example.com',
        })
    );

    // Assert navigation
    expect(mockNavigate).toHaveBeenCalledWith('/main');
});

test('handles failed login with invalid credentials', async () => {
    render(
        <Router>
            <LoginPage />
        </Router>
    );

    // Enter invalid credentials
    fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'wronguser' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' },
    });

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Assert error message is displayed
    const errorMessage = await screen.findByText('Incorrect username or password.');
    expect(errorMessage).toBeInTheDocument();

    // Assert localStorage is not updated
    expect(localStorage.setItem).not.toHaveBeenCalled();
});
