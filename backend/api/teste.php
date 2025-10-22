<?php
$senha_digitada = "password";
$senha_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

if (password_verify($senha_digitada, $senha_hash)) {
    echo "✅ Senha CORRETA!";
} else {
    echo "❌ Senha INCORRETA!";
}
?>