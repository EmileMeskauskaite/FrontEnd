import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';
import MainPage from '../src/MainPage';
import { act } from '@testing-library/react';


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

beforeEach(() => {
    const localStorageMock = (() => {
        let store = {};
        return {
            getItem: jest.fn((key) => store[key] || null),
            setItem: jest.fn((key, value) => {
                store[key] = value.toString();
            }),
            removeItem: jest.fn((key) => {
                delete store[key];
            }),
            clear: jest.fn(() => {
                store = {};
            }),
        };
    })();

    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
    });
});


// Clear mocks after each test
afterEach(() => {
    jest.clearAllMocks();
});



test('fetches and displays market data', async () => {
    // Mock fetch for market data
    global.fetch = jest.fn((url) => {
        if (url.includes('/api/marketdata/getallcompanies')) {
            return Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve([
                        { id: 'AAPL', name: 'Apple' },
                        { id: 'GOOG', name: 'Google' },
                    ]),
            });
        } else if (url.includes('/api/marketdata/marketdata/getcompanylivepricedistinct')) {
            const companyId = new URL(url).searchParams.get('symbols');
            const prices = {
                AAPL: [{ price: 150 }],
                GOOG: [{ price: 2800 }],
            };
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(prices[companyId] || []),
            });
        }
        return Promise.reject(new Error('Unknown API call'));
    });

    render(
        <Router>
            <MainPage />
        </Router>
    );

    // Wait for market data to load
    await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Stock price: $150')).toBeInTheDocument();
        expect(screen.getByText('Google')).toBeInTheDocument();
        expect(screen.getByText('Stock price: $2800')).toBeInTheDocument();
    });
});

test('filters market data based on search query', async () => {
    // Mock fetch for market data
    global.fetch = jest.fn((url) => {
        if (url.includes('/api/marketdata/getallcompanies')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    { id: 'AAPL', name: 'Apple', stockIndex: 150 },
                    { id: 'GOOG', name: 'Google', stockIndex: 2800 },
                ]),
            });
        }
        return Promise.reject(new Error('Unknown API call'));
    });

    render(
        <Router>
            <MainPage />
        </Router>
    );

    // Wait for market data to load
    await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Google')).toBeInTheDocument();
    });

    // Simulate a search query
    const searchInput = screen.getByPlaceholderText('Search by stock name or symbol...');
    fireEvent.change(searchInput, { target: { value: 'Google' } });

    // Check if only "Google" appears
    await waitFor(() => {
        expect(screen.getByText('Google')).toBeInTheDocument();
        expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
});


test('loads more companies when "Load More Companies" is clicked', async () => {
    // Mock fetch for market data with more companies
    global.fetch = jest.fn((url) => {
        if (url.includes('/api/marketdata/getallcompanies')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(
                    Array.from({ length: 12 }, (_, i) => ({
                        id: `COMP${i}`,
                        name: `Company ${i}`,
                        stockIndex: (i + 1) * 100,
                    }))
                ),
            });
        }
        return Promise.reject(new Error('Unknown API call'));
    });

    render(
        <Router>
            <MainPage />
        </Router>
    );

    // Wait for initial 6 companies to load
    await waitFor(() => {
        expect(screen.getByText('Company 0')).toBeInTheDocument();
        expect(screen.getByText('Company 5')).toBeInTheDocument();
    });

    // Simulate clicking "Load More Companies"
    fireEvent.click(screen.getByText('Load More Companies'));

    // Wait for additional companies to load
    await waitFor(() => {
        expect(screen.getByText('Company 6')).toBeInTheDocument();
        expect(screen.getByText('Company 11')).toBeInTheDocument();
    });
});


test('logs out and navigates to login page', () => {
    // Mock user data in localStorage
    localStorage.setItem(
        'userData',
        JSON.stringify({
            id: 1,
            firstName: 'John',
        })
    );

    render(
        <Router>
            <MainPage />
        </Router>
    );

    // Click the logout button
    fireEvent.click(screen.getByText('Sign Out'));

    // Verify that userData is removed and navigation occurs
    expect(localStorage.getItem('userData')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/', { state: { logout: true } });
});
test('navigates to the company page when a company is clicked', async () => {
    // Mock fetch for market data
    global.fetch = jest.fn((url) => {
        if (url.includes('/api/marketdata/getallcompanies')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    { id: 'AAPL', name: 'Apple', stockIndex: 150 },
                    { id: 'GOOG', name: 'Google', stockIndex: 2800 },
                ]),
            });
        }
        return Promise.reject(new Error('Unknown API call'));
    });

    await act(async () => {
        render(
            <Router>
                <MainPage />
            </Router>
        );
    });

    // Wait for market data to load
    await act(async () => {
        await waitFor(() => {
            expect(screen.getByText('Apple')).toBeInTheDocument();
            expect(screen.getByText('Google')).toBeInTheDocument();
        });
    });

    // Simulate clicking "Apple" company
    await act(async () => {
        fireEvent.click(screen.getByText('Apple'));
    });

    // Verify that navigation occurs with correct path and state
    expect(mockNavigate).toHaveBeenCalledWith('/stock/AAPL', {
        state: {
            companyName: 'Apple',
            stockName: 'AAPL',
        },
    });
});

