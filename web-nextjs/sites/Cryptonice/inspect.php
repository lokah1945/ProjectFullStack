<?php
/**
 * ============================================================
 *  ADVANCED FINGERPRINT INSPECTOR v2.0
 *  Server-Side + Client-Side Comprehensive Fingerprint Collector
 * ============================================================
 *  Mengumpulkan 80+ parameter fingerprint dari sisi server & client
 *  Termasuk: Canvas, WebGL, AudioContext, WebRTC, Font Detection,
 *  Battery, Network Info, Gamepad, Speech Voices, dll.
 * ============================================================
 */

// --- CONFIG ---
$logFile = __DIR__ . '/fingerprint_log.json';

// ===================================== SERVER-SIDE FINGERPRINT
$serverFingerprint = [
    'timestamp'        => (new DateTimeImmutable())->format(DateTimeInterface::ATOM),

    // --- IP & Network ---
    'remote_addr'      => $_SERVER['REMOTE_ADDR'] ?? null,
    'remote_port'      => $_SERVER['REMOTE_PORT'] ?? null,
    'forwarded_for'    => $_SERVER['HTTP_X_FORWARDED_FOR'] ?? null,
    'real_ip'          => $_SERVER['HTTP_X_REAL_IP'] ?? null,
    'cf_connecting_ip' => $_SERVER['HTTP_CF_CONNECTING_IP'] ?? null,
    'via'              => $_SERVER['HTTP_VIA'] ?? null,

    // --- Request Method & Protocol ---
    'request_method'   => $_SERVER['REQUEST_METHOD'] ?? null,
    'request_uri'      => $_SERVER['REQUEST_URI'] ?? null,
    'query_string'     => $_SERVER['QUERY_STRING'] ?? null,
    'server_protocol'  => $_SERVER['SERVER_PROTOCOL'] ?? null,
    'https'            => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'on' : 'off',
    'request_scheme'   => $_SERVER['REQUEST_SCHEME'] ?? null,

    // --- Server Info ---
    'server_name'      => $_SERVER['SERVER_NAME'] ?? null,
    'server_addr'      => $_SERVER['SERVER_ADDR'] ?? null,
    'server_port'      => $_SERVER['SERVER_PORT'] ?? null,
    'server_software'  => $_SERVER['SERVER_SOFTWARE'] ?? null,
    'document_root'    => $_SERVER['DOCUMENT_ROOT'] ?? null,
    'script_filename'  => $_SERVER['SCRIPT_FILENAME'] ?? null,
    'gateway_interface'=> $_SERVER['GATEWAY_INTERFACE'] ?? null,
    'path_info'        => $_SERVER['PATH_INFO'] ?? null,

    // --- User-Agent & Client Hints ---
    'user_agent'       => $_SERVER['HTTP_USER_AGENT'] ?? null,
    'sec_ch_ua'              => $_SERVER['HTTP_SEC_CH_UA'] ?? null,
    'sec_ch_ua_mobile'       => $_SERVER['HTTP_SEC_CH_UA_MOBILE'] ?? null,
    'sec_ch_ua_platform'     => $_SERVER['HTTP_SEC_CH_UA_PLATFORM'] ?? null,
    'sec_ch_ua_full_version' => $_SERVER['HTTP_SEC_CH_UA_FULL_VERSION_LIST'] ?? null,
    'sec_ch_ua_arch'         => $_SERVER['HTTP_SEC_CH_UA_ARCH'] ?? null,
    'sec_ch_ua_model'        => $_SERVER['HTTP_SEC_CH_UA_MODEL'] ?? null,
    'sec_ch_ua_bitness'      => $_SERVER['HTTP_SEC_CH_UA_BITNESS'] ?? null,

    // --- Language & Encoding ---
    'accept_language'  => $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? null,
    'accept_encoding'  => $_SERVER['HTTP_ACCEPT_ENCODING'] ?? null,
    'accept'           => $_SERVER['HTTP_ACCEPT'] ?? null,
    'content_type'     => $_SERVER['CONTENT_TYPE'] ?? null,

    // --- Connection & Cache ---
    'connection'       => $_SERVER['HTTP_CONNECTION'] ?? null,
    'cache_control'    => $_SERVER['HTTP_CACHE_CONTROL'] ?? null,
    'pragma'           => $_SERVER['HTTP_PRAGMA'] ?? null,

    // --- Security & Fetch Metadata ---
    'sec_fetch_mode'   => $_SERVER['HTTP_SEC_FETCH_MODE'] ?? null,
    'sec_fetch_site'   => $_SERVER['HTTP_SEC_FETCH_SITE'] ?? null,
    'sec_fetch_dest'   => $_SERVER['HTTP_SEC_FETCH_DEST'] ?? null,
    'sec_fetch_user'   => $_SERVER['HTTP_SEC_FETCH_USER'] ?? null,
    'origin'           => $_SERVER['HTTP_ORIGIN'] ?? null,
    'referer'          => $_SERVER['HTTP_REFERER'] ?? null,

    // --- DNT & Privacy ---
    'dnt'              => $_SERVER['HTTP_DNT'] ?? null,
    'sec_gpc'          => $_SERVER['HTTP_SEC_GPC'] ?? null,

    // --- Cookies & Auth ---
    'cookie_header'    => isset($_SERVER['HTTP_COOKIE']) ? 'present (' . strlen($_SERVER['HTTP_COOKIE']) . ' bytes)' : 'absent',
    'authorization'    => isset($_SERVER['HTTP_AUTHORIZATION']) ? 'present' : 'absent',

    // --- TLS / SSL ---
    'ssl_protocol'     => $_SERVER['SSL_PROTOCOL'] ?? null,
    'ssl_cipher'       => $_SERVER['SSL_CIPHER'] ?? null,

    // --- Raw Body ---
    'raw_body'         => file_get_contents('php://input'),

    // --- All Headers (raw) ---
    'all_headers'      => function_exists('getallheaders') ? getallheaders() : [],

    // --- Full $_SERVER dump (untuk referensi lengkap) ---
    'full_server'      => $_SERVER,
];

