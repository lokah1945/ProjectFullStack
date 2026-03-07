<?php declare(strict_types=1);
// ===================================== SET ERROR REPORTING (PHP 8)
ini_set('display_errors', '1'); error_reporting(E_ALL);
// ===================================== KONFIG LOG FOLDER
$logDir = __DIR__ . '/logs-json'; if (!is_dir($logDir)) 
mkdir($logDir, 0755, true); $logFile = $logDir . '/raw_traffic_' . 
date('Y-m-d') . '.json';
// ===================================== SERVER RAW DATA
$serverRaw = [ 'timestamp' => (new 
    DateTimeImmutable())->format(DateTimeInterface::ATOM), 'server' 
    => $_SERVER, 'headers' => function_exists('getallheaders') ? 
    getallheaders() : [], 'raw_body' => 
    file_get_contents('php://input')
];
// ===================================== HANDLE CLIENT POST (UPDATE 
// LOG DENGAN CLIENT DATA)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && 
    str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')
) { $clientData = json_decode(file_get_contents('php://input'), true) 
    ?? [];
    // Masukkan server snapshot supaya satu entry lengkap
    $entry = [ 'server_snapshot' => $serverRaw, 'client_snapshot' => 
        $clientData
    ]; $existing = []; if (file_exists($logFile)) { $existing = 
        json_decode(file_get_contents($logFile), true) ?? [];
    }
    $existing[] = $entry; file_put_contents( $logFile, 
        json_encode($existing, JSON_PRETTY_PRINT | 
        JSON_UNESCAPED_SLASHES)
    );
    // Response untuk fetch JS
    header('Content-Type: application/json'); echo 
    json_encode(['status'=>'ok']); exit;
}
// ===================================== HTML OUTPUT (server + client 
// placeholder)
?> <!DOCTYPE html> <html lang="id"> <head> <meta charset="UTF-8"> 
<title>Server vs Client Inspector</title> <meta name="viewport" 
content="width=device-width, initial-scale=1"> <style> body { 
font-family: monospace; padding: 20px; } pre { background:#f4f4f4; 
padding:15px; overflow:auto; } h1, h2 { margin-top: 40px; } </style> 
</head> <body> <h1>🖥️ SERVER — RAW DATA</h1> <pre><?= 
htmlspecialchars(json_encode($serverRaw, JSON_PRETTY_PRINT | 
JSON_UNESCAPED_SLASHES)) ?></pre> <h1>🌐 CLIENT — BROWSER DATA</h1> 
<pre id="client">Loading client data...</pre> <script>
// ============================ CLIENT RAW DATA (MAX) 
// ============================
const clientRaw = { client_timestamp: new Date().toISOString(), 
    document_referrer: document.referrer || null, location: {
        href: location.href, origin: location.origin, pathname: 
        location.pathname, search: location.search, hash: 
        location.hash
    },
    navigator: { userAgent: navigator.userAgent, language: 
        navigator.language, languages: navigator.languages, platform: 
        navigator.platform, doNotTrack: navigator.doNotTrack, 
        cookieEnabled: navigator.cookieEnabled
    },
    screen: { width: screen.width, height: screen.height, colorDepth: 
        screen.colorDepth, pixelRatio: window.devicePixelRatio
    },
    viewport: { width: window.innerWidth, height: window.innerHeight
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};
// Tampilkan di browser
document.getElementById('client').textContent = 
    JSON.stringify(clientRaw, null, 2);
// ============================ KIRIM CLIENT DATA KE SERVER 
// ============================
fetch(location.pathname, { method: 'POST', headers: {'Content-Type': 
    'application/json'}, body: JSON.stringify(clientRaw)
})
.then(r => r.json()) .then(d => console.log("Client data saved:", d)) 
.catch(e => console.error("Error saving client data:", e)); </script> 
</body>
</html>
