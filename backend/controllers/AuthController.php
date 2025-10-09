<?php
class AuthController {
    private $user;
    private $auth;

    public function __construct($db) {
        $this->user = new User($db);
        $this->auth = new Auth($db);
    }

    // Registrar novo usuário
    public function register($data) {
        $data = Validation::sanitizeInput($data);

        $required = ['nome_completo', 'email', 'senha', 'cpf', 'telefone'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                Response::error("Campo {$field} é obrigatório");
            }
        }

        if (!Validation::validateEmail($data['email'])) {
            Response::error('Email inválido');
        }

        if (!Validation::validateCPF($data['cpf'])) {
            Response::error('CPF inválido');
        }

        if (!Validation::validatePassword($data['senha'])) {
            Response::error('Senha deve ter pelo menos 6 caracteres');
        }

        $this->user->email = $data['email'];
        if ($this->user->emailExists()) {
            Response::error('Email já cadastrado');
        }

        $this->user->cpf = $data['cpf'];
        if ($this->user->cpfExists()) {
            Response::error('CPF já cadastrado');
        }

        $this->user->nome_completo = $data['nome_completo'];
        $this->user->email = $data['email'];
        $this->user->senha = $data['senha'];
        $this->user->cpf = $data['cpf'];
        $this->user->telefone = $data['telefone'];
        $this->user->genero = $data['genero'] ?? null;
        $this->user->data_nascimento = $data['data_nascimento'] ?? null;
        $this->user->cep = $data['cep'] ?? null;
        $this->user->estado = $data['estado'] ?? null;
        $this->user->cidade = $data['cidade'] ?? null;
        $this->user->endereco = $data['endereco'] ?? null;
        $this->user->numero = $data['numero'] ?? null;
        $this->user->complemento = $data['complemento'] ?? null;
        $this->user->tipo = 'user'; // Sempre user no registro normal

        if ($this->user->create()) {
            Response::success([], 'Usuário criado com sucesso');
        } else {
            Response::error('Erro ao criar usuário');
        }
    }

    // ✅ LOGIN ATUALIZADO COM REDIRECIONAMENTO
    public function login($data) {
        $data = Validation::sanitizeInput($data);

        if (empty($data['email']) || empty($data['senha'])) {
            Response::error('Email e senha são obrigatórios');
        }

        $this->user->email = $data['email'];
        $user_data = $this->user->getByEmail();

        if (!$user_data || !password_verify($data['senha'], $user_data['senha'])) {
            Response::error('Email ou senha incorretos');
        }

        if ($user_data['status'] !== 'active') {
            Response::error('Conta desativada');
        }

        $token = $this->auth->createSession($user_data['id']);
        if (!$token) {
            Response::error('Erro ao criar sessão');
        }

        // ✅ REDIRECIONAMENTO BASEADO NO TIPO
        $isAdmin = ($user_data['tipo'] === 'admin');
        $redirectTo = $isAdmin ? '/html/adm/painel_de_vendas.html' : '/html/index.html';

        Response::success([
            'token' => $token,
            'user' => [
                'id' => $user_data['id'],
                'nome_completo' => $user_data['nome_completo'],
                'email' => $user_data['email'],
                'tipo' => $user_data['tipo'],
                'isAdmin' => $isAdmin
            ],
            'redirectTo' => $redirectTo
        ], 'Login realizado com sucesso');
    }

    // Logout
    public function logout($token) {
        if ($this->auth->deleteSession($token)) {
            Response::success([], 'Logout realizado com sucesso');
        } else {
            Response::error('Erro ao fazer logout');
        }
    }

    // Verificar token
    public function verify($token) {
        $user_data = $this->auth->validateToken($token);
        if ($user_data) {
            $this->user->id = $user_data['user_id'];
            $user_info = $this->user->getById();

            Response::success([
                'user' => $user_info,
                'valid' => true
            ]);
        } else {
            Response::success(['valid' => false]);
        }
    }
}
?>