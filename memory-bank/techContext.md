# Tech Context

## Core Technology Stack

### Frontend Technologies
- **React 19.1.0**: Latest React with concurrent features and improved performance
- **Vite 6.2.0**: Modern build tool with HMR and optimized development experience
- **React Router DOM 7.6.3**: Client-side routing with protected route patterns
- **Material-UI 7.2.0**: Component library for consistent UI elements
- **Liquid Glass React 1.1.1**: Custom glass morphism design system implementation

### Backend Technologies
- **PHP 8+**: Modern PHP with type declarations and improved performance
- **MySQL**: Relational database with comprehensive schema and foreign key relationships
- **JWT (JSON Web Tokens)**: Secure authentication with access/refresh token pattern
- **Composer**: Dependency management for PHP packages

### Development Tools
- **ESLint**: Code quality and consistency enforcement
- **Vitest 3.2.4**: Modern testing framework with Jest compatibility
- **Puppeteer**: End-to-end testing and browser automation
- **Concurrently**: Parallel development server management

## Technical Architecture

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
│   ├── LiquidGlassWrapper.jsx    # Glass morphism wrapper
│   ├── LiquidGlassComponents.jsx # Pre-built glass components
│   └── NotificationBell.jsx      # Notification system
├── core/               # Core application logic
│   ├── App.jsx        # Main application router
│   ├── Dashboard.jsx  # Main dashboard container
│   └── LoginScreen.jsx # Authentication interface
├── features/          # Feature-specific modules
│   ├── Messages/      # Messaging system
│   ├── ProjectManagement/ # Project handling
│   ├── UserManagement/    # User administration
│   └── Dashboard/     # Dashboard components
├── services/          # API and business logic
│   └── AuthService.js # Authentication management
├── styles/            # Global styling and themes
│   ├── global.css     # CSS custom properties
│   └── liquidGlass.css # Glass morphism styles
└── utils/             # Utility functions
```

### Backend Architecture
```
api/
├── auth/              # Authentication endpoints
│   ├── login.php      # User authentication
│   ├── refresh.php    # Token refresh
│   └── logout.php     # Session termination
├── messages/          # Messaging system APIs
│   ├── send_message.php    # Message creation
│   ├── get_messages.php    # Message retrieval
│   ├── get_threads.php     # Thread management
│   └── ensure_thread.php   # Thread creation
├── projects/          # Project management APIs
├── users/             # User management APIs
├── files/             # File upload/download
├── core/              # Core utilities
│   ├── config.php     # Configuration management
│   ├── database.php   # Database connection
│   └── utils.php      # Utility functions
└── migrations/        # Database schema management
```

## Development Environment

### Server Configuration
- **Vite Development Server**: `localhost:5173` with HMR
- **PHP Built-in Server**: `localhost:8000` serving API endpoints
- **Proxy Configuration**: `/api/*` → `http://localhost:8000/*` with path rewriting
- **Concurrent Execution**: Both servers running simultaneously via npm start

### Database Setup
- **MySQL Database**: `axis-java.db` with comprehensive schema
- **Migration System**: Version-controlled schema updates in `/api/migrations/`
- **Foreign Key Relationships**: Referential integrity across all entities
- **Test Data**: Sample users, projects, and messages for development

### Authentication Configuration
- **JWT Implementation**: 
  - Access tokens: Short-lived (15 minutes), stored in localStorage
  - Refresh tokens: Long-lived (7 days), HttpOnly cookies
  - Automatic refresh: Transparent token renewal
- **Default Credentials**: `admin@architex.co.za` / `password`
- **Role System**: Admin, Client, Freelancer with granular permissions

## Key Technical Patterns

### Frontend Patterns
- **Component Composition**: LiquidGlassWrapper with variant system
- **Service Layer**: AuthService for centralized authentication logic
- **Protected Routes**: HOC pattern for route access control
- **State Management**: Local state with hooks, context for global state
- **Error Handling**: Consistent error boundaries and user feedback

### Backend Patterns
- **RESTful API Design**: Resource-based endpoints with HTTP verbs
- **Authentication Middleware**: JWT validation on protected endpoints
- **Database Abstraction**: PDO with prepared statements
- **Error Response Format**: Consistent JSON error responses
- **File Handling**: Secure upload/download with type validation

### Database Patterns
- **Messaging Schema**: 
  - `message_threads`: Thread metadata and project associations
  - `message_thread_participants`: User-thread relationships
  - `messages`: Individual messages with file attachments
- **User Management**: Role-based access with foreign key relationships
- **File Management**: Project-associated files with secure access control
- **Audit Trail**: Created/updated timestamps across all entities

## Performance Optimizations

### Frontend Performance
- **Component Memoization**: React.memo for expensive renders
- **Lazy Loading**: Dynamic imports for feature modules
- **Bundle Optimization**: Vite's built-in code splitting
- **Asset Optimization**: Optimized images and static assets
- **Liquid Glass Performance**: Memoized variant configurations

### Backend Performance
- **Database Indexing**: Optimized queries for common operations
- **Connection Pooling**: Efficient database connection management
- **File Streaming**: Efficient large file handling
- **Response Caching**: Strategic caching for read-heavy operations

## Security Implementation

### Authentication Security
- **Password Hashing**: Bcrypt with appropriate cost factors
- **Token Security**: Short-lived access tokens, secure refresh tokens
- **CORS Configuration**: Proper cross-origin request handling
- **Input Validation**: Comprehensive sanitization across all endpoints

### Data Security
- **SQL Injection Prevention**: Prepared statements exclusively
- **File Upload Security**: Type validation and secure storage paths
- **Role-Based Access Control**: Granular permission checking
- **API Rate Limiting**: Protection against abuse (implementation planned)

## Testing Framework

### Frontend Testing
- **Vitest Configuration**: Modern testing with React 19 support
- **Component Testing**: @testing-library/react for user-centric tests
- **Coverage Reports**: Comprehensive test coverage tracking
- **Mock Strategy**: Service mocking for isolated component tests

### Backend Testing
- **PHPUnit Setup**: Unit tests for API endpoints
- **Database Testing**: Migration and schema validation
- **Integration Tests**: Complete API workflow validation
- **Security Testing**: Authentication and authorization verification

## Current Technical Status (2025-07-13)

### ✅ Completed Systems
- **Messaging System**: Fully functional with thread management and real-time messaging
- **Authentication**: JWT implementation with refresh token security
- **Liquid Glass UI**: Complete design system with 6 variants and responsive design
- **Database Schema**: Comprehensive schema with all necessary relationships
- **Development Environment**: Optimized dual-server setup with proxy configuration
- **Code Quality**: All linting issues resolved, clean workspace achieved

### 🔄 Active Development Areas
- **File Management**: Enhanced file upload/download with message integration
- **Notification System**: Real-time notification implementation
- **Payment Processing**: Enhanced billing and payment tracking
- **Performance Monitoring**: Application performance metrics
- **Mobile Responsiveness**: Enhanced mobile user experience

### 📋 Technical Debt
- **Testing Coverage**: Comprehensive test suite implementation needed
- **Error Monitoring**: Production error tracking and logging
- **API Documentation**: Comprehensive API documentation
- **Performance Profiling**: Database and application performance optimization
- **Security Audit**: Comprehensive security review and penetration testing

**2025-07-13 00:29:58**: Comprehensive technical context update based on full codebase analysis, reflecting current technology stack, architecture patterns, and development status.
