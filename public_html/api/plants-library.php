<?php

require_once __DIR__ . '/_bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    respond(['error' => 'Method not allowed'], 405);
}

$limit = max(1, min((int)($_GET['limit'] ?? 200), 500));
$search = trim((string)($_GET['search'] ?? ''));
$category = trim((string)($_GET['category'] ?? ''));

$sql = 'SELECT id, name, category, varieties, description, sunlight, water_needs, days_to_maturity, hardiness_zone, icon, created_at, updated_at FROM plants_library';
$clauses = [];
$params = [];
$types = '';

if ($search !== '') {
    $clauses[] = '(name LIKE ? OR category LIKE ? OR description LIKE ?)';
    $like = '%' . $search . '%';
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $types .= 'sss';
}

if ($category !== '') {
    $clauses[] = 'category = ?';
    $params[] = $category;
    $types .= 's';
}

if ($clauses) {
    $sql .= ' WHERE ' . implode(' AND ', $clauses);
}

$sql .= ' ORDER BY category, name LIMIT ?';
$params[] = $limit;
$types .= 'i';

$db = db();
$stmt = $db->prepare($sql);
if ($types !== '') {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$rows = [];
while ($row = $result->fetch_assoc()) {
    $row['varieties'] = json_decode((string)($row['varieties'] ?? '[]'), true) ?: [];
    $rows[] = $row;
}

respond(['status' => 'success', 'count' => count($rows), 'plants' => $rows]);
