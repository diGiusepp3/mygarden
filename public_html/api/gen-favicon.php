<?php
// Generate favicon.ico (16x16 + 32x32 PNG embedded) using GD
$sizes = [32, 16];
$pngs = [];

foreach ($sizes as $size) {
    $img = imagecreatetruecolor($size, $size);
    imagealphablending($img, true);
    imagesavealpha($img, true);

    $s = $size / 32;

    // Transparent background
    $transparent = imagecolorallocatealpha($img, 0, 0, 0, 127);
    imagefill($img, 0, 0, $transparent);

    // Rounded rect background (#2B5C10)
    $bg = imagecolorallocate($img, 43, 92, 16);
    $r = (int)(8 * $s);
    imagefilledrectangle($img, $r, 0, $size - $r, $size, $bg);
    imagefilledrectangle($img, 0, $r, $size, $size - $r, $bg);
    imagefilledellipse($img, $r, $r, $r * 2, $r * 2, $bg);
    imagefilledellipse($img, $size - $r, $r, $r * 2, $r * 2, $bg);
    imagefilledellipse($img, $r, $size - $r, $r * 2, $r * 2, $bg);
    imagefilledellipse($img, $size - $r, $size - $r, $r * 2, $r * 2, $bg);

    // Left leaf (#6DB33F)
    $leaf1 = imagecolorallocate($img, 109, 179, 63);
    $pts1 = [
        (int)(16*$s), (int)(18*$s),
        (int)(8*$s),  (int)(9*$s),
        (int)(12*$s), (int)(9*$s),
        (int)(16*$s), (int)(18*$s),
    ];
    imagefilledpolygon($img, $pts1, $leaf1);

    // Right leaf (#8CC63F)
    $leaf2 = imagecolorallocate($img, 140, 198, 63);
    $pts2 = [
        (int)(16*$s), (int)(14*$s),
        (int)(24*$s), (int)(5*$s),
        (int)(19*$s), (int)(5*$s),
        (int)(16*$s), (int)(14*$s),
    ];
    imagefilledpolygon($img, $pts2, $leaf2);

    // Stem
    $stem = imagecolorallocate($img, 168, 216, 120);
    imageline($img, (int)(16*$s), (int)(26*$s), (int)(16*$s), (int)(14*$s), $stem);

    // Soil
    $soil = imagecolorallocatealpha($img, 160, 82, 45, 30);
    imagefilledrectangle($img, (int)(9*$s), (int)(26*$s), (int)(23*$s), (int)(29*$s), $soil);

    ob_start();
    imagepng($img);
    $pngs[$size] = ob_get_clean();
    imagedestroy($img);
}

// Write simple ICO: just the 32x32 PNG wrapped in minimal ICO container
// ICO format with single 32x32 PNG image
$png = $pngs[32];
$pngLen = strlen($png);

$ico  = pack('vvv', 0, 1, 1);          // header: reserved, type=1(ICO), count=1
$ico .= pack('CCCCvvVV',               // directory entry
    32, 32, 0, 0, 1, 32,              // w, h, colorCount, reserved, planes, bitCount
    $pngLen, 22                        // imageSize, imageOffset (6 header + 16 entry)
);
$ico .= $png;

$outPath = __DIR__ . '/../favicon.ico';
file_put_contents($outPath, $ico);
echo 'OK: favicon.ico written (' . strlen($ico) . ' bytes)';
