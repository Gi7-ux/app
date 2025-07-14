# System Patterns

## Architecture Overview

### Frontend Architecture
- **Component-Based Design**: React 19 with functional components and hooks
- **Feature-Driven Structure**: Organized by business features (Dashboard, Messages, ProjectManagement, etc.)
- **Service Layer**: Centralized authentication and API management
- **Routing**: React Router with protected routes and role-based access

### Backend Architecture
- **RESTful API Design**: PHP endpoints organized by feature domains
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Database Layer**: MySQL with comprehensive foreign key relationships
- **Migration System**: Structured database schema management

## Key Design Patterns

### Frontend Patterns

#### Component Architecture
- **Container/Presentational Pattern**: Smart containers manage state, dumb components handle presentation
- **HOC for Authentication**: ProtectedRoute wrapper for secure route access
- **Service Pattern**: AuthService centralizes authentication logic
- **Context Pattern**: Application-wide state management

#### UI/UX Patterns
- **Liquid Glass Design System**: Consistent glass morphism components via LiquidGlassWrapper
- **Variant System**: Configurable component variants (primary, secondary, card, button, navigation, modal)
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Theme Integration**: CSS custom properties for consistent styling

### Backend Patterns

#### API Design
- **Resource-Based Endpoints**: RESTful structure (/api/{resource}/{action}.php)
- **Consistent Response Format**: Standardized JSON responses with error handling
- **Authentication Middleware**: JWT token validation across protected endpoints
- **Role-Based Access Control**: User role verification for endpoint access

#### Database Patterns
- **Foreign Key Relationships**: Comprehensive referential integrity
- **Soft Deletes**: Cascading deletes with NULL references where appropriate
- **Timestamps**: Created/updated tracking across entities
- **Migration-Based Schema**: Version-controlled database changes

## Component Relationships

### Core Application Flow
```
App.jsx (Router)
├── LoginScreen.jsx (Authentication)
├── Dashboard.jsx (Main Container)
│   ├── DashboardOverview.jsx (Statistics)
│   ├── Messages/MessagingContainer.jsx (Communication)
│   ├── ProjectManagement.jsx (Project Handling)
│   ├── UserManagement.jsx (Admin Panel)
│   └── Profile.jsx (User Settings)
└── Protected Routes (Role-based access)
```

### Messaging System Architecture
```
MessagingContainer.jsx (Main Controller)
├── ConversationList.jsx (Thread Navigation)
├── ChatWindow.jsx (Message Display)
├── AdminProjectSelector.jsx (Admin Tools)
└── API Integration
    ├── get_threads.php (Thread Management)
    ├── send_message.php (Message Creation)
    ├── get_messages.php (Message Retrieval)
    └── ensure_thread.php (Thread Creation)
```

## Critical Implementation Paths

### Authentication Flow
1. **Login Process**: Credentials → JWT tokens → Local storage → API headers
2. **Token Refresh**: Automatic refresh via refresh token cookies
3. **Route Protection**: AuthService validation on protected routes
4. **Logout Process**: Token cleanup + server-side invalidation

### Messaging Flow
1. **Thread Initialization**: Project assignment → Thread creation → Participant assignment
2. **Message Sending**: User input → Thread validation → Database storage → UI update
3. **Real-time Updates**: Polling/WebSocket integration for live messaging
4. **File Integration**: File upload → Message attachment → Secure download

### Project Management Flow
1. **Project Creation**: Client input → Database creation → Notification dispatch
2. **Freelancer Assignment**: Application process → Admin approval → Thread creation
3. **Progress Tracking**: Time logs → Status updates → Billing integration
4. **Completion Process**: Deliverable submission → Client approval → Payment processing

## Performance Patterns

### Frontend Optimization
- **Component Memoization**: React.memo for expensive components
- **Lazy Loading**: Code splitting for feature modules
- **Virtual Scrolling**: Efficient handling of large message lists
- **Image Optimization**: Lazy loading and responsive images

### Backend Optimization
- **Database Indexing**: Optimized queries for common operations
- **Caching Strategy**: API response caching where appropriate
- **File Handling**: Efficient upload/download with streaming
- **Query Optimization**: Minimal database calls per request

## Testing Patterns

### Frontend Testing
- **Vitest Configuration**: Modern testing framework with React 19 support
- **Component Testing**: @testing-library/react for user-centric tests
- **Service Testing**: AuthService and API integration tests
- **End-to-End Testing**: Puppeteer for complete user flows

### Backend Testing
- **PHPUnit Integration**: Unit tests for API endpoints
- **Database Testing**: Migration and schema validation tests
- **Authentication Testing**: JWT token validation and security tests
- **Integration Testing**: Complete API workflow validation

## Security Patterns

### Authentication Security
- **JWT Best Practices**: Short-lived access tokens + HttpOnly refresh tokens
- **Password Security**: Bcrypt hashing with appropriate cost factors
- **Token Validation**: Comprehensive token verification on each request
- **CORS Configuration**: Proper cross-origin request handling

### Data Security
- **Input Validation**: Comprehensive sanitization on all inputs
- **SQL Injection Prevention**: Prepared statements across all queries
- **File Upload Security**: Type validation and secure storage
- **Role-Based Access**: Granular permission checking

**2025-07-13 00:29:11**: Comprehensive system patterns analysis completed based on full codebase review, documenting current architecture, design patterns, and critical implementation paths.
