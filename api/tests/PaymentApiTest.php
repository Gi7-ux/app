<?php
use PHPUnit\Framework\TestCase;
use GuzzleHttp\Client;
use Firebase\JWT\JWT;

require_once __DIR__ . '/../core/config.php'; // Defines JWT_SECRET
require_once __DIR__ . '/../core/database.php'; // To potentially interact with DB for setup/cleanup if needed

class PaymentApiTest extends TestCase
{
    private $client;
    private $adminToken;
    private $clientUserToken;
    private $freelancerUserToken;

    private $testClientUser;
    private $testFreelancerUser;
    private $testProject;
    private $testInvoice;
    private $testPaymentIds = [];

    protected static $db;

    public static function setUpBeforeClass(): void
    {
        $database = new Database();
        self::$db = $database->connect();
        // Ensure migration for billing tables has run or run it here manually for test environment
        // For simplicity, we assume migrations are up-to-date on the test DB.
        // self::$db->exec(file_get_contents(__DIR__ . '/../migrations/20240726_create_billing_tables.sql'));
    }

    protected function setUp(): void
    {
        $this->client = new Client([
            'base_uri' => 'http://localhost:8000/api/', // Adjusted to include /api/
            'http_errors' => false,
            'defaults' => [
                'headers' => ['Content-Type' => 'application/json']
            ]
        ]);

        $this->adminToken = $this->generateToken(1, 'admin');

        // Create Test Client User
        $clientEmail = 'testclient_payment_' . uniqid() . '@example.com';
        $this->testClientUser = $this->createUser('Test Payment Client', $clientEmail, 'client');
        $this->clientUserToken = $this->generateToken($this->testClientUser['id'], 'client');

        // Create Test Freelancer User
        $freelancerEmail = 'testfreelancer_payment_' . uniqid() . '@example.com';
        $this->testFreelancerUser = $this->createUser('Test Payment Freelancer', $freelancerEmail, 'freelancer', 50.00);
        $this->freelancerUserToken = $this->generateToken($this->testFreelancerUser['id'], 'freelancer');

        // Create Test Project
        $this->testProject = $this->createProject('Payment Test Project', $this->testClientUser['id'], $this->testFreelancerUser['id']);

        // Create Test Invoice (Manual DB insertion as there's no API for invoices yet)
        $this->testInvoice = $this->createManualInvoice($this->testProject['id'], $this->testClientUser['id'], 1000.00);

    }

    private function generateToken($userId, $role)
    {
        $payload = [
            'iss' => 'YOUR_DOMAIN.com', 'aud' => 'THE_AUDIENCE', 'iat' => time(), 'nbf' => time(),
            'exp' => time() + 3600,
            'data' => ['id' => $userId, 'role' => $role]
        ];
        return JWT::encode($payload, JWT_SECRET, 'HS256');
    }

    private function createUser($name, $email, $role, $rate = null)
    {
        $userData = ['name' => $name, 'username' => $email, 'email' => $email, 'password' => 'password123', 'role' => $role];
        if ($rate !== null) $userData['rate'] = $rate;

        $response = $this->client->post('users/create.php', [
            'headers' => ['Authorization' => 'Bearer ' . $this->adminToken],
            'json' => $userData
        ]);
        $this->assertEquals(201, $response->getStatusCode(), "Failed to create user {$email}: " . $response->getBody());
        $data = json_decode($response->getBody(), true);
        return ['id' => $data['id'], 'email' => $email, 'role' => $role, 'name' => $name];
    }

    private function createProject($title, $clientId, $freelancerId)
    {
        $projectData = [
            'title' => $title, 'client_id' => $clientId, 'freelancer_id' => $freelancerId,
            'budget' => 2000.00, 'description' => 'Test project for payments', 'deadline' => date('Y-m-d', strtotime('+30 days'))
        ];
        $response = $this->client->post('projects/create.php', [
            'headers' => ['Authorization' => 'Bearer ' . $this->adminToken],
            'json' => $projectData
        ]);
        $this->assertEquals(201, $response->getStatusCode(), "Failed to create project: " . $response->getBody());
        $data = json_decode($response->getBody(), true);
        return ['id' => $data['id'], 'title' => $title, 'client_id' => $clientId, 'freelancer_id' => $freelancerId, 'budget' => $projectData['budget']];
    }

