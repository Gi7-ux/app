<?php
use PHPUnit\Framework\TestCase;
use GuzzleHttp\Client;
use Firebase\JWT\JWT;

require_once __DIR__ . '/../core/config.php';

class ProjectTest extends TestCase
{
    private $client;
    private $adminToken;
    private $testUser;
    private $testProjectId;

    protected function setUp(): void
    {
        $this->client = new Client([
            'base_uri' => 'http://localhost:8000',
            'http_errors' => false
        ]);

        // Generate a token for the admin user
        $payload = [
            'iss' => 'YOUR_DOMAIN.com',
            'aud' => 'THE_AUDIENCE',
            'iat' => time(),
            'nbf' => time(),
            'exp' => time() + 3600,
            'data' => [
                'id' => 1,
                'role' => 'admin'
            ]
        ];
        $this->adminToken = JWT::encode($payload, JWT_SECRET, 'HS256');

        // Create a new user for testing (client role)
        $this->testUser = [
            'name' => 'Test Client',
            'email' => 'client@example.com',
            'password' => 'password',
            'phone' => '1234567890',
            'role' => 'client'
        ];

        $response = $this->client->post('/users/create.php', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->adminToken
            ],
            'json' => $this->testUser
        ]);

        $this->assertEquals(201, $response->getStatusCode());
        $data = json_decode($response->getBody(), true);
        $this->testUser['id'] = $data['id'];
    }

    protected function tearDown(): void
    {
        // Delete the project created for testing
        if ($this->testProjectId) {
            $response = $this->client->delete('/projects/delete.php', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->adminToken
                ],
                'json' => [
                    'id' => $this->testProjectId
                ]
            ]);
            $this->assertEquals(200, $response->getStatusCode());
        }

        // Delete the user created for testing
        if ($this->testUser['id']) {
            $response = $this->client->delete('/users/delete.php', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->adminToken
                ],
                'json' => [
                    'id' => $this->testUser['id']
                ]
            ]);
            $this->assertEquals(200, $response->getStatusCode());
        }
    }

    public function testCreateProjectSuccessfully()
    {
        $projectData = [
            'title' => 'Test Project',
            'client_id' => $this->testUser['id'],
            'budget' => 1000.00,
            'description' => 'This is a test project description.',
            'deadline' => '2025-12-31'
        ];

        $response = $this->client->post('/projects/create.php', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->adminToken,
                'Content-Type' => 'application/json'
            ],
            'json' => $projectData
        ]);

        $this->assertEquals(201, $response->getStatusCode());
        $data = json_decode($response->getBody(), true);
        $this->assertArrayHasKey('id', $data);
        $this->testProjectId = $data['id'];
    }

    public function testCreateProjectWithMissingFields()
    {
        $projectData = [
            'title' => 'Test Project',
            // Missing client_id and budget
            'description' => 'This is a test project description.',
            'deadline' => '2025-12-31'
        ];

        $response = $this->client->post('/projects/create.php', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->adminToken,
                'Content-Type' => 'application/json'
            ],
            'json' => $projectData
        ]);

        $this->assertEquals(400, $response->getStatusCode());
        $data = json_decode($response->getBody(), true);
        $this->assertArrayHasKey('message', $data);
        $this->assertEquals('Unable to create project. Data is incomplete.', $data['message']);
    }
}
