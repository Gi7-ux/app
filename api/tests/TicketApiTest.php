<?php
use PHPUnit\Framework\TestCase;
use GuzzleHttp\Client;
use Firebase\JWT\JWT;

// Ensure config is loaded. Adjust path as necessary if this file moves.
require_once __DIR__ . '/../core/config.php';

class TicketApiTest extends TestCase
{
    private $client;
    private $adminToken;
    private $clientToken;
    private $testAdmin;
    private $testClientUser;
    private $createdTicketIds = [];
    private $createdUserIds = [];

    protected function setUp(): void
    {
        $this->client = new Client([
            'base_uri' => 'http://localhost:8000/api/', // Adjusted base_uri to include /api/
            'http_errors' => false, // To handle HTTP errors manually
            'debug' => false, // Set to true for verbose Guzzle output
        ]);

        // Test Admin User (assuming user with ID 1 is an admin, or create one)
        $this->testAdmin = ['id' => 1, 'role' => 'admin']; // Simplified for token generation
        $adminPayload = [
            'iss' => 'YOUR_DOMAIN.com', 'aud' => 'THE_AUDIENCE', 'iat' => time(), 'nbf' => time(), 'exp' => time() + 3600,
            'data' => ['id' => $this->testAdmin['id'], 'role' => $this->testAdmin['role']]
        ];
        $this->adminToken = JWT::encode($adminPayload, JWT_SECRET, 'HS256');

        // Create a new client user for testing
        $clientUserData = [
            'name' => 'Test Ticket Client',
            'email' => 'ticketclient@example.com',
            'password' => 'password123',
            'role' => 'client',
            'company' => 'Ticket Testers Inc.',
            'phone' => '1230001111'
        ];

        // Register the client user (requires admin privileges or an open registration endpoint)
        // Assuming direct user creation for testing or an admin-created user.
        // For simplicity, let's assume an admin creates this user.
        // If your /users/create.php is admin-only, use adminToken.
        // If it's open, no token or a specific registration endpoint.
        $response = $this->client->post('users/create.php', [ // Endpoint relative to base_uri
            'headers' => ['Authorization' => 'Bearer ' . $this->adminToken],
            'json' => $clientUserData
        ]);

        $responseBody = (string) $response->getBody();
        $this->assertEquals(201, $response->getStatusCode(), "Failed to create test client user: " . $responseBody);
        $clientData = json_decode($responseBody, true);
        $this->testClientUser = array_merge($clientUserData, ['id' => $clientData['id']]);
        $this->createdUserIds[] = $clientData['id'];


        // Generate token for the new client user
        $clientPayload = [
            'iss' => 'YOUR_DOMAIN.com', 'aud' => 'THE_AUDIENCE', 'iat' => time(), 'nbf' => time(), 'exp' => time() + 3600,
            'data' => ['id' => $this->testClientUser['id'], 'name' => $this->testClientUser['name'], 'email' => $this->testClientUser['email'], 'role' => $this->testClientUser['role']]
        ];
        $this->clientToken = JWT::encode($clientPayload, JWT_SECRET, 'HS256');
    }

    protected function tearDown(): void
    {
        // Delete tickets created during tests
        foreach ($this->createdTicketIds as $ticketId) {
            $this->client->delete('tickets/delete.php', [ // Relative to base_uri
                'headers' => ['Authorization' => 'Bearer ' . $this->adminToken],
                'json' => ['ticket_id' => $ticketId]
            ]);
        }
        $this->createdTicketIds = [];

        // Delete users created during tests
        foreach ($this->createdUserIds as $userId) {
            $this->client->delete('users/delete.php', [ // Relative to base_uri
                'headers' => ['Authorization' => 'Bearer ' . $this->adminToken],
                'json' => ['id' => $userId]
            ]);
        }
        $this->createdUserIds = [];
    }

    public function testCreateTicketSuccessfullyAsClient()
    {
        $ticketData = [
            'title' => 'Test Ticket from Client',
            'description' => 'This is a test ticket description submitted by a client.',
            'category' => 'GENERAL_INQUIRY', // Valid category
            'priority' => 'Medium'
        ];

        $response = $this->client->post('tickets/create.php', [ // Relative to base_uri
            'headers' => [
                'Authorization' => 'Bearer ' . $this->clientToken,
                'Content-Type' => 'application/json'
            ],
            'json' => $ticketData
        ]);

        $responseBody = (string) $response->getBody();
        $this->assertEquals(201, $response->getStatusCode(), "Failed to create ticket: " . $responseBody);
        $data = json_decode($responseBody, true);

        $this->assertArrayHasKey('ticket_id', $data);
        $this->assertArrayHasKey('message', $data);
        $this->assertEquals('Ticket created successfully.', $data['message']);
        $this->assertEquals($ticketData['title'], $data['title']);
        $this->assertEquals($this->testClientUser['id'], $data['user_id']);

        // Add created ticket ID for cleanup
        if (isset($data['ticket_id'])) {
            $this->createdTicketIds[] = $data['ticket_id'];
        }
    }

    public function testCreateTicketMissingTitle()
    {
        $ticketData = [
            // 'title' => 'Missing Title Test', // Title is missing
            'description' => 'Description for a ticket with a missing title.',
            'category' => 'TECHNICAL_ISSUE',
            'priority' => 'High'
        ];

        $response = $this->client->post('tickets/create.php', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->clientToken,
                'Content-Type' => 'application/json'
            ],
            'json' => $ticketData
        ]);

        $responseBody = (string) $response->getBody();
        $this->assertEquals(400, $response->getStatusCode(), "Request should fail due to missing title: " . $responseBody);
        $data = json_decode($responseBody, true);
        $this->assertArrayHasKey('message', $data);
        $this->assertEquals('Unable to create ticket. Title, description, and category are required.', $data['message']);
    }

    public function testCreateTicketInvalidCategory()
    {
        $ticketData = [
            'title' => 'Invalid Category Test',
            'description' => 'This ticket has an invalid category.',
            'category' => 'NON_EXISTENT_CATEGORY',
            'priority' => 'Low'
        ];

        $response = $this->client->post('tickets/create.php', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->clientToken,
                'Content-Type' => 'application/json'
            ],
            'json' => $ticketData
        ]);

        $responseBody = (string) $response->getBody();
        $this->assertEquals(400, $response->getStatusCode(), "Request should fail due to invalid category: " . $responseBody);
        $data = json_decode($responseBody, true);
        $this->assertArrayHasKey('message', $data);
        $this->assertEquals('Invalid category provided.', $data['message']);
    }

    // TODO: Add more tests:
    // - testReadTicketsAsClient (should only see their own)
    // - testReadTicketsAsAdmin (should see all tickets, including the client's)
    // - testUpdateTicketAsAdmin (status, priority)
    // - testUpdateTicketAsNonAdmin (should fail with 403)
    // - testDeleteTicketAsAdmin
    // - testDeleteTicketAsNonAdmin (should fail with 403)
    // - testCreateTicketUnauthenticated (should fail with 401)
}
?>