    private function createManualInvoice($projectId, $clientId, $amount)
    {
        $invoiceNumber = 'INV-TEST-' . uniqid();
        $issueDate = date('Y-m-d');
        $dueDate = date('Y-m-d', strtotime('+15 days'));

        $stmt = self::$db->prepare(
            "INSERT INTO invoices (project_id, client_id, invoice_number, issue_date, due_date, total_amount, status)
             VALUES (:project_id, :client_id, :invoice_number, :issue_date, :due_date, :total_amount, 'sent')"
        );
        $stmt->execute([
            ':project_id' => $projectId, ':client_id' => $clientId, ':invoice_number' => $invoiceNumber,
            ':issue_date' => $issueDate, ':due_date' => $dueDate, ':total_amount' => $amount
        ]);
        $id = self::$db->lastInsertId();
        return ['id' => $id, 'invoice_number' => $invoiceNumber, 'total_amount' => $amount];
    }


    protected function tearDown(): void
    {
        // Delete payments created
        foreach($this->testPaymentIds as $paymentId) {
            $this->client->delete("payments/delete_payment.php?id={$paymentId}", [
                'headers' => ['Authorization' => 'Bearer ' . $this->adminToken]
            ]);
        }
        $this->testPaymentIds = [];

        // Delete invoice (manual DB deletion)
        if (isset($this->testInvoice['id'])) {
             self::$db->prepare("DELETE FROM invoice_line_items WHERE invoice_id = ?")->execute([$this->testInvoice['id']]);
             self::$db->prepare("DELETE FROM invoices WHERE id = ?")->execute([$this->testInvoice['id']]);
        }

        // Delete project
        if (isset($this->testProject['id'])) {
            $this->client->delete('projects/delete.php', [
                'headers' => ['Authorization' => 'Bearer ' . $this->adminToken],
                'json' => ['id' => $this->testProject['id']]
            ]);
        }

        // Delete users
        if (isset($this->testClientUser['id'])) {
            $this->client->delete('users/delete.php', [
                'headers' => ['Authorization' => 'Bearer ' . $this->adminToken],
                'json' => ['id' => $this->testClientUser['id']]
            ]);
        }
        if (isset($this->testFreelancerUser['id'])) {
            $this->client->delete('users/delete.php', [
                'headers' => ['Authorization' => 'Bearer ' . $this->adminToken],
                'json' => ['id' => $this->testFreelancerUser['id']]
            ]);
        }
         // Reset financial summaries for admin user (ID 1) if affected by tests not cleaning up properly.
        self::$db->prepare("UPDATE users SET total_spent_as_client = 0, total_earned = 0 WHERE id = 1")->execute();

    }

    public function testCreatePaymentSuccessfully()
    {
        $paymentData = [
            'invoice_id' => $this->testInvoice['id'],
            'project_id' => $this->testProject['id'],
            'paid_by_user_id' => $this->testClientUser['id'],
            'paid_to_user_id' => $this->testFreelancerUser['id'],
            'amount' => 100.00,
            'payment_date' => date('Y-m-d'),
            'payment_method' => 'test_method',
            'status' => 'completed'
        ];

        $response = $this->client->post('payments/create_payment.php', [
            'headers' => ['Authorization' => 'Bearer ' . $this->adminToken],
            'json' => $paymentData
        ]);

        $this->assertEquals(201, $response->getStatusCode(), "Payment creation failed: " . $response->getBody());
        $data = json_decode($response->getBody(), true);
        $this->assertArrayHasKey('id', $data);
        $this->testPaymentIds[] = $data['id'];

        // Verify financial summaries
        $projectDetails = $this->getProjectDetails($this->testProject['id']);
        $this->assertEquals(100.00, $projectDetails['total_paid_amount']);

        $clientUserDetails = $this->getUserDetails($this->testClientUser['id']);
        $this->assertEquals(100.00, $clientUserDetails['total_spent_as_client']);

        $freelancerUserDetails = $this->getUserDetails($this->testFreelancerUser['id']);
        $this->assertEquals(100.00, $freelancerUserDetails['total_earned']);
    }

