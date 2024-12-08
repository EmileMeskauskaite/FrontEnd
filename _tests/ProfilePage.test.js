import React from 'react';
import { render, screen, fireEvent, act, waitFor  } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ProfilePage from '../src/ProfilePage';
import '@testing-library/jest-dom';

beforeEach(() => {
    localStorage.setItem(
        'userData',
        JSON.stringify({
            dateOfBirth: "2024-11-05T00:00:00",
            email: "Emile@g.com",
            firstName: "John",
            id: 1,
            lastName: "Doe",
            password: "Test12345678",
            userName: "Test User"
            })
      );

      global.alert = jest.fn(); // Mock alert
      global.fetch = jest.fn((url, options) => {
        const params = new URLSearchParams(url.split('?')[1]);
        const id = params.get('id');
    
        if (!id) {
            return Promise.resolve({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ message: "Missing ID" }),
            });
        }
    
        return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
            Promise.resolve({
              id: 1,
              userId: 1,
              user: {
                id: 1,
                userName: 'Test User',
                password: 'string',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '2024-12-07T18:57:55.403Z',
                email: 'john.doe@example.com',
              },
              balance: 100,
              simulationLevel: 2,
              userTransactions: [
                {
                  id: 1,
                  userProfile: 'string',
                  transactionType: 1,
                  transactionStatus: 1,
                  company: {
                    id: 'string',
                    name: 'CompanyName',
                  },
                  transactionValue: 500,
                  stockValue: 50,
                  quantity: 10,
                  timeOfTransaction: '2024-12-07T18:57:55.403Z',
                },
              ],
              userPortfolioStocks: [
                {
                  id: 1,
                  userProfile: 'string',
                  company: {
                    id: 'string',
                    name: 'PortfolioCompany',
                  },
                  quantity: 5,
                  currentTotalValue: 250,
                  totalBaseValue: 200,
                  percentageChange: 25,
                  lastUpdated: '2024-12-07T18:57:55.403Z',
                },
              ],
            }),
        });
      });
});

afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
});

test('renders profile information from localStorage', async () => {
    render(
        <Router>
            <ProfilePage />
        </Router>
    );

    const usernameSpan = await screen.findByText('Test User');
    expect(usernameSpan).toBeInTheDocument();

    const firstNameSpan = await screen.findByText('John');
    expect(firstNameSpan).toBeInTheDocument();

    const lastNameSpan = await screen.findByText('Doe');
    expect(lastNameSpan).toBeInTheDocument();

    const difficulty = await screen.findByText('2');
    expect(difficulty).toBeInTheDocument();
});

test('displays error message when fetching user profile fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error');
    global.fetch = jest.fn(() => {
        return Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve({ message: 'Failed to fetch user profile' }),
        });
    });
    render(
        <Router>
            <ProfilePage />
        </Router>
    );

    await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          'Could not fetch user profile. Please try again later.'
        );
      });

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching user profile:', new Error('Failed to fetch user profile: 400'));  
    consoleSpy.mockRestore();
    
});

test('displays loading spinner when fetching user profile', async () => {
    render(
        <Router>
            <ProfilePage />
        </Router>
    );
    let loadingSpinner;
    await act(() => {
        loadingSpinner = screen.getByTestId('loading-spinner');
    })
    expect(loadingSpinner).toBeInTheDocument();
});

test('button is disabled when difficulty is not selected', async () => {
    const spyAlert = jest.spyOn(global, 'alert');
    
    render(
        <Router>
            <ProfilePage />
        </Router>
    );

    const restartButton = screen.getByRole('button', { name: /restart profile/i });

    await act(async () => {
        fireEvent.click(restartButton);
    });
    expect(restartButton).toBeDisabled();  // Ensure button is disabled initially
    expect(spyAlert).toHaveBeenCalledTimes(0);
    spyAlert.mockRestore();
});

test('clicking restart button triggers fetch call and alert', async () => {
    const spyAlert = jest.spyOn(global, 'alert').mockImplementation(() => {});

    render(
        <Router>
            <ProfilePage />
        </Router>
    );

    const easyButton = screen.getByText(/Easy \$10,000/i);
    await act(() => {
        fireEvent.click(easyButton);
    })

    const restartButton = screen.getByRole('button', { name: /restart profile/i });
    await act(async () => {
        // Click the restart button
        fireEvent.click(restartButton);
    });
    expect(restartButton).not.toBeDisabled();
    expect(global.fetch).toHaveBeenCalled();
    expect(spyAlert).toHaveBeenCalledWith('Profile successfully restarted.');
    
    spyAlert.mockRestore();
});

test('logs error when profile restart response is not OK', async () => {
    // Render the component
    render(
        <Router>
            <ProfilePage />
        </Router>
    );

    const mockFetch = jest.fn(() =>
        Promise.resolve({
            ok: false,
            status: 500, // Example HTTP status
        })
    );
    global.fetch = mockFetch;

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const easyButton = screen.getByText(/Easy \$10,000/i);
    await act(() => {
        fireEvent.click(easyButton);
    });

    const restartButton = screen.getByRole('button', { name: /restart profile/i });
    await act(() => {
        fireEvent.click(restartButton);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching user profile:', new Error('Failed to fetch user profile: 500'));

    consoleSpy.mockRestore();
    global.fetch.mockRestore();
});

test('logs error when fetch fails during profile restart', async () => {
    // Render the component
    render(
        <Router>
            <ProfilePage />
        </Router>
    );
    const mockFetch = jest.fn(() => Promise.reject(new Error('Network error')));
    global.fetch = mockFetch;

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const easyButton = screen.getByText(/Easy \$10,000/i);
    await act(() => {
        fireEvent.click(easyButton);
    });

    const restartButton = screen.getByRole('button', { name: /restart profile/i });
    expect(restartButton).not.toBeDisabled();
    // Assert the error was logged
    await waitFor(() => {
        fireEvent.click(restartButton);
    });
    expect(consoleSpy).toHaveBeenCalledWith('Error restarting profile:', expect.any(Error));
    consoleSpy.mockRestore();
    global.fetch.mockRestore();
});