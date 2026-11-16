<?php

@ini_set('display_errors', '0');
error_reporting(0);

// PROXY INVERSO
// Cabeceras CORS
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type, Accept, Origin, X-Requested-With, X-Auth-Token");

// Responder inmediatamente a peticiones preflight OPTIONS
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Configuración cargada 100% desde el archivo .env
$ENCRYPTION_KEY = '';
$BACKEND_API_BASE = '';
$loadedEnvFile = null;

// Cargar variables desde getenv / $_ENV si el servidor las tiene inyectadas
if (!empty(getenv('VITE_ENCRYPTION_KEY'))) {
    $ENCRYPTION_KEY = getenv('VITE_ENCRYPTION_KEY');
} elseif (!empty($_ENV['VITE_ENCRYPTION_KEY'])) {
    $ENCRYPTION_KEY = $_ENV['VITE_ENCRYPTION_KEY'];
}

if (!empty(getenv('VITE_API_URL'))) {
    $clean = rtrim(getenv('VITE_API_URL'), '/');
    $BACKEND_API_BASE = (strpos($clean, '/server.php/api') !== false) ? $clean : "{$clean}/server.php/api";
} elseif (!empty($_ENV['VITE_API_URL'])) {
    $clean = rtrim($_ENV['VITE_API_URL'], '/');
    $BACKEND_API_BASE = (strpos($clean, '/server.php/api') !== false) ? $clean : "{$clean}/server.php/api";
}

// Buscar y cargar el archivo .env si está disponible en la carpeta local o superior
$possibleEnvPaths = array(
    __DIR__ . '/.env',
    __DIR__ . '/../.env',
    dirname(__DIR__) . '/.env'
);

foreach ($possibleEnvPaths as $envPath) {
    if (file_exists($envPath) && is_file($envPath)) {
        $lines = @file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines !== false) {
            $loadedEnvFile = realpath($envPath);
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || strpos($line, '#') === 0) continue;
                $parts = explode('=', $line, 2);
                if (count($parts) === 2) {
                    $envKey = trim($parts[0]);
                    $envVal = trim($parts[1], " \t\n\r\0\x0B\"'");
                    if (($envKey === 'VITE_ENCRYPTION_KEY' || $envKey === 'ENCRYPTION_KEY') && !empty($envVal)) {
                        $ENCRYPTION_KEY = $envVal;
                    } elseif (($envKey === 'VITE_API_URL' || $envKey === 'API_URL') && !empty($envVal)) {
                        $clean = rtrim($envVal, '/');
                        $BACKEND_API_BASE = (strpos($clean, '/server.php/api') !== false) ? $clean : "{$clean}/server.php/api";
                    } elseif (($envKey === 'VITE_BACKEND_API_BASE' || $envKey === 'BACKEND_API_BASE') && !empty($envVal)) {
                        $BACKEND_API_BASE = rtrim($envVal, '/');
                    }
                }
            }
        }
        break;
    }
}