// ===================================== HANDLE CLIENT POST
if ($_SERVER['REQUEST_METHOD'] === 'POST'
    && str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')
) {
    $clientData = json_decode(file_get_contents('php://input'), true) ?? [];

    $entry = [
        'id'              => uniqid('fp_', true),
        'server_snapshot' => $serverFingerprint,
        'client_snapshot' => $clientData,
        'combined_hash'   => hash('sha256', json_encode($serverFingerprint) . json_encode($clientData)),
    ];

    $existing = [];
    if (file_exists($logFile)) {
        $existing = json_decode(file_get_contents($logFile), true) ?? [];
    }
    $existing[] = $entry;
    file_put_contents(
        $logFile,
        json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
    );

    header('Content-Type: application/json');
    echo json_encode([
        'status'    => 'ok',
        'id'        => $entry['id'],
        'hash'      => $entry['combined_hash'],
        'server_fp' => $serverFingerprint,
    ]);
    exit;
}

// ===================================== HTML OUTPUT
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🔍 Advanced Fingerprint Inspector v2.0</title>
<style>
  :root {
    --bg: #0d1117; --surface: #161b22; --border: #30363d;
    --text: #e6edf3; --muted: #8b949e; --accent: #58a6ff;
    --green: #3fb950; --orange: #d29922; --red: #f85149;
    --purple: #bc8cff;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', -apple-system, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; padding: 20px; }
  .container { max-width: 1200px; margin: 0 auto; }
  h1 { text-align: center; margin-bottom: 8px; font-size: 1.8em; }
  .subtitle { text-align: center; color: var(--muted); margin-bottom: 24px; font-size: 0.9em; }
  .stats-bar { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }
  .stat { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px 18px; text-align: center; min-width: 140px; }
  .stat .num { font-size: 1.6em; font-weight: 700; color: var(--accent); }
  .stat .label { font-size: 0.75em; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
  .hash-box { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 14px; text-align: center; margin-bottom: 24px; word-break: break-all; font-family: monospace; font-size: 0.85em; color: var(--green); }
  .section { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
  .section-header { padding: 12px 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); user-select: none; transition: background .2s; }
  .section-header:hover { background: rgba(88,166,255,0.05); }
  .section-header h2 { font-size: 1em; display: flex; align-items: center; gap: 8px; }
  .section-header .badge { background: var(--accent); color: #000; font-size: 0.7em; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
  .section-header .arrow { transition: transform .2s; font-size: 0.8em; color: var(--muted); }
  .section-header.collapsed .arrow { transform: rotate(-90deg); }
  .section-body { padding: 0; max-height: 600px; overflow-y: auto; transition: max-height .3s; }
  .section-header.collapsed + .section-body { max-height: 0; overflow: hidden; padding: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85em; }
  table tr { border-bottom: 1px solid var(--border); }
  table tr:last-child { border-bottom: none; }
  table td { padding: 8px 16px; vertical-align: top; }
  table td:first-child { width: 260px; color: var(--muted); font-family: monospace; font-size: 0.9em; white-space: nowrap; }
  table td:last-child { word-break: break-all; }
  .tag { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 0.75em; margin-right: 4px; }
  .tag-server { background: rgba(188,140,255,0.15); color: var(--purple); border: 1px solid rgba(188,140,255,0.3); }
  .tag-client { background: rgba(63,185,80,0.15); color: var(--green); border: 1px solid rgba(63,185,80,0.3); }
  .canvas-preview { max-width: 300px; border: 1px solid var(--border); border-radius: 4px; margin-top: 4px; }
  .loading { color: var(--orange); }
  .tabs { display: flex; gap: 0; border-bottom: 2px solid var(--border); margin-bottom: 16px; }
  .tab { padding: 10px 20px; cursor: pointer; color: var(--muted); border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all .2s; font-size: 0.9em; }
  .tab.active { color: var(--accent); border-bottom-color: var(--accent); }
  .tab-content { display: none; }
  .tab-content.active { display: block; }
  .progress-bar { width: 100%; height: 4px; background: var(--border); border-radius: 2px; margin-bottom: 20px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--green)); width: 0; transition: width 0.5s; border-radius: 2px; }
  pre.json { background: #0d1117; padding: 16px; overflow-x: auto; font-size: 0.8em; line-height: 1.5; color: var(--text); border-top: 1px solid var(--border); }
  .btn { background: var(--accent); color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9em; transition: opacity .2s; }
  .btn:hover { opacity: 0.8; }
  .export-bar { text-align: center; margin: 20px 0; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  @media (max-width: 768px) {
    table td:first-child { width: 140px; font-size: 0.8em; }
    .stats-bar { flex-direction: column; align-items: center; }
  }
</style>
</head>
<body>
<div class="container">

<h1>🔍 Advanced Fingerprint Inspector v2.0</h1>
<p class="subtitle">Comprehensive Server-Side &amp; Client-Side Fingerprint Analysis</p>

<div class="progress-bar"><div class="progress-fill" id="progress"></div></div>

<div class="stats-bar">
  <div class="stat"><div class="num" id="statServer">-</div><div class="label">Server Params</div></div>
  <div class="stat"><div class="num" id="statClient">-</div><div class="label">Client Params</div></div>
  <div class="stat"><div class="num" id="statTotal">-</div><div class="label">Total Signals</div></div>
  <div class="stat"><div class="num" id="statEntropy">-</div><div class="label">Entropy Bits</div></div>
</div>

<div class="hash-box" id="hashBox">⏳ Generating combined fingerprint hash...</div>

<div class="tabs">
  <div class="tab active" onclick="switchTab('structured')">📋 Structured View</div>
  <div class="tab" onclick="switchTab('raw')">🔧 Raw JSON</div>
</div>

<!-- STRUCTURED VIEW -->
<div class="tab-content active" id="tab-structured">

<!-- SERVER SECTION -->
<div class="section">
  <div class="section-header" onclick="toggleSection(this)">
    <h2><span class="tag tag-server">SERVER</span> 🖥️ Server-Side Fingerprint <span class="badge" id="serverCount">...</span></h2>
    <span class="arrow">▼</span>
  </div>
  <div class="section-body">
    <table id="serverTable">
      <tr><td colspan="2" class="loading">Loading server data...</td></tr>
    </table>
  </div>
</div>

<!-- CLIENT SECTIONS -->
<div id="clientSections">
  <div class="section">
    <div class="section-header">
      <h2><span class="tag tag-client">CLIENT</span> ⏳ Collecting client-side fingerprint...</h2>
    </div>
  </div>
</div>

</div>

<!-- RAW JSON VIEW -->
<div class="tab-content" id="tab-raw">
  <div class="section">
    <div class="section-header" onclick="toggleSection(this)">
      <h2>📦 Server Raw JSON</h2><span class="arrow">▼</span>
    </div>
    <div class="section-body">
      <pre class="json" id="serverJson"><?= htmlspecialchars(json_encode($serverFingerprint, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)) ?></pre>
    </div>
  </div>
  <div class="section">
    <div class="section-header" onclick="toggleSection(this)">
      <h2>📦 Client Raw JSON</h2><span class="arrow">▼</span>
    </div>
    <div class="section-body">
      <pre class="json" id="clientJson">Collecting...</pre>
    </div>
  </div>
</div>

<div class="export-bar">
  <button class="btn" onclick="exportJSON()">📥 Export JSON</button>
  <button class="btn" onclick="copyHash()">📋 Copy Hash</button>
  <button class="btn" onclick="location.reload()">🔄 Re-scan</button>
</div>

</div>

<script>
// ============================================================
//  CLIENT-SIDE FINGERPRINT COLLECTION ENGINE
// ============================================================

const FP = {};

function setProgress(pct) {
  document.getElementById('progress').style.width = pct + '%';
}

// --- 1. Navigator & Browser ---
function collectNavigator() {
  const n = navigator;
  return {
    userAgent:           n.userAgent,
    appName:             n.appName,
    appVersion:          n.appVersion,
    platform:            n.platform,
    vendor:              n.vendor,
    product:             n.product,
    productSub:          n.productSub,
    language:            n.language,
    languages:           n.languages ? [...n.languages] : [],
    cookieEnabled:       n.cookieEnabled,
    doNotTrack:          n.doNotTrack,
    globalPrivacyControl: n.globalPrivacyControl ?? null,
    maxTouchPoints:      n.maxTouchPoints,
    hardwareConcurrency: n.hardwareConcurrency,
    deviceMemory:        n.deviceMemory ?? 'unavailable',
    pdfViewerEnabled:    n.pdfViewerEnabled ?? null,
    webdriver:           n.webdriver,
    onLine:              n.onLine,
    javaEnabled:         typeof n.javaEnabled === 'function' ? n.javaEnabled() : null,
    mimeTypesCount:      n.mimeTypes ? n.mimeTypes.length : 0,
    pluginsCount:        n.plugins ? n.plugins.length : 0,
    plugins:             n.plugins ? Array.from(n.plugins).map(p => ({name:p.name, filename:p.filename, description:p.description})) : [],
  };
}

// --- 2. Document & Referrer ---
function collectDocument() {
  return {
    referrer:          document.referrer || '(direct / no referrer)',
    URL:               document.URL,
    documentURI:       document.documentURI,
    domain:            document.domain,
    title:             document.title,
    characterSet:      document.characterSet,
    contentType:       document.contentType,
    compatMode:        document.compatMode,
    designMode:        document.designMode,
    visibilityState:   document.visibilityState,
    hidden:            document.hidden,
    fullscreenEnabled: document.fullscreenEnabled ?? null,
    pictureInPictureEnabled: document.pictureInPictureEnabled ?? null,
    lastModified:      document.lastModified,
    readyState:        document.readyState,
    childElementCount: document.childElementCount,
    forms:             document.forms.length,
    images:            document.images.length,
    links:             document.links.length,
    scripts:           document.scripts.length,
    styleSheets:       document.styleSheets.length,
    cookieEnabled:     navigator.cookieEnabled,
    cookie_length:     document.cookie.length,
  };
}

// --- 3. Screen & Display ---
function collectScreen() {
  return {
    width:            screen.width,
    height:           screen.height,
    availWidth:       screen.availWidth,
    availHeight:      screen.availHeight,
    colorDepth:       screen.colorDepth,
    pixelDepth:       screen.pixelDepth,
    devicePixelRatio: window.devicePixelRatio,
    innerWidth:       window.innerWidth,
    innerHeight:      window.innerHeight,
    outerWidth:       window.outerWidth,
    outerHeight:      window.outerHeight,
    screenLeft:       window.screenLeft,
    screenTop:        window.screenTop,
    orientation:      screen.orientation ? { angle: screen.orientation.angle, type: screen.orientation.type } : null,
  };
}

// --- 4. Timezone & Locale ---
function collectTimezone() {
  const d = new Date();
  let resolved = {};
  try { resolved = Intl.DateTimeFormat().resolvedOptions(); } catch(e) {}
  return {
    timezone:         resolved.timeZone ?? null,
    timezoneOffset:   d.getTimezoneOffset(),
    locale:           resolved.locale ?? null,
    calendar:         resolved.calendar ?? null,
    numberingSystem:  resolved.numberingSystem ?? null,
    dateString:       d.toString(),
    toLocaleString:   d.toLocaleString(),
  };
}

// --- 5. Canvas Fingerprint ---
function collectCanvas() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 280; canvas.height = 60;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(100, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.font = '14px Arial';
    ctx.fillText('FP Inspector 🔍', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.font = '18px Georgia';
    ctx.fillText('FP Inspector 🔍', 4, 45);
    ctx.beginPath();
    ctx.arc(200, 30, 20, 0, Math.PI * 2);
    const grad = ctx.createLinearGradient(180, 10, 220, 50);
    grad.addColorStop(0, '#ff0000');
    grad.addColorStop(1, '#0000ff');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = '16px serif';
    ctx.fillText('😀🏳️', 240, 35);

    const dataURL = canvas.toDataURL('image/png');
    return {
      dataURL_preview: dataURL.substring(0, 100) + '...',
      dataURL_length:  dataURL.length,
      hash:            simpleHash(dataURL),
      supportedTypes: {
        png:  canvas.toDataURL('image/png').startsWith('data:image/png'),
        jpeg: canvas.toDataURL('image/jpeg').startsWith('data:image/jpeg'),
        webp: canvas.toDataURL('image/webp').startsWith('data:image/webp'),
      },
      _canvasDataURL: dataURL,
    };
  } catch(e) {
    return { error: e.message };
  }
}

// --- 6. WebGL Fingerprint ---
function collectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return { supported: false };

    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const result = {
      supported:       true,
      version:         gl.getParameter(gl.VERSION),
      shadingLanguage: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      vendor:          gl.getParameter(gl.VENDOR),
      renderer:        gl.getParameter(gl.RENDERER),
      unmaskedVendor:  dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : null,
      unmaskedRenderer:dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : null,
      maxTextureSize:  gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS) ? Array.from(gl.getParameter(gl.MAX_VIEWPORT_DIMS)) : null,
      maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      maxVertexAttribs:    gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxVaryingVectors:   gl.getParameter(gl.MAX_VARYING_VECTORS),
      maxVertexUniformVectors:   gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
      maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      maxVertexTextureImageUnits:   gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
      maxTextureImageUnits:         gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
      maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
      aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE) ? Array.from(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)) : null,
      aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) ? Array.from(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)) : null,
      antialias:           gl.getContextAttributes()?.antialias,
      extensions:          gl.getSupportedExtensions(),
      extensionsCount:     gl.getSupportedExtensions()?.length ?? 0,
    };

    try {
      canvas.width = 64; canvas.height = 64;
      gl.viewport(0, 0, 64, 64);
      gl.clearColor(0.2, 0.4, 0.6, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const pixels = new Uint8Array(64 * 64 * 4);
      gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      result.renderHash = simpleHash(pixels.join(','));
    } catch(e) {}

    return result;
  } catch(e) {
    return { error: e.message };
  }
}

