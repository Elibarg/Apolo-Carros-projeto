<?php
class Response {
    public static function send($data, $status_code = 200) {
        http_response_code($status_code);
        echo json_encode($data);
        exit;
    }

    public static function error($message, $status_code = 400) {
        self::send([
            'success' => false,
            'message' => $message
        ], $status_code);
    }

    public static function success($data = [], $message = '') {
        self::send([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }

    public static function unauthorized($message = 'Acesso não autorizado') {
        self::error($message, 401);
    }

    public static function notFound($message = 'Recurso não encontrado') {
        self::error($message, 404);
    }
}
?>