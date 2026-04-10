<?php

require_once __DIR__ . '/_bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

function normalize_varieties($value): array
{
    if (is_string($value)) {
        $value = preg_split('/[,\n;|]+/', $value) ?: [];
    }
    if (!is_array($value)) {
        return [];
    }
    $clean = [];
    foreach ($value as $item) {
        $item = trim((string)$item);
        if ($item === '') {
            continue;
        }
        $clean[] = $item;
    }
    return array_values(array_unique($clean));
}

$input = read_json_body();
$count = max(1, min((int)($input['count'] ?? 3), 30));
$category = trim((string)($input['category'] ?? 'vegetable'));
$brief = trim((string)($input['prompt'] ?? ''));

if ($brief !== '') {
    $prompt = "Generate exactly $count unique plant entries for MyGarden in the category '$category'. Extra brief: $brief. Each entry must be a JSON object with: name, varieties (array of 2-4), description (1 sentence), sunlight (full sun/partial/shade), water_needs (low/medium/high), days_to_maturity (number), icon (emoji). Return ONLY the JSON array.";
} else {
    $prompt = "Generate exactly $count $category plant entries as a JSON array. Each must have: name, varieties (array of 2-4), description (1 sentence), sunlight (full sun/partial/shade), water_needs (low/medium/high), days_to_maturity (number), icon (emoji). Return ONLY the JSON array.";
}

try {
    $models = ['mistral', 'gemma4:e2b'];
    $response = null;
    $lastError = '';

    foreach ($models as $model) {
        $ch = curl_init('http://localhost:11434/api/generate');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode(['model' => $model, 'prompt' => $prompt, 'stream' => false]),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT => 300,
            CURLOPT_RETURNTRANSFER => true,
        ]);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        curl_close($ch);

        if (!$curl_error && $http_code === 200) {
            break;
        }
        $lastError = $curl_error ?: $http_code;
    }

    if (!$response || $curl_error) {
        respond(['error' => 'Ollama unavailable: ' . $lastError], 500);
    }

    $data = json_decode($response, true);
    if (!isset($data['response'])) {
        respond(['error' => 'Invalid Ollama response'], 500);
    }

    $text = $data['response'];
    preg_match('/\[[\s\S]*\]/', $text, $matches);
    if (empty($matches)) {
        respond(['error' => 'Could not parse JSON from model'], 400);
    }

    $plants = json_decode($matches[0], true);
    if (!is_array($plants)) {
        respond(['error' => 'Invalid JSON array'], 400);
    }

    $db = db();
    $saved = 0;
    $updated = 0;
    $skipped = 0;
    $failed = [];
    $existing = [];

    $existingRes = $db->query('SELECT id, name, category, varieties, description, sunlight, water_needs, days_to_maturity, hardiness_zone, icon FROM plants_library');
    while ($row = $existingRes->fetch_assoc()) {
        $key = mb_strtolower(trim((string)$row['name'])) . '|' . mb_strtolower(trim((string)$row['category']));
        $row['varieties'] = normalize_varieties(json_decode((string)($row['varieties'] ?? '[]'), true));
        $existing[$key] = $row;
    }

    foreach ($plants as $plant) {
        try {
            $name = trim((string)($plant['name'] ?? 'Unknown'));
            $plantCategory = trim((string)($plant['category'] ?? $category));
            $key = mb_strtolower($name) . '|' . mb_strtolower($plantCategory);
            $incomingVarieties = normalize_varieties($plant['varieties'] ?? []);
            $description = trim((string)($plant['description'] ?? ''));
            $sunlight = trim((string)($plant['sunlight'] ?? 'full sun'));
            $water_needs = trim((string)($plant['water_needs'] ?? 'medium'));
            $days = max(0, (int)($plant['days_to_maturity'] ?? 60));
            $zone = trim((string)($plant['hardiness_zone'] ?? ''));
            $icon = trim((string)($plant['icon'] ?? '🌱'));

            if (isset($existing[$key])) {
                $row = $existing[$key];
                $mergedVarieties = array_values(array_unique(array_merge($row['varieties'] ?? [], $incomingVarieties)));
                $nextDescription = $row['description'] ?: $description;
                $nextSunlight = $row['sunlight'] ?: $sunlight;
                $nextWater = $row['water_needs'] ?: $water_needs;
                $nextDays = (int)($row['days_to_maturity'] ?: $days);
                $nextZone = $row['hardiness_zone'] ?: $zone;
                $nextIcon = $row['icon'] ?: $icon;

                $stmt = $db->prepare(
                    'UPDATE plants_library
                     SET varieties = ?, description = ?, sunlight = ?, water_needs = ?, days_to_maturity = ?, hardiness_zone = ?, icon = ?
                     WHERE id = ?'
                );
                $mergedJson = json_encode($mergedVarieties, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                $id = (int)$row['id'];
                $stmt->bind_param('ssssissi', $mergedJson, $nextDescription, $nextSunlight, $nextWater, $nextDays, $nextZone, $nextIcon, $id);
                $stmt->execute();
                $updated++;
                continue;
            }

            $stmt = $db->prepare(
                'INSERT INTO plants_library (name, category, varieties, description, sunlight, water_needs, days_to_maturity, hardiness_zone, icon)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $varietiesJson = json_encode($incomingVarieties, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $stmt->bind_param('ssssssiss', $name, $plantCategory, $varietiesJson, $description, $sunlight, $water_needs, $days, $zone, $icon);
            $stmt->execute();
            $saved++;
        } catch (Exception $e) {
            $failed[] = $plant['name'] ?? 'Unknown';
        }
    }

    respond([
        'status' => 'success',
        'saved' => $saved,
        'updated' => $updated,
        'skipped' => $skipped,
        'failed' => count($failed),
        'plants' => array_slice($plants, 0, 3),
    ]);
} catch (Exception $e) {
    respond(['error' => 'Server error'], 500);
}
