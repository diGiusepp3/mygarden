<?php

declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

$conn = db();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $result = $conn->query('SELECT state_json, updated_at FROM app_state WHERE id = 1');
    $row = $result->fetch_assoc();
    respond([
        'state' => $row ? json_decode((string) $row['state_json'], true) : null,
        'updated_at' => $row['updated_at'] ?? null,
    ]);
}

if ($method === 'POST') {
    $body = read_json_body();
    if (!isset($body['state']) || !is_array($body['state'])) {
        respond(['error' => 'Invalid state payload.'], 400);
    }

    $json = json_encode($body['state'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        respond(['error' => 'Failed to encode state.'], 400);
    }

    $stmt = $conn->prepare(
        'INSERT INTO app_state (id, state_json) VALUES (1, ?)
         ON DUPLICATE KEY UPDATE state_json = VALUES(state_json), updated_at = CURRENT_TIMESTAMP'
    );
    $stmt->bind_param('s', $json);
    $stmt->execute();

    respond(['ok' => true]);
}

if ($method === 'DELETE') {
    $conn->query('DELETE FROM app_state WHERE id = 1');
    respond(['ok' => true]);
}

respond(['error' => 'Method not allowed.'], 405);
