module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/test/jest.setup.js'],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
    testMatch: ['**/*.test.jsx', '**/*.test.js', '**/*.test.ts', '**/*.test.tsx'],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
    },
    collectCoverage: true,
    coverageDirectory: 'coverage',
    verbose: true
};