// --- 7. AudioContext Fingerprint ---
async function collectAudio() {
  try {
    const AudioCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!AudioCtx) return { supported: false };

    const ctx = new AudioCtx(1, 44100, 44100);
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(10000, ctx.currentTime);

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, ctx.currentTime);
    compressor.knee.setValueAtTime(40, ctx.currentTime);
    compressor.ratio.setValueAtTime(12, ctx.currentTime);
    compressor.attack.setValueAtTime(0, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);

    osc.connect(compressor);
    compressor.connect(ctx.destination);
    osc.start(0);
    ctx.startRendering();

    const buffer = await new Promise((resolve, reject) => {
      ctx.oncomplete = e => resolve(e.renderedBuffer);
      setTimeout(() => reject('timeout'), 3000);
    });

    const data = buffer.getChannelData(0);
    let sum = 0;
    for (let i = 4500; i < 5000; i++) sum += Math.abs(data[i]);

    return {
      supported:  true,
      sampleRate: buffer.sampleRate,
      length:     buffer.length,
      duration:   buffer.duration,
      sum:        sum,
      hash:       simpleHash(Array.from(data.slice(4500, 5000)).join(',')),
    };
  } catch(e) {
    return { error: String(e) };
  }
}

// --- 8. WebRTC Detection ---
async function collectWebRTC() {
  try {
    if (!window.RTCPeerConnection) return { supported: false };

    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.createDataChannel('');
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const ips = await new Promise(resolve => {
      const found = [];
      const timeout = setTimeout(() => resolve(found), 3000);
      pc.onicecandidate = e => {
        if (!e || !e.candidate) { clearTimeout(timeout); resolve(found); return; }
        const parts = e.candidate.candidate.split(' ');
        if (parts[4]) found.push({ ip: parts[4], type: parts[7] || 'unknown', protocol: parts[2] || 'unknown' });
      };
    });
    pc.close();

    return {
      supported:       true,
      candidatesFound: ips.length,
      candidates:      ips,
      sdpFingerprint:  offer.sdp ? simpleHash(offer.sdp) : null,
      mediaCapabilities: {
        getUserMedia:     !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        getDisplayMedia:  !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
        enumerateDevices: !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices),
      }
    };
  } catch(e) {
    return { error: e.message };
  }
}

