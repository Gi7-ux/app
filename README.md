# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Features

This application includes a comprehensive freelance platform with the following key features:

### User Roles
- **Admin:** Oversees the platform, manages users, projects, and can broadcast messages.
- **Client:** Posts projects, hires freelancers, manages their projects, and communicates with admins and assigned freelancers.
- **Freelancer:** Applies for projects, works on assigned projects, tracks time, and communicates within project contexts.

### Project Management
- Clients can create and manage projects.
- Freelancers can apply for and be assigned to projects.
- Task tracking and status updates within projects.

### Enhanced Messaging System
The platform features a robust messaging system with the following capabilities:
- **Project-Specific Messaging:** Conversations are organized by project, allowing clients, assigned freelancers, and admins to communicate effectively within the context of each project.
- **Client-Admin Communication:** Clients can directly message administrators regarding their projects for support or queries.
- **Admin-Freelancer Communication:** Admins can directly message freelancers.
- **Controlled Freelancer Involvement:** Admins can add freelancers to client-admin conversations when necessary, ensuring focused communication.
- **Admin Broadcasts:**
    - **System-Wide:** Admins can send broadcast messages to all active users.
    - **Per-Project:** Admins can send announcements to all participants of a specific project.
    - **Targeted:** Admins can send messages to specific individual users or groups of users.
- **Message Moderation:** Admins have the ability to moderate messages where applicable (e.g., approving messages from freelancers in certain contexts before they are visible to clients).
- **Real-time Notifications:** Users receive notifications for new messages.

### Project File Management
- **Per-Project Uploads:** Clients, assigned freelancers, and admins can upload files directly to specific projects.
- **Centralized File Access:** All files related to a project are accessible within the project's dedicated "Files" section.
- **Secure Downloads:** Files can be securely downloaded by authorized project participants.
- **File-Message Association (Optional):** Files can be directly associated with messages sent within the messaging system.

### Billing & Reporting
- Time tracking for freelancers.
- Invoice generation capabilities.
- Various reports for platform activity and performance.

## API Overview (Key New Endpoints)

The backend API has been updated to support the new features. Key new or modified endpoints include:

**Messaging:**
- `POST /api/messages/send_message.php`: Send messages (handles project context, direct messages, thread creation).
- `GET /api/messages/get_messages.php`: Retrieve messages (supports project ID or thread ID).
- `POST /api/messages/ensure_thread.php`: Get or create a specific communication thread.
- `POST /api/messages/add_participant.php`: Admin adds a user to a thread.
- `POST /api/messages/moderate_message.php`: Admin moderates a message.
- `POST /api/broadcasts/send_broadcast.php`: Admin sends a broadcast message.
- `GET /api/messages/get_threads.php`: Get all message threads for a user.

**Files:**
- `POST /api/files/upload.php`: Upload files to a project (supports optional message association).
- `GET /api/files/get_files.php`: List files for a project.
- `GET /api/files/download_file.php?id={file_id}`: Download a specific file.

**Notifications:**
- `GET /api/notifications/get.php`: Get user notifications.
- `POST /api/notifications/mark_read.php`: Mark notifications as read.

(Refer to individual API files for detailed request/response structures.)
