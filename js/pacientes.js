const form = document.getElementById('formPaciente');
const lista = document.getElementById('listaPacientes');
const nome = document.getElementById('nome');
const dataNascimento = document.getElementById('dataNascimento');
const sexo = document.getElementById('sexo');
const contato = document.getElementById('contato');
const endereco = document.getElementById('endereco');
const dadosClinicos = document.getElementById('dadosClinicos');

let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
let profissionais = [];

let pacienteEmEdicao = null;


function salvarAgendamentos() {
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
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

function salvarLocalStorage() {
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
}


function iniciarTeleconsultaPaciente(pac) {
    const consultaAtiva = pac.consultas.find(a => a.status === 'Agendado');

    if (!consultaAtiva) {
        alert('⚠️ Não há consulta agendada e ativa para iniciar a Teleconsulta. Agende uma consulta primeiro.');
        return;
    }

    const urlTelemedicina = `https://meet.jit.si/VidaPlus-Consulta-${pac.nome.replace(/\s/g, '')}`;
    
    window.open(urlTelemedicina, '_blank');
    
    alert(`📞 Teleconsulta iniciada com sucesso! Você foi redirecionado(a) para a sala de consulta segura. Sala: ${urlTelemedicina}`);
}


function renderizarLista() {
    lista.innerHTML = '';
    
    pacientes.forEach((pac, index) => { 
        pac.consultas = pac.consultas || [];
        pac.historico = pac.historico || [];
        pac.notificacoes = pac.notificacoes || [];

        const li = document.createElement('li'); 
        li.className = 'list-group-item'; 

        li.innerHTML = `
            <strong>${pac.nome}</strong><br>
            Idade: ${calcularIdade(pac.dataNascimento)} anos<br>
            Sexo: ${pac.sexo || '—'}<br>
            Contato: ${pac.contato || '—'}<br>
            Endereço: ${pac.endereco || '—'}
            <div class="mt-2 d-flex flex-wrap gap-2">
                <button class="btn btn-warning btn-sm editar">Editar</button>
                <button class="btn btn-danger btn-sm deletar">Deletar</button>
                <button class="btn btn-secondary btn-sm historico">Histórico Clínico</button>
                <button class="btn btn-info btn-sm agendar-consulta">Agendar Consulta</button>
                <button class="btn btn-outline-dark btn-sm ver-consultas">Ver Consultas</button>
                <button class="btn btn-dark btn-sm cancelar">Cancelar</button>
                <button class="btn btn-success btn-sm notificacao">Notificação</button>
                <button class="btn btn-secondary btn-sm teleconsulta">Teleconsulta</button>
            </div>

            <div class="mt-3 area-agendamento"></div>
        `;

        const area = li.querySelector('.area-agendamento');

        li.querySelector('.editar').onclick = () => {
            nome.value = pac.nome;
            dataNascimento.value = pac.dataNascimento;
            sexo.value = pac.sexo;
            contato.value = pac.contato;
            endereco.value = pac.endereco;
            dadosClinicos.value = pac.dadosClinicos; 

            pacienteEmEdicao = pac;
            
            form.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
            alert('⚠️ Altere os campos e clique em Salvar Alterações.');
        };

        li.querySelector('.deletar').onclick = () => {
            if (confirm(`❌ Tem certeza que deseja remover ${pac.nome} e todos os seus agendamentos?`)) {
                pacientes.splice(index, 1);
                
                agendamentos = agendamentos.filter(a => a.paciente !== pac.nome);
                salvarAgendamentos();
                
                salvarLocalStorage();
                renderizarLista();
            }
        };

        li.querySelector('.historico').onclick = () => {
            let texto = `Histórico clínico de ${pac.nome}:\n\n`;
            if (pac.dadosClinicos && pac.dadosClinicos.trim() !== '') {
                texto += `=== DADOS CLÍNICOS ===\n${pac.dadosClinicos}\n\n`;
            } else {
                texto += `=== DADOS CLÍNICOS ===\nNenhum dado clínico registrado.\n\n`;
            }
            
            texto += `=== HISTÓRICO DE ATENDIMENTOS ===\n`;
            if (pac.historico.length) {
                pac.historico.forEach((h, i) => texto += `${i + 1}. ${h}\n`);
            } else {
                texto += 'Sem registros de atendimentos.';
            }
            alert(`📝 ${texto}`);
        };

        li.querySelector('.agendar-consulta').onclick = () => montarFormularioAgendamento(pac, area, 'consulta');

        li.querySelector('.ver-consultas').onclick = () => mostrarLista(pac.consultas, 'Consultas');

        li.querySelector('.cancelar').onclick = () => cancelarAgendamento(pac);

        li.querySelector('.notificacao').onclick = () => {
            const msg = prompt('💬 Mensagem da notificação:');
            if (msg) {
                pac.notificacoes.push(msg);
                salvarLocalStorage();
                alert(`🔔 Notificação enviada para ${pac.nome}!`);
            }
        };

        li.querySelector('.teleconsulta').onclick = () => {
            iniciarTeleconsultaPaciente(pac);
        };

        lista.appendChild(li);
    });
}

function montarFormularioAgendamento(pac, container, tipo) {
    container.innerHTML = '';

    const especialidades = [...new Set(profissionais.map(p => p.especialidade))];

    const optionsEspecialidades = especialidades.length
        ? especialidades.map(e => `<option value="${e}">${e}</option>`).join('')
        : '<option disabled>Carregando especialidades...</option>';

    container.innerHTML = `
        <div class="border rounded p-3 mt-2">
            <strong>Agendar ${tipo}</strong>
            <input type="date" class="form-control mb-2 data">
            <input type="time" class="form-control mb-2 hora">

            <select class="form-select mb-2 especialidade">
                <option value="">Selecione a especialidade</option>
                ${optionsEspecialidades}
            </select>

            <select class="form-select mb-2 profissional">
                <option value="">Selecione o profissional</option>
            </select>

            <button class="btn btn-success btn-sm confirmar">Confirmar</button>
        </div>
    `;

    const selectEspecialidade = container.querySelector('.especialidade');
    const selectProfissional = container.querySelector('.profissional');

    
    selectEspecialidade.onchange = () => {
        const esp = selectEspecialidade.value;
        selectProfissional.innerHTML = '<option value="">Selecione o profissional</option>';

        profissionais
            .filter(p => p.especialidade === esp)
            .forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.nome;
                opt.textContent = p.nome;
                selectProfissional.appendChild(opt);
            });
    };

    container.querySelector('.confirmar').onclick = () => {
        const data = container.querySelector('.data').value;
        const hora = container.querySelector('.hora').value;
        const especialidade = selectEspecialidade.value;
        const profissional = selectProfissional.value;

        if (!data || !hora || !especialidade || !profissional) {
            alert('⚠️ Preencha todos os campos para agendar a consulta.');
            return;
        }

        const registro = {
            id: Date.now(),
            data,
            hora,
            especialidade,
            profissional,
            paciente: pac.nome,
            status: 'Agendado'
        };

        pac.consultas.push(registro);
        agendamentos.push(registro);

        salvarLocalStorage();
        salvarAgendamentos();
        renderizarLista();
        
        alert(`✅ Consulta agendada com sucesso para ${pac.nome} com ${profissional}!`);
    };
}