// --- 9. Media Devices ---
async function collectMediaDevices() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return { supported: false };
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      supported: true,
      count:     devices.length,
      devices:   devices.map(d => ({
        kind:     d.kind,
        label:    d.label || '(no permission)',
        deviceId: d.deviceId ? d.deviceId.substring(0, 16) + '...' : null,
        groupId:  d.groupId ? d.groupId.substring(0, 16) + '...' : null,
      })),
      audioinput:  devices.filter(d => d.kind === 'audioinput').length,
      audiooutput: devices.filter(d => d.kind === 'audiooutput').length,
      videoinput:  devices.filter(d => d.kind === 'videoinput').length,
    };
  } catch(e) {
    return { error: e.message };
  }
}

// --- 10. Font Detection ---
function collectFonts() {
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testFonts = [
    'Arial','Arial Black','Arial Narrow','Calibri','Cambria','Cambria Math',
    'Comic Sans MS','Consolas','Courier','Courier New','Georgia','Helvetica',
    'Impact','Lucida Console','Lucida Sans Unicode','Microsoft Sans Serif',
    'Palatino Linotype','Segoe UI','Tahoma','Times','Times New Roman',
    'Trebuchet MS','Verdana','Wingdings','Roboto','Open Sans','Noto Sans',
    'Ubuntu','DejaVu Sans','Liberation Sans','Fira Code','Source Code Pro',
    'Menlo','Monaco','SF Pro','Apple Color Emoji','Segoe UI Emoji',
  ];

  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';
  const body = document.body;

  const span = document.createElement('span');
  span.style.position = 'absolute';
  span.style.left = '-9999px';
  span.style.fontSize = testSize;
  span.style.lineHeight = 'normal';
  span.textContent = testString;
  body.appendChild(span);

  const baseSizes = {};
  for (const base of baseFonts) {
    span.style.fontFamily = base;
    baseSizes[base] = { w: span.offsetWidth, h: span.offsetHeight };
  }

  const detected = [];
  for (const font of testFonts) {
    let found = false;
    for (const base of baseFonts) {
      span.style.fontFamily = `'${font}', ${base}`;
      if (span.offsetWidth !== baseSizes[base].w || span.offsetHeight !== baseSizes[base].h) {
        found = true; break;
      }
    }
    if (found) detected.push(font);
  }
  body.removeChild(span);

  return {
    tested:   testFonts.length,
    detected: detected,
    count:    detected.length,
    hash:     simpleHash(detected.join(',')),
  };
}