// Si no se encontró el .env o faltan variables críticas, detener con mensaje claro
if (empty($BACKEND_API_BASE) || empty($ENCRYPTION_KEY)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array(
        'success' => false,
        'message' => 'Error de configuracion: No se encontro el archivo .env o faltan variables (VITE_API_URL, VITE_ENCRYPTION_KEY).'
    ), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// Función para desencriptar cadenas AES generadas por CryptoJS
function decryptCryptoJS($cipherText, $passphrase) {
    $data = base64_decode($cipherText);
    if (!$data || substr($data, 0, 8) !== "Salted__") {
        return false;
    }
    $salt = substr($data, 8, 8);
    $ciphertext = substr($data, 16);

    // Derivación de clave OpenSSL EVP_BytesToKey (MD5)
    $rounds = 3;
    $data00 = $passphrase . $salt;
    $md5_hash = array();
    $md5_hash[0] = md5($data00, true);
    $result = $md5_hash[0];
    for ($i = 1; $i < $rounds; $i++) {
        $md5_hash[$i] = md5($md5_hash[$i - 1] . $data00, true);
        $result .= $md5_hash[$i];
    }
    $key = substr($result, 0, 32);
    $iv  = substr($result, 32, 16);

    return openssl_decrypt($ciphertext, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
}

// Función para encriptar cadenas en formato compatible con CryptoJS AES
function encryptCryptoJS($plainText, $passphrase) {
    $salt = openssl_random_pseudo_bytes(8);
    $rounds = 3;
    $data00 = $passphrase . $salt;
    $md5_hash = array();
    $md5_hash[0] = md5($data00, true);
    $result = $md5_hash[0];
    for ($i = 1; $i < $rounds; $i++) {
        $md5_hash[$i] = md5($md5_hash[$i - 1] . $data00, true);
        $result .= $md5_hash[$i];
    }
    $key = substr($result, 0, 32);
    $iv  = substr($result, 32, 16);

    $ciphertext = openssl_encrypt($plainText, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
    return base64_encode("Salted__" . $salt . $ciphertext);
}

// Obtener el endpoint solicitado
$endpoint = '';
if (isset($_GET['endpoint'])) {
    $endpoint = trim($_GET['endpoint']);
} elseif (isset($_SERVER['PATH_INFO'])) {
    $endpoint = trim($_SERVER['PATH_INFO'], '/');
} elseif (isset($_SERVER['REQUEST_URI'])) {
    $parts = preg_split('#/server\.php(?:/api)?/#', $_SERVER['REQUEST_URI']);
    if (isset($parts[1])) {
        $cleanPath = explode('?', $parts[1])[0];
        $endpoint = trim($cleanPath, '/');
    }
}

$endpoint = preg_replace('#^/?(?:server\.php/?)*(?:api/?)*#i', '', $endpoint);
$endpoint = trim($endpoint, '/');

// Si se visita server.php directamente en el navegador sin endpoint, mostrar estado del servidor
if (empty($endpoint) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array(
        'status' => 'online',
        'message' => 'BiblioRecreo Server PHP activo y funcionando correctamente',
        'openssl' => extension_loaded('openssl') || function_exists('openssl_decrypt'),
        'curl' => extension_loaded('curl') || function_exists('curl_init'),
        'backend' => $BACKEND_API_BASE,
        'env_file' => $loadedEnvFile ?: 'Ninguno (usando configuracion base)'
    ), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// Construir parámetros de consulta preservando los originales
$queryParams = $_GET;
unset($queryParams['endpoint']);

$targetUrl = rtrim($BACKEND_API_BASE, '/') . '/' . ltrim($endpoint, '/');
if (!empty($queryParams)) {
    $separator = (strpos($targetUrl, '?') === false) ? '?' : '&';
    $targetUrl .= $separator . http_build_query($queryParams);
}

// Extraer y procesar cabeceras de autorización o cookie
$headersToSend = array();
$authHeader = '';

if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
} elseif (function_exists('apache_request_headers')) {
    $apacheHeaders = apache_request_headers();
    foreach ($apacheHeaders as $name => $val) {
        if (strtolower($name) === 'authorization') {
            $authHeader = $val;
            break;
        }
    }
} elseif (function_exists('getallheaders')) {
    $clientHeaders = getallheaders();
    foreach ($clientHeaders as $name => $val) {
        if (strtolower($name) === 'authorization') {
            $authHeader = $val;
            break;
        }
    }
}

// Obtener el token ya sea de Authorization o de la Cookie tk
$rawToken = '';
if (!empty($authHeader)) {
    $rawToken = trim(preg_replace('/^Bearer\s+/i', '', $authHeader));
} elseif (isset($_COOKIE['tk'])) {
    $rawToken = trim($_COOKIE['tk']);
} elseif (isset($_SERVER['HTTP_COOKIE'])) {
    if (preg_match('/(?:^|;\s*)tk=([^;]+)/', $_SERVER['HTTP_COOKIE'], $matches)) {
        $rawToken = trim(urldecode($matches[1]));
    }
}

if (empty($rawToken) && isset($_SERVER['HTTP_X_AUTH_TOKEN'])) {
    $rawToken = trim($_SERVER['HTTP_X_AUTH_TOKEN']);
}

// Desencriptar el token y agregar la cabecera Authorization para Laravel
if (!empty($rawToken)) {
    if (strpos($rawToken, 'U2FsdGVkX1') === 0) {
        $decryptedJwt = decryptCryptoJS($rawToken, $ENCRYPTION_KEY);
        if ($decryptedJwt) {
            $headersToSend[] = "Authorization: Bearer " . trim($decryptedJwt);
        } else {
            $headersToSend[] = "Authorization: Bearer " . $rawToken;
        }
    } else {
        $headersToSend[] = "Authorization: Bearer " . $rawToken;
    }
}

// Reenviar Content-Type si está presente
if (isset($_SERVER['CONTENT_TYPE'])) {
    $headersToSend[] = "Content-Type: " . $_SERVER['CONTENT_TYPE'];
} elseif (isset($_SERVER['HTTP_CONTENT_TYPE'])) {
    $headersToSend[] = "Content-Type: " . $_SERVER['HTTP_CONTENT_TYPE'];
}

$headersToSend[] = "Accept: application/json, text/plain, */*";

// Ejecutar petición cURL hacia Laravel (Optimizado para baja latencia)
$ch = curl_init($targetUrl);
$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headersToSend);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
// Optimizaciones de velocidad cURL
curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4); 
curl_setopt($ch, CURLOPT_TCP_NODELAY, 1);             
curl_setopt($ch, CURLOPT_ENCODING, '');          

if (isset($_SERVER['HTTP_COOKIE']) && !empty($_SERVER['HTTP_COOKIE'])) {
    curl_setopt($ch, CURLOPT_COOKIE, $_SERVER['HTTP_COOKIE']);
}

// Reenviar cuerpo de la petición
if ($method !== 'GET' && $method !== 'HEAD') {
    $inputBody = file_get_contents('php://input');
    if (!empty($inputBody)) {
        // Desencriptar PASSWORD_USUARIO si viene cifrado en el payload para no exponerlo en DevTools
        if (strpos($inputBody, 'PASSWORD_USUARIO') !== false && strpos($inputBody, 'U2FsdGVkX1') !== false) {
            $parsedJson = json_decode($inputBody, true);
            if (is_array($parsedJson) && !empty($parsedJson['PASSWORD_USUARIO'])) {
                if (is_string($parsedJson['PASSWORD_USUARIO']) && strpos($parsedJson['PASSWORD_USUARIO'], 'U2FsdGVkX1') === 0) {
                    $decryptedPass = decryptCryptoJS($parsedJson['PASSWORD_USUARIO'], $ENCRYPTION_KEY);
                    if ($decryptedPass !== false) {
                        $parsedJson['PASSWORD_USUARIO'] = $decryptedPass;
                        $inputBody = json_encode($parsedJson, JSON_UNESCAPED_SLASHES);
                    }
                }
            }
        }
        curl_setopt($ch, CURLOPT_POSTFIELDS, $inputBody);
    } elseif (!empty($_POST) || !empty($_FILES)) {
        $postData = array();
        foreach ($_POST as $k => $v) {
            if ($k === 'PASSWORD_USUARIO' && is_string($v) && strpos($v, 'U2FsdGVkX1') === 0) {
                $decryptedPass = decryptCryptoJS($v, $ENCRYPTION_KEY);
                $postData[$k] = ($decryptedPass !== false) ? $decryptedPass : $v;
            } else {
                $postData[$k] = $v;
            }
        }
        foreach ($_FILES as $k => $f) {
            if (is_array($f['tmp_name'])) {
                foreach ($f['tmp_name'] as $idx => $tmp) {
                    if (!empty($tmp) && is_uploaded_file($tmp)) {
                        $postData["{$k}[{$idx}]"] = new CURLFile($tmp, $f['type'][$idx], $f['name'][$idx]);
                    }
                }
            } elseif (!empty($f['tmp_name']) && is_uploaded_file($f['tmp_name'])) {
                $postData[$k] = new CURLFile($f['tmp_name'], $f['type'], $f['name']);
            }
        }
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        $headersToSend = array_values(array_filter($headersToSend, function($h) {
            return stripos($h, 'Content-Type:') === false;
        }));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headersToSend);
    }
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(array(
        'success' => false,
        'message' => 'Error de comunicación con el backend de Laravel: ' . $curlError
    ));
    exit;
}

