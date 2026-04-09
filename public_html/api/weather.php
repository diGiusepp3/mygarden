<?php

declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

$services = require dirname(__DIR__, 2) . '/config/services.php';
$forecastUrl = $services['open_meteo']['forecast_url'];

$latitude = isset($_GET['latitude']) ? (float) $_GET['latitude'] : null;
$longitude = isset($_GET['longitude']) ? (float) $_GET['longitude'] : null;
$gustThreshold = (int) ($services['storm_alerts']['gust_threshold_kmh'] ?? 75);

if ($latitude === null || $longitude === null) {
    respond(['error' => 'Missing latitude or longitude.'], 400);
}

$query = http_build_query([
    'latitude' => $latitude,
    'longitude' => $longitude,
    'current' => 'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m',
    'hourly' => 'weather_code,wind_gusts_10m,precipitation_probability',
    'forecast_days' => 2,
    'timezone' => 'auto',
]);

$ch = curl_init($forecastUrl . '?' . $query);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_HTTPHEADER => ['Accept: application/json'],
]);

$body = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

if (!is_string($body) || $status >= 400) {
    respond(['error' => 'Weather request failed.'], 502);
}

$data = json_decode($body, true);
if (!is_array($data)) {
    respond(['error' => 'Invalid weather payload.'], 502);
}

$times = $data['hourly']['time'] ?? [];
$codes = $data['hourly']['weather_code'] ?? [];
$gusts = $data['hourly']['wind_gusts_10m'] ?? [];
$stormIndex = null;
$stormReason = null;
$maxGust = 0.0;

foreach ($times as $index => $time) {
    $gust = isset($gusts[$index]) ? (float) $gusts[$index] : 0.0;
    $code = isset($codes[$index]) ? (int) $codes[$index] : 0;
    $maxGust = max($maxGust, $gust);

    if (in_array($code, [95, 96, 99], true)) {
        $stormIndex = $index;
        $stormReason = 'thunderstorm';
        break;
    }

    if ($gust >= $gustThreshold) {
        $stormIndex = $index;
        $stormReason = 'wind';
        break;
    }
}

$storm = [
    'active' => $stormIndex !== null,
    'reason' => $stormReason,
    'starts_at' => $stormIndex !== null ? ($times[$stormIndex] ?? null) : null,
    'max_gust_kmh' => $maxGust,
    'threshold_kmh' => $gustThreshold,
];

respond([
    'current' => $data['current'] ?? null,
    'hourly' => [
        'time' => $times,
        'weather_code' => $codes,
        'wind_gusts_10m' => $gusts,
        'precipitation_probability' => $data['hourly']['precipitation_probability'] ?? [],
    ],
    'storm' => $storm,
]);
