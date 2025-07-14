module.exports = {
    setupFilesAfterEnv: ['<rootDir>/src/test/jest.setup.js'],
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
    },
    testMatch: ['**/*.test.jsx', '**/*.test.js', '**/*.test.ts', '**/*.test.tsx'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    verbose: true
};
