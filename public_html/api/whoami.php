<?php
require __DIR__ . '/_bootstrap.php';
$r = db()->query('SELECT state_json FROM app_state WHERE id=1')->fetch_assoc();
$s = json_decode($r['state_json'], true);
foreach ($s['users'] as $u) {
    echo $u['email'] . ' / ' . $u['password'] . PHP_EOL;
}
