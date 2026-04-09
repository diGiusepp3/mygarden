<?php

return [
    'open_meteo' => [
        'forecast_url' => 'https://api.open-meteo.com/v1/forecast',
    ],
    'storm_alerts' => [
        'gust_threshold_kmh' => 75,
        'sender_phone' => '+32478118430',
        'provider' => getenv('MYGARDEN_SMS_PROVIDER') ?: 'infinireach',
        'infinireach_url' => getenv('MYGARDEN_INFINIREACH_URL') ?: 'https://api.infinireach.io/api/v1/messages',
        'infinireach_api_key' => getenv('MYGARDEN_INFINIREACH_API_KEY') ?: '',
        'sms_gate_url' => getenv('MYGARDEN_SMSGATE_URL') ?: 'https://api.sms-gate.app/3rdparty/v1/message',
        'sms_gate_username' => getenv('MYGARDEN_SMSGATE_USERNAME') ?: '',
        'sms_gate_password' => getenv('MYGARDEN_SMSGATE_PASSWORD') ?: '',
        'twilio_account_sid' => getenv('MYGARDEN_TWILIO_ACCOUNT_SID') ?: '',
        'twilio_auth_token' => getenv('MYGARDEN_TWILIO_AUTH_TOKEN') ?: '',
        'twilio_from_number' => getenv('MYGARDEN_TWILIO_FROM_NUMBER') ?: '+32478118430',
    ],
];
