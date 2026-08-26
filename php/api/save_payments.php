<?php
/**
 * POST /php/api/save_payment.php
 * Reçoit un JSON contenant les champs du formulaire et enregistre
 * le paiement en base de données.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config.php';

function respond(int $httpCode, array $body): void
{
    http_response_code($httpCode);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['success' => false, 'message' => 'Méthode non autorisée.']);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    respond(400, ['success' => false, 'message' => 'Corps de requête JSON invalide.']);
}

// ---- Validation minimale côté serveur ----
$fullName  = trim((string)($data['fullName']  ?? ''));
$phone     = trim((string)($data['phone']     ?? ''));
$email     = trim((string)($data['email']     ?? ''));
$reference = trim((string)($data['reference'] ?? ''));
$method    = trim((string)($data['method']    ?? ''));
$currency  = trim((string)($data['currency']  ?? 'BIF'));
$note      = trim((string)($data['note']      ?? ''));
$amount    = $data['amount'] ?? null;

$errors = [];
if ($fullName === '' || mb_strlen($fullName) < 2) $errors[] = 'Nom complet invalide.';
if (!preg_match('/^[+0-9\s-]{7,20}$/', $phone))    $errors[] = 'Téléphone invalide.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))    $errors[] = 'E-mail invalide.';
if ($reference === '')                             $errors[] = 'Référence requise.';
if (!is_numeric($amount) || (float)$amount <= 0)   $errors[] = 'Montant invalide.';
if (!in_array($currency, ['BIF', 'USD', 'EUR'], true)) $currency = 'BIF';
if ($method === '') $method = 'Non précisé';

if (!empty($errors)) {
    respond(422, ['success' => false, 'message' => implode(' ', $errors)]);
}

try {
    $pdo = getDbConnection();

    $stmt = $pdo->prepare(
        'INSERT INTO payments
            (full_name, phone, email, reference_code, payment_method, amount, currency, note, status, created_at)
         VALUES
            (:full_name, :phone, :email, :reference_code, :payment_method, :amount, :currency, :note, "pending", NOW())'
    );

    $stmt->execute([
        ':full_name'      => $fullName,
        ':phone'          => $phone,
        ':email'          => $email,
        ':reference_code' => $reference,
        ':payment_method' => $method,
        ':amount'         => (float)$amount,
        ':currency'       => $currency,
        ':note'           => $note,
    ]);

    $id = (int)$pdo->lastInsertId();

    respond(201, [
        'success' => true,
        'id'      => $id,
        'message' => 'Paiement enregistré avec succès.',
    ]);

} catch (PDOException $e) {
    // En production, journaliser $e->getMessage() plutôt que l'exposer au client.
    respond(500, [
        'success' => false,
        'message' => 'Erreur serveur lors de l\'enregistrement du paiement.',
    ]);
}

