<?php
use PHPUnit\Framework\TestCase;
use GuzzleHttp\Client;
use Firebase\JWT\JWT;

require_once __DIR__ . '/../core/config.php';

class UserTest extends TestCase
{
    private $client;
    private $adminToken;

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
    }

    public function testReadUser()
    {
        $response = $this->client->get('/users/read.php', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->adminToken
            ]
        ]);

        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getBody(), true);
        $this->assertEquals(1, $data['id']);
    }
}