    public function testCreatePaymentMissingRequiredFields()
    {
        $paymentData = [ // Missing amount and paid_by_user_id
            'project_id' => $this->testProject['id'],
            'payment_date' => date('Y-m-d'),
        ];
        $response = $this->client->post('payments/create_payment.php', [
            'headers' => ['Authorization' => 'Bearer ' . $this->adminToken],
            'json' => $paymentData
        ]);
        $this->assertEquals(400, $response->getStatusCode());
    }

    public function testCreatePaymentUnauthorized()
    {
        $paymentData = [
            'invoice_id' => $this->testInvoice['id'],
            'project_id' => $this->testProject['id'],
            'paid_by_user_id' => $this->testClientUser['id'],
            'amount' => 50.00,
            'payment_date' => date('Y-m-d'),
        ];
        // Attempt by freelancer token (not admin, not the payer)
        $response = $this->client->post('payments/create_payment.php', [
            'headers' => ['Authorization' => 'Bearer ' . $this->freelancerUserToken],
            'json' => $paymentData
        ]);
        $this->assertEquals(403, $response->getStatusCode());
    }

    public function testGetPaymentsAdmin()
    {
        // Create a payment first
        $this->testCreatePaymentForGet();

        $response = $this->client->get('payments/get_payments.php', [
            'headers' => ['Authorization' => 'Bearer ' . $this->adminToken]
        ]);
        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getBody(), true);
        $this->assertNotEmpty($data['data']);
    }

    public function testGetPaymentsClientSeesOwn()
    {
        $paymentId = $this->testCreatePaymentForGet($this->testClientUser['id'], $this->testFreelancerUser['id']);
        // Create another payment by another client (admin as client for simplicity) to ensure filtering
        $this->testCreatePaymentForGet(1, $this->testFreelancerUser['id'], 75.00);


        $response = $this->client->get('payments/get_payments.php', [
            'headers' => ['Authorization' => 'Bearer ' . $this->clientUserToken]
        ]);
        $this->assertEquals(200, $response->getStatusCode(), $response->getBody());
        $data = json_decode($response->getBody(), true);
        $this->assertCount(1, $data['data'], "Client should see only their own payments.");
        $this->assertEquals($paymentId, $data['data'][0]['id']);
    }

    public function testGetPaymentsFreelancerSeesOwn()
    {
        $paymentId = $this->testCreatePaymentForGet($this->testClientUser['id'], $this->testFreelancerUser['id']);
        // Create another payment to another freelancer (admin as freelancer for simplicity)
        $this->testCreatePaymentForGet($this->testClientUser['id'], 1, 80.00);


        $response = $this->client->get('payments/get_payments.php', [
            'headers' => ['Authorization' => 'Bearer ' . $this->freelancerUserToken]
        ]);
        $this->assertEquals(200, $response->getStatusCode(), $response->getBody());
        $data = json_decode($response->getBody(), true);
        $this->assertCount(1, $data['data'], "Freelancer should see only payments made to them.");
        $this->assertEquals($paymentId, $data['data'][0]['id']);
    }


    public function testUpdatePaymentAdmin()
    {
        $paymentId = $this->testCreatePaymentForGet();
        $updateData = ['status' => 'refunded', 'notes' => 'Updated by test'];

        $response = $this->client->put('payments/update_payment.php', [ // Using PUT as per API
            'headers' => ['Authorization' => 'Bearer ' . $this->adminToken],
            'json' => array_merge(['id' => $paymentId], $updateData)
        ]);
        $this->assertEquals(200, $response->getStatusCode(), $response->getBody());

        $getResponse = $this->client->get("payments/get_payments.php?id_specific={$paymentId}", [ // Assuming a way to get specific payment
             'headers' => ['Authorization' => 'Bearer ' . $this->adminToken]
        ]);
        $data = json_decode($getResponse->getBody(), true);
        // Find the payment (get_payments returns a list)
        $updatedPayment = null;
        foreach($data['data'] as $p) { if($p['id'] == $paymentId) $updatedPayment = $p; break;}

        $this->assertNotNull($updatedPayment);
        $this->assertEquals('refunded', $updatedPayment['status']);
        $this->assertEquals('Updated by test', $updatedPayment['notes']);
    }

    public function testDeletePaymentAdmin()
    {
        $paymentId = $this->testCreatePaymentForGet($this->testClientUser['id'], $this->testFreelancerUser['id'], 200.00);

        // Check initial financial state
        $initialProjectDetails = $this->getProjectDetails($this->testProject['id']);
        $initialClientDetails = $this->getUserDetails($this->testClientUser['id']);
        $initialFreelancerDetails = $this->getUserDetails($this->testFreelancerUser['id']);

        $response = $this->client->delete("payments/delete_payment.php?id={$paymentId}", [
            'headers' => ['Authorization' => 'Bearer ' . $this->adminToken]
        ]);
        $this->assertEquals(200, $response->getStatusCode(), $response->getBody());

        // Verify financial summaries are decremented
        $finalProjectDetails = $this->getProjectDetails($this->testProject['id']);
        $this->assertEquals($initialProjectDetails['total_paid_amount'] - 200.00, $finalProjectDetails['total_paid_amount']);

        $finalClientDetails = $this->getUserDetails($this->testClientUser['id']);
        $this->assertEquals($initialClientDetails['total_spent_as_client'] - 200.00, $finalClientDetails['total_spent_as_client']);

        $finalFreelancerDetails = $this->getUserDetails($this->testFreelancerUser['id']);
        $this->assertEquals($initialFreelancerDetails['total_earned'] - 200.00, $finalFreelancerDetails['total_earned']);

        // Remove from testPaymentIds as it's already deleted
        $this->testPaymentIds = array_filter($this->testPaymentIds, function($id) use ($paymentId) { return $id != $paymentId; });
    }

    // Helper to create a payment for GET/UPDATE/DELETE tests
    private function testCreatePaymentForGet($payerId = null, $payeeId = null, $amount = 150.00)
    {
        $paymentData = [
            'invoice_id' => $this->testInvoice['id'],
            'project_id' => $this->testProject['id'],
            'paid_by_user_id' => $payerId ?? $this->testClientUser['id'],
            'paid_to_user_id' => $payeeId ?? $this->testFreelancerUser['id'],
            'amount' => $amount,
            'payment_date' => date('Y-m-d'),
            'payment_method' => 'test_get_method',
            'status' => 'completed'
        ];
        $response = $this->client->post('payments/create_payment.php', [
            'headers' => ['Authorization' => 'Bearer ' . $this->adminToken],
            'json' => $paymentData
        ]);
        $this->assertEquals(201, $response->getStatusCode(), "Helper payment creation failed: " . $response->getBody());
        $data = json_decode($response->getBody(), true);
        $this->testPaymentIds[] = $data['id'];
        return $data['id'];
    }

    private function getProjectDetails($projectId) {
        $response = $this->client->get("projects/read_one.php?id={$projectId}", [
            'headers' => ['Authorization' => 'Bearer ' . $this->adminToken]
        ]);
        $this->assertEquals(200, $response->getStatusCode());
        return json_decode($response->getBody(), true);
    }

    private function getUserDetails($userId) {
        $response = $this->client->get("users/read_one.php?id={$userId}", [
            'headers' => ['Authorization' => 'Bearer ' . $this->adminToken]
        ]);
        $this->assertEquals(200, $response->getStatusCode());
        return json_decode($response->getBody(), true);
    }
}
?>
