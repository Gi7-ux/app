<?php
$url = 'http://localhost:5173/api/users/read.php';
$token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJZT1VSX0RPTUFJTi5jb20iLCJhdWQiOiJUSEVfQVVESUVOQ0UiLCJpYXQiOjE3NTE1Njc3NTAsIm5iZiI6MTc1MTU2Nzc1MCwiZXhwIjoxNzUxNjU0MTUwLCJkYXRhIjp7ImlkIjoxLCJuYW1lIjoiQWRtaW4gQXJjaGl0ZXgiLCJlbWFpbCI6ImFkbWluQGFyY2hpdGV4LmNvLnphIiwicm9sZSI6ImFkbWluIiwiY29tcGFueSI6IkFyY2hpdGV4IEdyb3VwIiwicmF0ZSI6bnVsbH19.-QQE-TiWW7C1wBqmFi9kgEPOGTvDEAa4a3oRsOVLIaw';

$options = [
    'http' => [
        'header'  => "Authorization: Bearer " . $token,
        'method'  => 'GET',
    ],
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) { /* Handle error */ }

var_dump($result);
?>