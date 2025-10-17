<?php
/**
 * Configuração de Desenvolvimento
 * 
 * Define se o sistema deve operar em modo de desenvolvimento.
 * Em modo de desenvolvimento (true), as APIs não requerem autenticação de sessão.
 * IMPORTANTE: Mude para false em produção!
 */

define('DEVELOPMENT_MODE', true);

/**
 * User ID padrão para modo de desenvolvimento
 * Este ID será usado quando não houver sessão ativa
 */
define('DEV_USER_ID', 1);

/**
 * Função auxiliar para obter o user_id atual
 * Retorna o user_id da sessão ou o DEV_USER_ID se em modo de desenvolvimento
 */
function getCurrentUserId() {
    if (DEVELOPMENT_MODE && !isset($_SESSION['user_id'])) {
        return DEV_USER_ID;
    }
    return $_SESSION['user_id'] ?? null;
}

/**
 * Função auxiliar para verificar se o usuário está autenticado
 * Em modo de desenvolvimento, sempre retorna true
 */
function isAuthenticated() {
    if (DEVELOPMENT_MODE) {
        return true;
    }
    return isset($_SESSION['user_id']);
}
?>
