require('@testing-library/jest-dom');

import { mockLocalStorage } from './utils/test-utils.jsx';

// Mock OptimizedSquaresBackground to avoid canvas errors in JSDOM
jest.mock('../components/OptimizedSquaresBackground.jsx', () => ({
    OptimizedSquaresBackground: () => '<div data-testid="mock-optimized-squares-background"></div>'
}));

// Mock localStorage globally
Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage
});

// Mock window.alert and window.confirm
Object.defineProperty(window, 'alert', {
    value: jest.fn()
});

Object.defineProperty(window, 'confirm', {
    value: jest.fn(() => true)
});

// Mock window.location
Object.defineProperty(window, 'location', {
    value: {
        href: 'http://localhost:3000',
        origin: 'http://localhost:3000',
        pathname: '/',
        search: '',
        hash: ''
    },
    writable: true
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    // cleanup is automatically handled by @testing-library/react
    jest.clearAllMocks();
    mockLocalStorage.clear();
});
