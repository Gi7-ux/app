# Changelog

All notable changes to this project will be documented in this file.

## 2025-07-02

### Added
- Created the initial PHP backend directory structure in `app/api`.
- Created `schema.sql` with the initial database schema for users, projects, skills, assignments, tasks, messages, and files.
- Created `core/config.php` for database and JWT configuration.
- Created `core/database.php` for handling the database connection.
- Added `firebase/php-jwt` dependency for handling JSON Web Tokens.
- Implemented the `/auth/login.php` endpoint for user authentication. It validates user credentials and returns a JWT upon successful login.
- Implemented the `/users/read.php` endpoint to get all users. This endpoint is protected and only accessible by admin users. It also retrieves the skills for each user.
- Implemented the `/users/create.php` endpoint to create a new user. This endpoint is protected and only accessible by admin users.
- Implemented the `/users/update.php` endpoint to update a user. This endpoint is protected and accessible by admin users or the user themselves.
- Implemented the `/users/delete.php` endpoint to delete a user. This endpoint is protected and only accessible by admin users.
- Implemented the `/projects/read.php` endpoint to get all projects. This endpoint is protected and accessible by any authenticated user.
- Implemented the `/projects/create.php` endpoint to create a new project. This endpoint is protected and only accessible by admin users.
- Implemented the `/projects/update.php` endpoint to update a project. This endpoint is protected and only accessible by admin users.
- Implemented the `/projects/delete.php` endpoint to delete a project. This endpoint is protected and only accessible by admin users.
- Implemented the `/dashboard/stats.php` endpoint to get key metrics for each role's dashboard.
- Implemented the `/timelogs/create.php` endpoint for freelancers to log their time.
- Implemented the `/timelogs/read.php` endpoint for admins to retrieve all time logs.
- Implemented the `/messages/get_threads.php` endpoint to fetch all message threads for a user.
- Implemented the `/messages/get_messages.php` endpoint to fetch messages for a specific thread, with role-based visibility.
- Implemented the `/messages/send_message.php` endpoint to send messages, with automatic status assignment for freelancers.
- Implemented the `/messages/moderate_message.php` endpoint for admins to approve or reject messages.
- Implemented the `/files/upload.php` endpoint to handle file uploads.
- Implemented the `/files/get_files.php` endpoint to retrieve files for a project.
- Implemented the `/files/delete.php` endpoint for admins to delete files.
- Implemented the `/billing/generate_invoice_data.php` endpoint to fetch data for generating invoices.
- Implemented the `/reports/freelancer_performance.php` endpoint.
- Implemented the `/reports/project_status.php` endpoint.
- Implemented the `/reports/client_summary.php` endpoint.
- Implemented the `/projects/read_one.php` endpoint to get all details for a single project.