// --- 11. Storage & Features ---
function collectStorage() {
  const test = (fn) => { try { return fn(); } catch(e) { return false; } };
  return {
    localStorage:       test(() => { localStorage.setItem('_fp','1'); localStorage.removeItem('_fp'); return true; }),
    sessionStorage:     test(() => { sessionStorage.setItem('_fp','1'); sessionStorage.removeItem('_fp'); return true; }),
    indexedDB:          !!window.indexedDB,
    openDatabase:       !!window.openDatabase,
    cookieEnabled:      navigator.cookieEnabled,
    serviceWorker:      !!navigator.serviceWorker,
    caches:             !!window.caches,
  };
}

// --- 12. Performance & Timing ---
function collectPerformance() {
  const p = performance;
  const t = p.timing || {};
  const nav = p.getEntriesByType ? p.getEntriesByType('navigation')[0] : null;
  return {
    timeOrigin:           p.timeOrigin,
    navigationStart:      t.navigationStart ?? null,
    domContentLoaded:     t.domContentLoadedEventEnd ? (t.domContentLoadedEventEnd - t.navigationStart) : null,
    loadEvent:            t.loadEventEnd ? (t.loadEventEnd - t.navigationStart) : null,
    connectTime:          t.connectEnd ? (t.connectEnd - t.connectStart) : null,
    navigationType:       nav?.type ?? null,
    redirectCount:        nav?.redirectCount ?? null,
    transferSize:         nav?.transferSize ?? null,
    memoryInfo:           p.memory ? {
      jsHeapSizeLimit:    p.memory.jsHeapSizeLimit,
      totalJSHeapSize:    p.memory.totalJSHeapSize,
      usedJSHeapSize:     p.memory.usedJSHeapSize,
    } : null,
  };
}

