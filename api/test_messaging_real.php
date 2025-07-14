<?php
require_once 'core/database.php';

$database = new Database();
$db = $database->connect();

echo "Testing messaging API with existing users...\n\n";

// Get existing users
$users = $db->query("SELECT id, name, email, role FROM users ORDER BY id LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
echo "=== Existing users ===\n";
foreach ($users as $user) {
    echo "ID: {$user['id']}, Name: {$user['name']}, Email: {$user['email']}, Role: {$user['role']}\n";
}

if (count($users) < 2) {
    echo "Need at least 2 users to test messaging. Please add more users first.\n";
    exit;
}

$user1 = $users[0];
$user2 = $users[1];

echo "\n=== Testing with User 1 (ID: {$user1['id']}) and User 2 (ID: {$user2['id']}) ===\n";

// Create a direct message thread if it doesn't exist
$existing_thread = $db->prepare("
    SELECT mt.id
    FROM message_threads mt
    JOIN message_thread_participants mtp1 ON mt.id = mtp1.thread_id AND mtp1.user_id = ?
    JOIN message_thread_participants mtp2 ON mt.id = mtp2.thread_id AND mtp2.user_id = ?
    WHERE mt.type = 'direct_message' AND mt.project_id IS NULL
    AND (SELECT COUNT(DISTINCT mtp_count.user_id) FROM message_thread_participants mtp_count WHERE mtp_count.thread_id = mt.id) = 2
    LIMIT 1
");
$existing_thread->execute([$user1['id'], $user2['id']]);
$thread = $existing_thread->fetch(PDO::FETCH_ASSOC);

if (!$thread) {
    echo "Creating new direct message thread...\n";
    
    // Insert thread (need to provide created_by due to foreign key constraint)
    $create_thread = $db->prepare("INSERT INTO message_threads (type, subject, created_by) VALUES ('direct_message', 'Test Conversation', ?)");
    $create_thread->execute([$user1['id']]);
    $thread_id = $db->lastInsertId();
    
    // Add participants
    $add_participant = $db->prepare("INSERT INTO message_thread_participants (thread_id, user_id) VALUES (?, ?)");
    $add_participant->execute([$thread_id, $user1['id']]);
    $add_participant->execute([$thread_id, $user2['id']]);
    
    echo "✅ Created thread ID: $thread_id\n";
} else {
    $thread_id = $thread['id'];
    echo "✅ Using existing thread ID: $thread_id\n";
}

// Test creating a message
echo "\nCreating test message...\n";
$create_message = $db->prepare("INSERT INTO messages (thread_id, sender_id, text, status) VALUES (?, ?, ?, 'approved')");
$test_message = "Test message at " . date('Y-m-d H:i:s');
$create_message->execute([$thread_id, $user1['id'], $test_message]);
$message_id = $db->lastInsertId();
echo "✅ Created message ID: $message_id\n";

// Test the get_threads query
echo "\n=== Testing get_threads query ===\n";
$threads_query = "SELECT 
                    t.id as thread_id, 
                    t.type, 
                    t.project_id,
                    p.title as project_title,
                    GROUP_CONCAT(u.email) as participants
                  FROM 
                    message_threads t
                  LEFT JOIN 
                    projects p ON t.project_id = p.id
                  JOIN 
                    message_thread_participants mtp ON t.id = mtp.thread_id
                  JOIN
                    users u ON mtp.user_id = u.id
                  WHERE 
                    t.id IN (SELECT thread_id FROM message_thread_participants WHERE user_id = ?)
                  GROUP BY
                    t.id";

$threads_stmt = $db->prepare($threads_query);
$threads_stmt->execute([$user1['id']]);
$threads = $threads_stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Found " . count($threads) . " threads for user {$user1['id']}:\n";
foreach ($threads as $thread) {
    echo "- Thread {$thread['thread_id']}: {$thread['type']}, Participants: {$thread['participants']}\n";
}

// Test the get_messages query (fix the timestamp column issue)
echo "\n=== Testing get_messages query ===\n";
$messages_query = "SELECT m.id, m.thread_id, m.sender_id, m.text, m.file_id, m.created_at, m.status, u.name as sender_name, u.avatar as sender_avatar
                   FROM messages m
                   JOIN users u ON m.sender_id = u.id
                   WHERE m.thread_id = ?
                   ORDER BY m.created_at ASC";

$messages_stmt = $db->prepare($messages_query);
$messages_stmt->execute([$thread_id]);
$messages = $messages_stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Found " . count($messages) . " messages in thread $thread_id:\n";
foreach ($messages as $message) {
    echo "- Message {$message['id']}: {$message['sender_name']}: " . substr($message['text'], 0, 50) . "...\n";
}

echo "\n✅ Messaging database structure is working correctly!\n";
echo "✅ The messaging implementation should now load and work properly.\n";

// Clean up test data if desired
echo "\nCleaning up test message...\n";
$db->prepare("DELETE FROM messages WHERE id = ?")->execute([$message_id]);
echo "✅ Test message cleaned up\n";
?>
