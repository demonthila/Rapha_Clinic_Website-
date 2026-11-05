<?php
/**
 * Rapha Physio Care — contact form handler (cPanel / PHP mail).
 * Sends website enquiries to the clinic email and returns JSON.
 * Built by NovaLink Innovations.
 */
header('Content-Type: application/json; charset=utf-8');

// ---- Settings -------------------------------------------------------------
$TO_EMAIL   = 'connectraphaphysio@gmail.com';            // where enquiries go
$FROM_EMAIL = 'no-reply@' . preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'localhost'); // must be on the site's domain
$SUBJECT    = 'New website enquiry – Rapha Physio Care';
// ---------------------------------------------------------------------------

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// Spam trap: real visitors never fill this hidden field.
if (!empty($_POST['website'])) {
    echo json_encode(['ok' => true]);
    exit;
}

// Simple rate limit: one enquiry per 30 seconds per visitor.
session_start();
if (isset($_SESSION['last_enquiry']) && time() - $_SESSION['last_enquiry'] < 30) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'Please wait a moment before sending again.']);
    exit;
}

function clean($key, $max = 500) {
    $v = trim((string)($_POST[$key] ?? ''));
    $v = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $v);
    return mb_substr(strip_tags($v), 0, $max);
}

$name     = clean('name', 120);
$phone    = clean('phone', 40);
$email    = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL) ?: '';
$type     = clean('type', 40);
$time     = clean('preferred_time', 120);
$referred = clean('referred_by', 120);
$reason   = mb_substr(strip_tags(trim((string)($_POST['reason'] ?? ''))), 0, 2000);

if ($name === '' || $phone === '' || $email === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Please fill in your name, phone and a valid email.']);
    exit;
}

$body  = "New enquiry from the Rapha Physio Care website\n\n";
$body .= "Name: $name\nPhone: $phone\nEmail: $email\n";
$body .= "Appointment type: $type\nPreferred time: $time\nReferred by: $referred\n\n";
$body .= "Reason for visit:\n$reason\n";

$headers  = "From: Rapha Physio Care Website <$FROM_EMAIL>\r\n";
$headers .= "Reply-To: $name <$email>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($TO_EMAIL, $SUBJECT, $body, $headers, '-f' . $FROM_EMAIL);

if ($sent) {
    $_SESSION['last_enquiry'] = time();
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Mail could not be sent.']);
}
