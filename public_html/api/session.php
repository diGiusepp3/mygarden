<?php

declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    respond(['uid' => $_SESSION['gardengrid_uid'] ?? null]);
}

if ($method === 'POST') {
    $body = read_json_body();
    $uid = isset($body['uid']) && is_string($body['uid']) ? trim($body['uid']) : '';
    $_SESSION['gardengrid_uid'] = $uid !== '' ? $uid : null;
    respond(['ok' => true, 'uid' => $_SESSION['gardengrid_uid']]);
}

if ($method === 'DELETE') {
    unset($_SESSION['gardengrid_uid']);
    respond(['ok' => true, 'uid' => null]);
}

respond(['error' => 'Method not allowed.'], 405);
