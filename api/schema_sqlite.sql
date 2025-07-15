-- TIME LOGS TABLE
CREATE TABLE IF NOT EXISTS time_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    freelancer_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    hours_logged REAL NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'approved',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    FOREIGN KEY (freelancer_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users (id) ON DELETE CASCADE
);

-- PURCHASED HOURS TABLE
CREATE TABLE IF NOT EXISTS purchased_hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    hours_purchased REAL NOT NULL,
    purchase_date TEXT NOT NULL,
    amount REAL DEFAULT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users (id) ON DELETE CASCADE
);