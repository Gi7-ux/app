<?php
use PHPUnit\Framework\TestCase;
use GuzzleHttp\Client;
use Firebase\JWT\JWT;

require_once __DIR__ . '/../core/config.php';

class LoginTest extends TestCase
{
    private $client;
    private $adminToken;
    private $testUser;

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

        // Create a new user for testing
        $this->testUser = [
            'name' => 'Test User',
            'email' => 'test@example.com',
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
        // Delete the user created for testing
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

    public function testFailedLogin()
    {
        $response = $this->client->post('/auth/login.php', [
            'json' => [
                'email' => $this->testUser['email'],
                'password' => 'wrongpassword'
            ]
        ]);

        $this->assertEquals(401, $response->getStatusCode());
    }

    public function testSuccessfulLogin()
    {
        $response = $this->client->post('/auth/login.php', [
            'json' => [
                'email' => $this->testUser['email'],
                'password' => $this->testUser['password']
            ]
        ]);

        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getBody(), true);
        $this->assertArrayHasKey('token', $data);
    }
}
