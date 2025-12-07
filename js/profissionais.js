const lista = document.getElementById('listaProfissionais');
let profissionais = [];

function salvarPacientes(pacientesAtivos) {
    localStorage.setItem('pacientes', JSON.stringify(pacientesAtivos));
}

function calcularIdade(dataNascimento) {
    if (!dataNascimento) return '—';
    const hoje = new Date();
    const nasc = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
}


// prontuario
function visualizarProntuario(pacienteNome) {
    const pacientesAtivos = JSON.parse(localStorage.getItem('pacientes')) || [];
    const paciente = pacientesAtivos.find(p => p.nome === pacienteNome);

    if (!paciente) {
        alert(`❌ Erro: Paciente "${pacienteNome}" não encontrado.`);
        return;
    }

    let texto = `📋 Prontuário de ${paciente.nome}:\n\n`;

    texto += '--- DADOS GERAIS ---\n';
    texto += `Data Nasc.: ${paciente.dataNascimento || '—'}\n`;
    texto += `Idade: ${calcularIdade(paciente.dataNascimento) || '—'} anos\n`;
    texto += `Sexo: ${paciente.sexo || '—'}\n`;
    texto += `Contato: ${paciente.contato || '—'}\n`;
    texto += `Endereço: ${paciente.endereco || '—'}\n\n`;

    texto += '--- HISTÓRICO DE ATENDIMENTOS ---\n';
    if (paciente.historico && paciente.historico.length) {
        paciente.historico.forEach((h, i) => texto += `${i + 1}. ${h}\n`);
    } else {
        texto += 'Nenhum registro de atendimento.';
    }
    
    alert(texto);
}

function atualizarHistorico(pacienteNome) {
    const pacientesAtivos = JSON.parse(localStorage.getItem('pacientes')) || [];
    const paciente = pacientesAtivos.find(p => p.nome === pacienteNome);
    
    if (!paciente) return;
    
    const novoRegistro = prompt(`📝 Adicionar novo registro ao Histórico de ${pacienteNome}:`);

    if (novoRegistro && novoRegistro.trim() !== '') {
        const dataHora = new Date().toLocaleString('pt-BR');
        const registroCompleto = `${dataHora} - ${novoRegistro.trim()}`;

        paciente.historico = paciente.historico || [];
        paciente.historico.push(registroCompleto);

        const indexPaciente = pacientesAtivos.findIndex(p => p.nome === pacienteNome);
        if (indexPaciente !== -1) {
            pacientesAtivos[indexPaciente] = paciente;
            salvarPacientes(pacientesAtivos);
            alert('✅ Histórico Clínico atualizado com sucesso!');
        }
    }
}

function emitirReceitaDigital(pacienteNome) {
    const pacientesAtivos = JSON.parse(localStorage.getItem('pacientes')) || [];
    const paciente = pacientesAtivos.find(p => p.nome === pacienteNome);

    if (!paciente) {
        alert(`❌ Erro: Paciente "${pacienteNome}" não encontrado.`);
        return;
    }

    const medicamento = prompt(`💊 Emitir Receita para ${paciente.nome}.\n\nMedicamento:`);
    
    if (!medicamento) return;

    const posologia = prompt(`Dose e Duração para ${medicamento}:`);

    if (medicamento && posologia) {
        const dataHora = new Date().toLocaleString('pt-BR');
        
        const receita = `[RECEITA DIGITAL] - ${dataHora}\nMedicamento: ${medicamento}\nPosologia: ${posologia}`;
        
        paciente.historico = paciente.historico || [];
        paciente.historico.push(receita);

        const indexPaciente = pacientesAtivos.findIndex(p => p.nome === pacienteNome);
        if (indexPaciente !== -1) {
            pacientesAtivos[indexPaciente] = paciente;
            salvarPacientes(pacientesAtivos);
            
            alert(`✅ Receita Digital emitida e salva no prontuário de ${paciente.nome}:\n\n${receita}`);
        }
    } else {
        alert('⚠️ Emissão de receita cancelada ou incompleta.');
    }
}


function renderizarProfissionais() {
    lista.innerHTML = '';

    profissionais.forEach((prof) => {
        const li = document.createElement('li');
        li.className = 'list-group-item mb-3 shadow-sm border d-flex justify-content-between align-items-start';

        
        const fotoSrc = prof.fotoURL || 'caminho/para/avatar_padrao.png'; 
        
        li.innerHTML = `
            <div class="info-profissional">
                <strong>${prof.nome}</strong><br>
                Especialidade: ${prof.especialidade}<br>
                Registro: ${prof.registro}<br>
                Contato: ${prof.contato}

                <div class="mt-3">
                    <button class="btn btn-outline-primary agenda">Ver Agenda</button>
                </div>
            </div>
            
            <img src="${fotoSrc}" 
                 alt="Foto de ${prof.nome}"
                 class="rounded-circle ms-3"
                 style="width: 60px; height: 60px; object-fit: cover; flex-shrink: 0;">
            `;

        lista.appendChild(li);
    });
    ativarAgenda();
}

function ativarAgenda() {
    const botoes = document.querySelectorAll('.agenda');

    botoes.forEach((btn, index) => {
        btn.onclick = () => {
            const profissional = profissionais[index];

            const agendamentosGerais = JSON.parse(localStorage.getItem('agendamentos')) || [];
            
            const pacientesAtivos = JSON.parse(localStorage.getItem('pacientes')) || [];
            const nomesPacientesAtivos = pacientesAtivos.map(p => p.nome);

            const consultas = agendamentosGerais.filter(a =>
                a.profissional === profissional.nome &&
                a.status === 'Agendado' &&
                nomesPacientesAtivos.includes(a.paciente) 
            );

            if (!consultas.length) {
                alert(`⚠️ Nenhum paciente agendado ou ativo para este profissional.`);
                return;
            }

            let listaConsultas = `🗓️ Agenda de ${profissional.nome} (${profissional.especialidade}):\n\n`;
            consultas.forEach((c, i) => {
                listaConsultas += `${i + 1}. ${c.data} às ${c.hora} | Paciente: ${c.paciente}\n`;
            });
            listaConsultas += '\nDigite o número do paciente para realizar uma ação:';

            const op = prompt(listaConsultas);
            const idx = parseInt(op) - 1;

            if (op !== null && consultas[idx]) {
                const pacienteSelecionado = consultas[idx].paciente;

                const acao = prompt(`Paciente: ${pacienteSelecionado}\n\nO que deseja fazer?\n1. Ver Prontuário\n2. Adicionar Registro ao Histórico\n3. Emitir Receita Digital`);

                switch (acao) {
                    case '1':
                        visualizarProntuario(pacienteSelecionado);
                        break;
                    case '2':
                        atualizarHistorico(pacienteSelecionado);
                        break;
                    case '3':
                        emitirReceitaDigital(pacienteSelecionado);
                        break;
                    default:
                        alert('⚠️ Ação cancelada ou inválida.');
                }

            } else if (op !== null && op.trim() !== "") {
                alert('❌ Opção inválida.');
            }
        };
    });
}


function inicializarProfissionais() {
    fetch('./data/profissionais.json')
        .then(res => res.json())
        .then(dados => {
            profissionais = dados;
            renderizarProfissionais();
        })
        .catch(error => {
            console.error('Erro ao carregar profissionais:', error);
            alert('❌ Erro ao carregar a lista de profissionais.');
        });
}


window.onload = inicializarProfissionais;