<?php
set_time_limit(180);
ini_set("max_execution_time", 180);
require_once __DIR__ . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

$input = read_json_body();
$prompt = trim($input['prompt'] ?? '');
if (!$prompt) {
    respond(['error' => 'No prompt provided'], 400);
}

$models = ['mistral', 'gemma4:e2b'];
$response = null;
$usedModel = null;
$lastError = '';

foreach ($models as $model) {
    $ch = curl_init('http://localhost:11434/api/generate');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'model'  => $model,
            'prompt' => $prompt,
            'stream' => false,
        ]),
        CURLOPT_HTTPHEADER  => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT     => 150,
        CURLOPT_RETURNTRANSFER => true,
    ]);
    $raw = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    if (!$curl_error && $http_code === 200) {
        $data = json_decode($raw, true);
        if (isset($data['response'])) {
            $response = $data['response'];
            $usedModel = $model;
            break;
        }
    }
    $lastError = $curl_error ?: "HTTP $http_code";
}

if ($response === null) {
    respond(['error' => 'Ollama niet beschikbaar: ' . $lastError], 500);
}

respond(['response' => $response, 'model' => $usedModel]);
