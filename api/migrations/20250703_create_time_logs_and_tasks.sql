CREATE TABLE IF NOT EXISTS time_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    task_id INT NOT NULL,
    hours DECIMAL(5, 2) NOT NULL,
    log_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (project_id) REFERENCES projects (id),
    FOREIGN KEY (task_id) REFERENCES tasks (id)
);

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (project_id) REFERENCES projects (id)
);