// Encriptar el token en la respuesta si viene en texto plano
if (!empty($response) && strpos($response, 'eyJ') !== false) {
    $json = json_decode($response, true);
    if (is_array($json)) {
        $modified = false;
        $encToken = null;
        if (isset($json['token']) && is_string($json['token']) && strpos($json['token'], 'eyJ') === 0) {
            $encToken = encryptCryptoJS($json['token'], $ENCRYPTION_KEY);
            $json['token'] = $encToken;
            $modified = true;
        }
        if (isset($json['user']['token']) && is_string($json['user']['token']) && strpos($json['user']['token'], 'eyJ') === 0) {
            $enc = encryptCryptoJS($json['user']['token'], $ENCRYPTION_KEY);
            $json['user']['token'] = $enc;
            if (!$encToken) $encToken = $enc;
            $modified = true;
        }
        if (isset($json['data']['token']) && is_string($json['data']['token']) && strpos($json['data']['token'], 'eyJ') === 0) {
            $enc = encryptCryptoJS($json['data']['token'], $ENCRYPTION_KEY);
            $json['data']['token'] = $enc;
            if (!$encToken) $encToken = $enc;
            $modified = true;
        }
        if ($modified) {
            // Establecer la cookie tk encriptada en la respuesta HTTP
            if (!empty($encToken)) {
                $isHttps = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ||
                           (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
                $cookieExpire = isset($json['expires_in']) ? time() + intval($json['expires_in']) : time() + 86400;
                setcookie('tk', $encToken, array(
                    'expires' => $cookieExpire,
                    'path' => '/',
                    'httponly' => false,
                    'secure' => $isHttps,
                    'samesite' => $isHttps ? 'None' : 'Lax'
                ));
            }
            $response = json_encode($json, JSON_UNESCAPED_SLASHES);
        }
    }
}

http_response_code($httpCode ?: 200);
if ($contentType) {
    header("Content-Type: $contentType");
}
echo $response;

