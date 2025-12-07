# 🏥 Boas vindas ao repositório SGHSS VidaPlus: Sistema de Gestão Hospitalar e de Saúde (Simulado)

Este projeto é um **protótipo Front-end** de conclusão do curso de ADS na UNINTER. Um Sistema de Gestão Hospitalar e de Saúde (SGHSS). Foi desenvolvido com foco na simulação das funcionalidades críticas de **Telemedicina** e **Compliance (LGPD)**, conforme os requisitos do Projeto Multidisciplinar.

O sistema simula o fluxo de trabalho de profissionais de saúde, utilizando o `localStorage` do navegador para persistência de dados.

## 🚀 Tecnologias Utilizadas

| Categoria | Tecnologia | Uso Principal |
| :--- | :--- | :--- |
| **Estrutura** | HTML5 | Definição das telas e formulários. |
| **Estilo** | CSS3 & Bootstrap 5 | Layout responsivo, componentes e interface moderna. |
| **Lógica** | JavaScript (Puro) | Regras de negócio, validações, manipulação de dados e DOM. |
| **Dados** | LocalStorage | Simulação de banco de dados para persistência de Pacientes, Agendamentos e Prontuários. |
| **Simulação** | Jitsi Meet (URL) | Simulação da sala de videochamada na Telemedicina. |

---

## ✨ Funcionalidades e Módulos

O protótipo abrange os seguintes módulos, acessíveis a partir da tela principal (`home.html`):

### 1. 🔑 Autenticação (`index.html`)
* **Login Simulado:** Autenticação inicial com credenciais fixas de Administrador.

    | Campo | Valor |
    | :--- | :--- |
    | **Usuário** | `admin` |
    | **Senha** | `123456` |

### 2. 🧑‍⚕️ Gestão de Pacientes (`pacientes.html`)
* **CRUD Completo:** Cadastro, Leitura, Edição e Exclusão de pacientes.
* **Agendamento:** Funcionalidade para agendar consultas, vinculando Data, Hora, Especialidade e Profissional.
* **Controle de Status:** Visualização de agendamentos ativos e possibilidade de cancelamento (com validação via `prompt`).
* **Início da Teleconsulta:** Botão para iniciar a sala de vídeo (funcionalidade bloqueada se não houver agendamento ativo).

### 3. 🩺 Telemedicina (Atendimento) (`telemedicina.html`)
* **Atendimento Online:** Simulação da abertura da sala de vídeo em nova aba (utilizando um URL padrão do Jitsi Meet).
* **Registro de Prontuário:** Campos para preenchimento de **Observações** e **Prescrição**.
* **Finalização de Consulta:** Registro dos dados no histórico do paciente (persistindo no `localStorage`) e atualização do status da consulta.

### 4. 🛡️ Segurança e Compliance (`seguranca.html`)
* **Logs e Auditoria:** Simulação de visualização de logs de acesso e ações do sistema (para atender ao requisito de auditoria).
* **Relatório LGPD:** Simulação de geração de relatórios de conformidade e privacidade de dados.
* **Controle de Perfis:** Simulação de gestão de níveis de acesso e permissões.

### 5. 🏥 Administração Hospitalar (`administracao.html`)
* **Gestão de Recursos:** Interface para simulação de gerenciamento de Leitos e Controle de Suprimentos (estoque).
* **Relatórios Gerenciais:** Simulação de relatórios de Fluxo e Financeiros (disparando alertas de simulação).

---

## ⚙️ Como Executar o Projeto Localmente

Para visualizar o SGHSS VidaPlus, siga estes passos simples:

1.  **Clone o Repositório:** Baixe todos os arquivos para sua máquina local.
    ```bash
    git clone <coloque a URL do repositório aqui>
    ```
2.  **Inicie com Live Server:**
    * Navegue até o diretório raiz do projeto.
    * No VS Code, clique com o botão direito no arquivo **`index.html`** e selecione **"Open with Live Server"**.

O projeto será carregado no seu navegador em um ambiente local (`http://127.0.0.1:5500/index.html`).