function mostrarLista(lista, titulo) {
    if (!lista.length) return alert(`⚠️ Sem ${titulo} no momento.`);

    const texto = lista
        .map(a => `${a.data} ${a.hora} - ${a.profissional} (${a.especialidade}) [${a.status}]`)
        .join('\n');

    alert(`📋 ${titulo}:\n\n${texto}`);
}

function cancelarAgendamento(pac) {
    const ativos = [...pac.consultas].filter(a => a.status === 'Agendado'); 
    if (!ativos.length) return alert('⚠️ Sem agendamentos ativos para cancelar.');

    const texto = ativos
        .map((a, i) => `${i + 1}. ${a.data} ${a.hora} - ${a.profissional}`)
        .join('\n');

    const op = prompt(`Escolha o número da consulta para cancelar:\n${texto}`);
    const idx = parseInt(op) - 1;

    if (ativos[idx]) {
        ativos[idx].status = 'Cancelado';
        
        const idParaCancelar = ativos[idx].id;
        const agendamentoGeral = agendamentos.find(a => a.id === idParaCancelar);
        if (agendamentoGeral) {
            agendamentoGeral.status = 'Cancelado';
            salvarAgendamentos();
        }

        salvarLocalStorage();
        renderizarLista();
        alert(`🛑 Agendamento cancelado com sucesso.`);
    } else if (op !== null && op.trim() !== "") {
        alert('❌ Opção de cancelamento inválida.');
    }
}

form.addEventListener('submit', e => {
    e.preventDefault();

    const novoNome = nome.value.trim();
    
    if (pacienteEmEdicao) {
        if (pacienteEmEdicao.nome !== novoNome) {
             agendamentos.forEach(a => {
                if(a.paciente === pacienteEmEdicao.nome) {
                    a.paciente = novoNome;
                }
            });
             salvarAgendamentos();
        }

        pacienteEmEdicao.nome = novoNome;
        pacienteEmEdicao.dataNascimento = dataNascimento.value;
        pacienteEmEdicao.sexo = sexo.value;
        pacienteEmEdicao.contato = contato.value.trim();
        pacienteEmEdicao.endereco = endereco.value.trim();
        pacienteEmEdicao.dadosClinicos = dadosClinicos.value.trim();

        
        pacienteEmEdicao = null;
        form.querySelector('button[type="submit"]').textContent = 'Cadastrar Paciente';
        alert(`✅ Paciente ${novoNome} atualizado com sucesso!`);
        
    } else {
        pacientes.push({
            nome: novoNome,
            dataNascimento: dataNascimento.value,
            sexo: sexo.value,
            contato: contato.value.trim(),
            endereco: endereco.value.trim(),
            dadosClinicos: dadosClinicos.value.trim(), 
            historico: [],
            consultas: [],
            notificacoes: []
        });
        alert(`✅ Paciente ${novoNome} cadastrado com sucesso!`);
    }

    salvarLocalStorage();
    renderizarLista();
    form.reset();
});



function fetchProfissionais() {
    fetch('./data/profissionais.json')
        .then(resp => resp.json())
        .then(dados => {
            profissionais = dados;
            document.querySelectorAll('.area-agendamento').forEach(container => {
                if (container.innerHTML.includes('Carregando especialidades')) {
                    const li = container.closest('li');
                    const pacIndex = Array.from(lista.children).indexOf(li);
                    if(pacientes[pacIndex]) {
                       montarFormularioAgendamento(pacientes[pacIndex], container, 'consulta');
                    }
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar profissionais:', error);
        });
}

function inicializar() {
    renderizarLista(); 
    fetchProfissionais();
}


window.onload = inicializar;