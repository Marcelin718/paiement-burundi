<?php
/**
 * GET /php/api/get_payments.php
 * Retourne la liste des paiements enregistrés (les plus récents en premier).
 * Paramètres optionnels : ?limit=50&offset=0
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config.php';

$limit  = isset($_GET['limit'])  ? max(1, min(200, (int)$_GET['limit']))  : 50;
$offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;

try {
    $pdo = getDbConnection();

    $stmt = $pdo->prepare(
        'SELECT id, full_name, phone, email, reference_code, payment_method,
                amount, currency, note, status, created_at
         FROM payments
         ORDER BY created_at DESC
         LIMIT :limit OFFSET :offset'
    );
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode([
        'success'  => true,
        'payments' => $stmt->fetchAll(),
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur lors de la récupération des paiements.',
    ], JSON_UNESCAPED_UNICODE);
}