test('navigates to the company page when a company is clicked', async () => {
    // Mock fetch for market data
    global.fetch = jest.fn((url) => {
        if (url.includes('/api/marketdata/getallcompanies')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    { id: 'AAPL', name: 'Apple', stockIndex: 150 },
                    { id: 'GOOG', name: 'Google', stockIndex: 2800 },
                ]),
            });
        }
        return Promise.reject(new Error('Unknown API call'));
    });

    await act(async () => {
        render(
            <Router>
                <MainPage />
            </Router>
        );
    });

    // Wait for market data to load
    await act(async () => {
        await waitFor(() => {
            expect(screen.getByText('Apple')).toBeInTheDocument();
            expect(screen.getByText('Google')).toBeInTheDocument();
        });
    });

    // Simulate clicking "Apple" company
    await act(async () => {
        fireEvent.click(screen.getByText('Apple'));
    });

    // Verify that navigation occurs with correct path and state
    expect(mockNavigate).toHaveBeenCalledWith('/stock/AAPL', {
        state: {
            companyName: 'Apple',
            stockName: 'AAPL',
        },
    });
});
test('calculates the total value of user portfolio stocks', () => {
    // Mock user data in localStorage with portfolio stocks
    const userData = {
        userPortfolioStocks: [
            { currentTotalValue: 1000 },
            { currentTotalValue: 2000 },
            { currentTotalValue: 1500 },
        ],
    };
    localStorage.setItem('userData', JSON.stringify(userData));

    render(
        <Router>
            <MainPage />
        </Router>
    );

    // Calculate the total value
    const totalValue = userData.userPortfolioStocks.reduce((sum, stock) => sum + stock.currentTotalValue, 0);

    // Verify the total value is correct
    expect(totalValue).toBe(4500);
});
test('throws an error when fetching user profile fails', async () => {
    // Mock fetch to simulate a failed response
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: false,
            status: 404,
        })
    );

    try {
        await fetch('/api/user/profile');
    } catch (error) {
        expect(error).toEqual(new Error('Failed to fetch user profile: 404'));
    }
});

test('returns response when fetching user profile succeeds', async () => {
    const mockResponse = { id: 1, name: 'John Doe' };

    // Mock fetch to simulate a successful response
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockResponse),
        })
    );

    const response = await fetch('/api/user/profile');
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toEqual(mockResponse);
});
test('calculates the total portfolio value correctly', () => {
    // Mock user data in localStorage with portfolio stocks
    const userData = {
        userPortfolioStocks: [
            { currentTotalValue: 1000 },
            { currentTotalValue: 2000 },
            { currentTotalValue: 1500 },
        ],
    };
    localStorage.setItem('userData', JSON.stringify(userData));

    render(
        <Router>
            <MainPage />
        </Router>
    );

    // Calculate the total portfolio value
    const totalPortfolioValue = userData.userPortfolioStocks
        ? userData.userPortfolioStocks.reduce(
              (sum, stock) => sum + (stock.currentTotalValue || 0),
              0
          )
        : 0;

    // Verify the total portfolio value is correct
    expect(totalPortfolioValue).toBe(4500);
});

test('calculates the total portfolio value as 0 when no stocks are present', () => {
    // Mock user data in localStorage with no portfolio stocks
    const userData = {
        userPortfolioStocks: [],
    };
    localStorage.setItem('userData', JSON.stringify(userData));

    render(
        <Router>
            <MainPage />
        </Router>
    );

    // Calculate the total portfolio value
    const totalPortfolioValue = userData.userPortfolioStocks
        ? userData.userPortfolioStocks.reduce(
              (sum, stock) => sum + (stock.currentTotalValue || 0),
              0
          )
        : 0;

    // Verify the total portfolio value is 0
    expect(totalPortfolioValue).toBe(0);
});

test('calculates the total portfolio value correctly when some stocks have no value', () => {
    // Mock user data in localStorage with some stocks having no value
    const userData = {
        userPortfolioStocks: [
            { currentTotalValue: 1000 },
            { currentTotalValue: null },
            { currentTotalValue: 1500 },
        ],
    };
    localStorage.setItem('userData', JSON.stringify(userData));

    render(
        <Router>
            <MainPage />
        </Router>
    );

    // Calculate the total portfolio value
    const totalPortfolioValue = userData.userPortfolioStocks
        ? userData.userPortfolioStocks.reduce(
              (sum, stock) => sum + (stock.currentTotalValue || 0),
              0
          )
        : 0;

    // Verify the total portfolio value is correct
    expect(totalPortfolioValue).toBe(2500);
});

test('displays welcome message with user first name', () => {
    const userData = { id: 1, firstName: 'John' };
    localStorage.setItem('userData', JSON.stringify(userData));

    render(
        <Router>
            <MainPage />
        </Router>
    );

    expect(screen.getByText('Welcome, John!')).toBeInTheDocument();
});

test('displays welcome message with "User" when no user data', () => {
    render(
        <Router>
            <MainPage />
        </Router>
    );

    expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
});

test('navigates to profile page on "Edit Profile" click', () => {
    const userData = { id: 1, firstName: 'John' };
    localStorage.setItem('userData', JSON.stringify(userData));

    render(
        <Router>
            <MainPage />
        </Router>
    );

    fireEvent.click(screen.getByText('Edit Profile'));

    expect(mockNavigate).toHaveBeenCalledWith('/profile', { state: { userData } });
});

test('navigates to portfolio page on "My Portfolio" click', () => {
    const userData = { id: 1, firstName: 'John' };
    localStorage.setItem('userData', JSON.stringify(userData));

    render(
        <Router>
            <MainPage />
        </Router>
    );

    fireEvent.click(screen.getByText('My Portfolio'));

    expect(mockNavigate).toHaveBeenCalledWith('/my-portfolio', { state: { userData } });
});

