import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginPage from '../src/LoginPage';
import '@testing-library/jest-dom';
import React from 'react';

// Mock the navigate function from react-router-dom
const mockNavigate = jest.fn();
let mockUseLocation = { state: { logout: true } };

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation, // Dynamic mock for useLocation
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
                            firstName: 'John',
                            lastName: 'Doe',
                            email: 'john.doe@example.com',
                        }),
                });
            }

            // Simulate an unauthorized response for invalid credentials
            return Promise.resolve({
                ok: false,
                status: 401,
                json: () =>
                    Promise.resolve({ message: 'Unauthorized' }),
            });
        }

        return Promise.reject(new Error('Unknown API call'));
    });
});

// Clear mocks after each test
afterEach(() => {
    jest.clearAllMocks();
    mockUseLocation = { state: { logout: true } }; // Reset to default
});

test('displays logout message on successful logout', async () => {
    render(
        <Router>
            <LoginPage />
        </Router>
    );

    // Assert the logout message is displayed
    const logoutMessage = await screen.findByText('Successfully logged out');
    expect(logoutMessage).toBeInTheDocument();

    // Wait for the message to disappear after 5 seconds
    await waitFor(() => expect(logoutMessage).not.toBeInTheDocument(), { timeout: 6000 });
}, 10000); // Increase the timeout to 10 seconds

test('displays error message for missing credentials', async () => {
    render(
        <Router>
            <LoginPage />
        </Router>
    );

    // Click the login button without entering credentials
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Assert the error message is displayed
    const errorMessage = await screen.findByText('Please enter both username and password');
    expect(errorMessage).toBeInTheDocument();
});

test('handles unexpected fetch error', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new TypeError('Network error')));

    render(
        <Router>
            <LoginPage />
        </Router>
    );

    // Enter credentials
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Assert the error message is displayed
    const errorMessage = await screen.findByText('Network error. Please check your connection and try again.');
    expect(errorMessage).toBeInTheDocument();
});

test('navigates to register page when "Register now" is clicked', () => {
    render(
        <Router>
            <LoginPage />
        </Router>
    );

    // Click the "Register now" button
    fireEvent.click(screen.getByText(/register now/i));

    // Assert navigation to the register page
    expect(mockNavigate).toHaveBeenCalledWith('/register');
});

test('does not show logout message if location.state.logout is undefined', () => {
    mockUseLocation = {}; // Simulate no logout state

    render(
        <Router>
            <LoginPage />
        </Router>
    );

    // Assert no logout message is shown
    expect(screen.queryByText('Successfully logged out')).toBeNull();
});

test('displays error message for incorrect credentials', async () => {
    render(
        <Router>
            <LoginPage />
        </Router>
    );

    // Enter incorrect credentials
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Assert the error message is displayed
    const errorMessage = await screen.findByText('Incorrect username or password.');
    expect(errorMessage).toBeInTheDocument();
});
test('stores user data and navigates on successful login', async () => {
    render(
        <Router>
            <LoginPage />
        </Router>
    );

    // Enter valid credentials
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Assert localStorage is updated with user data
    await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
            'userData',
            JSON.stringify({
                id: 1,
                userName: 'Test User',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
            })
        );
    });

    // Assert navigation to the main page
    expect(mockNavigate).toHaveBeenCalledWith('/main');
});

test('displays error message on failed login attempt', async () => {
    global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: false,
            status: 401,
            json: () =>
                Promise.resolve({
                    message: 'Unauthorized',
                }),
        })
    );

    render(
        <Router>
            <LoginPage />
        </Router>
    );

    // Enter invalid credentials
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Assert the error message is displayed
    const errorMessage = await screen.findByText('Incorrect username or password.');
    expect(errorMessage).toBeInTheDocument();
});
test('displays "Incorrect username or password." for 401 status', async () => {
    global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: false,
            status: 401,
            json: () =>
                Promise.resolve({
                    message: 'Unauthorized',
                }),
        })
    );

    render(
        <Router>
            <LoginPage />
        </Router>
    );

    // Enter credentials
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Assert the error message
    const errorMessage = await screen.findByText('Incorrect username or password.');
    expect(errorMessage).toBeInTheDocument();
});

test('displays errorData.message for non-401 status', async () => {
    global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: false,
            status: 500,
            json: () =>
                Promise.resolve({
                    message: 'Internal Server Error',
                }),
        })
    );

    render(
        <Router>
            <LoginPage />
        </Router>
    );

    // Enter credentials
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Assert the error message
    const errorMessage = await screen.findByText('Internal Server Error');
    expect(errorMessage).toBeInTheDocument();
});

test('displays fallback error message for non-401 status without errorData.message', async () => {
    global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({}), // No message in response
        })
    );

    render(
        <Router>
            <LoginPage />
        </Router>
    );

    // Enter credentials
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Assert the default error message
    const errorMessage = await screen.findByText('Incorrect username or password.');
    expect(errorMessage).toBeInTheDocument();
});

test('displays "Network error" message for TypeError in catch block', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new TypeError('Network error')));

    render(
        <Router>
            <LoginPage />
        </Router>
    );

    // Enter credentials
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Assert the network error message
    const errorMessage = await screen.findByText(
        'Network error. Please check your connection and try again.'
    );
    expect(errorMessage).toBeInTheDocument();
});

test('displays fallback error message for non-TypeError in catch block', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Unexpected error')));

    render(
        <Router>
            <LoginPage />
        </Router>
    );

    // Enter credentials
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Assert the fallback error message
    const errorMessage = await screen.findByText('Incorrect username or password.');
    expect(errorMessage).toBeInTheDocument();
});