// --- 13. Network Information ---
function collectNetwork() {
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c) return { supported: false };
  return {
    supported:     true,
    effectiveType: c.effectiveType,
    downlink:      c.downlink,
    rtt:           c.rtt,
    saveData:      c.saveData,
    type:          c.type ?? null,
    downlinkMax:   c.downlinkMax ?? null,
  };
}

// --- 14. Battery Info ---
async function collectBattery() {
  try {
    if (!navigator.getBattery) return { supported: false };
    const b = await navigator.getBattery();
    return {
      supported:      true,
      charging:       b.charging,
      chargingTime:   b.chargingTime,
      dischargingTime:b.dischargingTime,
      level:          b.level,
    };
  } catch(e) {
    return { error: e.message };
  }
}

// --- 15. Speech Synthesis Voices ---
function collectVoices() {
  try {
    const voices = speechSynthesis?.getVoices?.() || [];
    return {
      count: voices.length,
      voices: voices.map(v => ({
        name:          v.name,
        lang:          v.lang,
        localService:  v.localService,
        default:       v.default,
      })),
    };
  } catch(e) {
    return { error: e.message };
  }
}

// --- 16. Permissions ---
async function collectPermissions() {
  const names = ['geolocation', 'notifications', 'camera', 'microphone',
                 'accelerometer', 'gyroscope', 'magnetometer',
                 'clipboard-read', 'clipboard-write', 'midi',
                 'background-sync', 'ambient-light-sensor'];
  const result = {};
  for (const name of names) {
    try {
      const p = await navigator.permissions.query({ name });
      result[name] = p.state;
    } catch(e) {
      result[name] = 'unsupported';
    }
  }
  return result;
}

// --- 17. CSS & Media Features ---
function collectCSS() {
  const mq = (q) => window.matchMedia(q).matches;
  return {
    prefersColorScheme:   mq('(prefers-color-scheme: dark)') ? 'dark' : (mq('(prefers-color-scheme: light)') ? 'light' : 'no-preference'),
    prefersReducedMotion: mq('(prefers-reduced-motion: reduce)'),
    prefersContrast:      mq('(prefers-contrast: more)') ? 'more' : (mq('(prefers-contrast: less)') ? 'less' : 'no-preference'),
    forcedColors:         mq('(forced-colors: active)'),
    invertedColors:       mq('(inverted-colors: inverted)'),
    hover:                mq('(hover: hover)') ? 'hover' : 'none',
    pointer:              mq('(pointer: fine)') ? 'fine' : (mq('(pointer: coarse)') ? 'coarse' : 'none'),
    anyPointer:           mq('(any-pointer: fine)') ? 'fine' : (mq('(any-pointer: coarse)') ? 'coarse' : 'none'),
    colorGamut:           mq('(color-gamut: rec2020)') ? 'rec2020' : (mq('(color-gamut: p3)') ? 'p3' : 'srgb'),
    hdr:                  mq('(dynamic-range: high)'),
    displayMode:          mq('(display-mode: standalone)') ? 'standalone' : (mq('(display-mode: fullscreen)') ? 'fullscreen' : 'browser'),
  };
}

// --- 18. Gamepad ---
function collectGamepad() {
  try {
    const gamepads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
    return {
      supported: !!navigator.getGamepads,
      connected: gamepads.length,
      gamepads:  gamepads.map(g => ({ id: g.id, buttons: g.buttons.length, axes: g.axes.length })),
    };
  } catch(e) {
    return { error: e.message };
  }
}

