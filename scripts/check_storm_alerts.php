<?php

declare(strict_types=1);

$dbConfig = require __DIR__ . '/../config/database.php';
$services = require __DIR__ . '/../config/services.php';

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$db = new mysqli(
    $dbConfig['host'],
    $dbConfig['username'],
    $dbConfig['password'],
    $dbConfig['database'],
    (int) $dbConfig['port']
);
$db->set_charset($dbConfig['charset']);

$stateResult = $db->query('SELECT state_json FROM app_state WHERE id = 1');
$row = $stateResult->fetch_assoc();
if (!$row) {
    exit(0);
}

$state = json_decode((string) $row['state_json'], true);
if (!is_array($state) || !isset($state['users']) || !is_array($state['users'])) {
    exit(0);
}

$provider = (string) ($services['storm_alerts']['provider'] ?? 'android_sms_gateway');
$infinireachUrl = (string) ($services['storm_alerts']['infinireach_url'] ?? '');
$infinireachApiKey = (string) ($services['storm_alerts']['infinireach_api_key'] ?? '');
$smsGateUrl = (string) ($services['storm_alerts']['sms_gate_url'] ?? '');
$smsGateUsername = (string) ($services['storm_alerts']['sms_gate_username'] ?? '');
$smsGatePassword = (string) ($services['storm_alerts']['sms_gate_password'] ?? '');
$twilioSid = (string) ($services['storm_alerts']['twilio_account_sid'] ?? '');
$twilioToken = (string) ($services['storm_alerts']['twilio_auth_token'] ?? '');
$twilioFrom = (string) ($services['storm_alerts']['twilio_from_number'] ?? ($services['storm_alerts']['sender_phone'] ?? ''));
if (
    ($provider === 'infinireach' && ($infinireachUrl === '' || $infinireachApiKey === '' || $twilioFrom === '')) &&
    ($provider === 'android_sms_gateway' && ($smsGateUrl === '' || $smsGateUsername === '' || $smsGatePassword === '')) &&
    ($provider === 'twilio' && ($twilioSid === '' || $twilioToken === '' || $twilioFrom === ''))
) {
    exit(0);
}

$forecastUrl = (string) $services['open_meteo']['forecast_url'];
$gustThreshold = (int) ($services['storm_alerts']['gust_threshold_kmh'] ?? 75);

foreach ($state['users'] as $user) {
    $settings = $user['settings'] ?? [];
    $phone = trim((string) ($settings['sms_phone'] ?? ''));
    $enabled = !empty($settings['sms_alerts_enabled']);
    $latitude = isset($settings['weather_latitude']) ? (float) $settings['weather_latitude'] : null;
    $longitude = isset($settings['weather_longitude']) ? (float) $settings['weather_longitude'] : null;

    if (!$enabled || $phone === '' || $latitude === null || $longitude === null) {
        continue;
    }

    $query = http_build_query([
        'latitude' => $latitude,
        'longitude' => $longitude,
        'current' => 'weather_code,wind_gusts_10m',
        'hourly' => 'weather_code,wind_gusts_10m',
        'forecast_days' => 2,
        'timezone' => 'auto',
    ]);

    $weatherRaw = @file_get_contents($forecastUrl . '?' . $query);
    if (!is_string($weatherRaw) || $weatherRaw === '') {
        continue;
    }

    $weather = json_decode($weatherRaw, true);
    if (!is_array($weather)) {
        continue;
    }

    $times = $weather['hourly']['time'] ?? [];
    $codes = $weather['hourly']['weather_code'] ?? [];
    $gusts = $weather['hourly']['wind_gusts_10m'] ?? [];

    $stormAt = null;
    $stormReason = null;
    $gustValue = 0.0;

    foreach ($times as $index => $time) {
        $code = isset($codes[$index]) ? (int) $codes[$index] : 0;
        $gust = isset($gusts[$index]) ? (float) $gusts[$index] : 0.0;
        $gustValue = max($gustValue, $gust);

        if (in_array($code, [95, 96, 99], true)) {
            $stormAt = (string) $time;
            $stormReason = 'thunderstorm';
            break;
        }

        if ($gust >= $gustThreshold) {
            $stormAt = (string) $time;
            $stormReason = 'wind';
            break;
        }
    }

    if ($stormAt === null || $stormReason === null) {
        continue;
    }

    $alertKey = sprintf('%s:%s:%s', (string) ($user['id'] ?? 'unknown'), $stormReason, $stormAt);
    $check = $db->prepare('SELECT id FROM storm_alert_log WHERE alert_key = ? LIMIT 1');
    $check->bind_param('s', $alertKey);
    $check->execute();
    $existing = $check->get_result()->fetch_assoc();
    if ($existing) {
        continue;
    }

    $location = trim((string) ($settings['weather_location_name'] ?? 'your garden'));
    $message = $stormReason === 'thunderstorm'
        ? "GardenGrid alert: storm forecast for {$location} around {$stormAt}. Secure your garden and greenhouse."
        : "GardenGrid alert: strong wind forecast for {$location} around {$stormAt} with gusts up to " . round($gustValue) . " km/h.";

    if ($provider === 'infinireach') {
        $externalId = $alertKey;
        $ch = curl_init($infinireachUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 20,
            CURLOPT_HTTPHEADER => [
                'X-API-Key: ' . $infinireachApiKey,
                'Content-Type: application/json',
                'Accept: application/json',
            ],
            CURLOPT_POSTFIELDS => json_encode([
                'to' => $phone,
                'message' => $message,
                'from' => $twilioFrom,
                'channel' => 'sms',
                'externalId' => $externalId,
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
        $response = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
    } elseif ($provider === 'android_sms_gateway') {
        $ch = curl_init($smsGateUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 20,
            CURLOPT_USERPWD => $smsGateUsername . ':' . $smsGatePassword,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode([
                'message' => $message,
                'phoneNumbers' => [$phone],
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
        $response = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
    } else {
        $twilioUrl = "https://api.twilio.com/2010-04-01/Accounts/{$twilioSid}/Messages.json";
        $ch = curl_init($twilioUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 20,
            CURLOPT_USERPWD => $twilioSid . ':' . $twilioToken,
            CURLOPT_POSTFIELDS => http_build_query([
                'To' => $phone,
                'From' => $twilioFrom,
                'Body' => $message,
            ]),
        ]);
        $response = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
    }

    if (!is_string($response) || $status >= 300) {
        continue;
    }

    $insert = $db->prepare('INSERT INTO storm_alert_log (user_id, phone, alert_key) VALUES (?, ?, ?)');
    $userId = (string) ($user['id'] ?? 'unknown');
    $insert->bind_param('sss', $userId, $phone, $alertKey);
    $insert->execute();
}