// --- 19. Math & Intl Constants ---
function collectMath() {
  return {
    'Math.E':      Math.E,
    'Math.PI':     Math.PI,
    'Math.LN2':    Math.LN2,
    'Math.SQRT2':  Math.SQRT2,
    'Math.tan(-1e300)': Math.tan(-1e300),
    'Math.sinh(1)':     Math.sinh(1),
    'Math.cosh(1)':     Math.cosh(1),
    'Math.expm1(1)':    Math.expm1(1),
    'Math.log1p(1)':    Math.log1p(1),
    'Math.atanh(0.5)':  Math.atanh(0.5),
    'Math.cbrt(2)':     Math.cbrt(2),
    numberFormat: Intl.NumberFormat ? new Intl.NumberFormat().resolvedOptions() : null,
    dateTimeLocales: Intl.DateTimeFormat ? Intl.DateTimeFormat.supportedLocalesOf(['id-ID','en-US','ja-JP','zh-CN']) : [],
  };
}

// --- 20. Feature Detection ---
function collectFeatures() {
  return {
    webGL:             !!window.WebGLRenderingContext,
    webGL2:            !!window.WebGL2RenderingContext,
    webGPU:            !!navigator.gpu,
    webAssembly:       !!window.WebAssembly,
    sharedWorker:      !!window.SharedWorker,
    webSocket:         !!window.WebSocket,
    fetch:             !!window.fetch,
    promise:           !!window.Promise,
    proxy:             !!window.Proxy,
    symbol:            !!window.Symbol,
    bigInt:            typeof BigInt !== 'undefined',
    weakRef:           !!window.WeakRef,
    intersectionObserver: !!window.IntersectionObserver,
    resizeObserver:    !!window.ResizeObserver,
    mutationObserver:  !!window.MutationObserver,
    broadcastChannel:  !!window.BroadcastChannel,
    bluetooth:         !!navigator.bluetooth,
    usb:               !!navigator.usb,
    serial:            !!navigator.serial,
    hid:               !!navigator.hid,
    xr:                !!navigator.xr,
    credentials:       !!navigator.credentials,
    presentation:      !!navigator.presentation,
    wakeLock:          !!navigator.wakeLock,
    clipboard:         !!navigator.clipboard,
    share:             !!navigator.share,
    scheduling:        !!navigator.scheduling,
  };
}

// --- 21. Touch & Input ---
function collectTouch() {
  return {
    maxTouchPoints:    navigator.maxTouchPoints,
    touchEvent:        'ontouchstart' in window,
    touchEventCreatable: (() => { try { document.createEvent('TouchEvent'); return true; } catch(e) { return false; }})(),
    pointerEvent:      !!window.PointerEvent,
    mouseEvent:        !!window.MouseEvent,
  };
}

// --- Utility: Simple Hash ---
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// --- Count object keys recursively ---
function countParams(obj) {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      count += countParams(obj[key]);
    } else {
      count++;
    }
  }
  return count;
}

// ============================================================
//  RENDERING
// ============================================================

const serverData = <?= json_encode($serverFingerprint, JSON_UNESCAPED_SLASHES) ?>;

function renderTable(tableId, data) {
  const table = document.getElementById(tableId);
  if (!table) return;
  table.innerHTML = '';
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('_')) continue;
    const tr = document.createElement('tr');
    let display = value;
    if (typeof value === 'object' && value !== null) {
      display = JSON.stringify(value, null, 2);
    } else if (value === null || value === undefined) {
      display = '<span style="color:var(--muted)">null</span>';
    } else if (value === true) {
      display = '<span style="color:var(--green)">✅ true</span>';
    } else if (value === false) {
      display = '<span style="color:var(--red)">❌ false</span>';
    }
    tr.innerHTML = `<td>${key}</td><td>${typeof display === 'string' && display.startsWith('<') ? display : escapeHtml(String(display))}</td>`;
    table.appendChild(tr);
  }
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function createSection(icon, label, tag, id, data) {
  const div = document.createElement('div');
  div.className = 'section';
  const count = countParams(data);
  div.innerHTML = `
    <div class="section-header" onclick="toggleSection(this)">
      <h2><span class="tag tag-${tag}">${tag.toUpperCase()}</span> ${icon} ${label} <span class="badge">${count}</span></h2>
      <span class="arrow">▼</span>
    </div>
    <div class="section-body"><table id="${id}"></table></div>
  `;
  return div;
}

function toggleSection(header) {
  header.classList.toggle('collapsed');
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelector(`.tab-content#tab-${name}`).classList.add('active');
  event.target.classList.add('active');
}

// ============================================================
//  MAIN EXECUTION
// ============================================================

(async function main() {
  renderTable('serverTable', serverData);
  const serverParams = countParams(serverData);
  document.getElementById('serverCount').textContent = serverParams;
  document.getElementById('statServer').textContent = serverParams;
  setProgress(15);

  const clientSections = document.getElementById('clientSections');
  clientSections.innerHTML = '';

  const sections = [
    { icon: '🌐', label: 'Navigator & Browser',    id: 'tNav',     fn: () => collectNavigator() },
    { icon: '📄', label: 'Document & Referrer',     id: 'tDoc',     fn: () => collectDocument() },
    { icon: '🖥️', label: 'Screen & Display',       id: 'tScreen',  fn: () => collectScreen() },
    { icon: '🕐', label: 'Timezone & Locale',       id: 'tTZ',      fn: () => collectTimezone() },
    { icon: '🎨', label: 'Canvas Fingerprint',      id: 'tCanvas',  fn: () => collectCanvas() },
    { icon: '🔺', label: 'WebGL Fingerprint',       id: 'tWebGL',   fn: () => collectWebGL() },
    { icon: '🔊', label: 'AudioContext Fingerprint', id: 'tAudio',  fn: () => collectAudio() },
    { icon: '📡', label: 'WebRTC Detection',        id: 'tRTC',     fn: () => collectWebRTC() },
    { icon: '🎤', label: 'Media Devices',           id: 'tMedia',   fn: () => collectMediaDevices() },
    { icon: '🔤', label: 'Font Detection',          id: 'tFonts',   fn: () => collectFonts() },
    { icon: '💾', label: 'Storage & Features',      id: 'tStorage', fn: () => collectStorage() },
    { icon: '⚡', label: 'Performance & Timing',    id: 'tPerf',    fn: () => collectPerformance() },
    { icon: '📶', label: 'Network Information',     id: 'tNet',     fn: () => collectNetwork() },
    { icon: '🔋', label: 'Battery Status',          id: 'tBatt',    fn: () => collectBattery() },
    { icon: '🗣️', label: 'Speech Synthesis Voices', id: 'tVoice',  fn: () => collectVoices() },
    { icon: '🔐', label: 'Permissions Status',      id: 'tPerm',    fn: () => collectPermissions() },
    { icon: '🎨', label: 'CSS & Media Features',    id: 'tCSS',     fn: () => collectCSS() },
    { icon: '🎮', label: 'Gamepad API',             id: 'tGPad',    fn: () => collectGamepad() },
    { icon: '🔢', label: 'Math & Intl Constants',   id: 'tMath',    fn: () => collectMath() },
    { icon: '⚙️', label: 'Feature Detection',       id: 'tFeat',    fn: () => collectFeatures() },
    { icon: '👆', label: 'Touch & Input',            id: 'tTouch',   fn: () => collectTouch() },
  ];

  const allClientData = {};
  let totalClient = 0;
  let done = 0;

  for (const sec of sections) {
    const data = await sec.fn();
    allClientData[sec.id] = data;
    const el = createSection(sec.icon, sec.label, 'client', sec.id, data);
    clientSections.appendChild(el);
    renderTable(sec.id, data);
    totalClient += countParams(data);
    done++;
    setProgress(15 + Math.round((done / sections.length) * 70));
  }

  // Show canvas preview
  try {
    const canvasData = allClientData['tCanvas']?._canvasDataURL;
    if (canvasData) {
      const canvasTable = document.getElementById('tCanvas');
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>canvas_preview</td><td><img class="canvas-preview" src="${canvasData}" alt="Canvas render"></td>`;
      canvasTable.appendChild(tr);
    }
  } catch(e) {}

  // Stats
  document.getElementById('statClient').textContent = totalClient;
  document.getElementById('statTotal').textContent = serverParams + totalClient;
  document.getElementById('statEntropy').textContent = '~' + (serverParams + totalClient);

  // Update raw JSON
  document.getElementById('clientJson').textContent = JSON.stringify(allClientData, null, 2);

  setProgress(90);

  // POST to server
  try {
    const resp = await fetch(location.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allClientData),
    });
    const result = await resp.json();
    document.getElementById('hashBox').textContent = '🔒 Combined Hash: ' + result.hash;
    document.getElementById('hashBox').dataset.hash = result.hash;
  } catch(e) {
    document.getElementById('hashBox').textContent = '⚠️ Could not send to server: ' + e.message;
    document.getElementById('hashBox').dataset.hash = simpleHash(JSON.stringify(allClientData));
  }

  setProgress(100);

  // Retry voices (Chrome loads them async)
  setTimeout(() => {
    const voices = collectVoices();
    if (voices.count > 0) {
      allClientData['tVoice'] = voices;
      renderTable('tVoice', voices);
    }
  }, 1000);
})();

// Export functions
function exportJSON() {
  const data = {
    server: serverData,
    client: JSON.parse(document.getElementById('clientJson').textContent),
    hash: document.getElementById('hashBox').dataset?.hash || 'unknown',
    exported_at: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'fingerprint_' + Date.now() + '.json';
  a.click();
}

function copyHash() {
  const hash = document.getElementById('hashBox').dataset?.hash || document.getElementById('hashBox').textContent;
  navigator.clipboard?.writeText(hash).then(() => {
    const btn = event.target;
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.textContent = '📋 Copy Hash', 1500);
  });
}
</script>
</body>
</html>
