const seletorUnidade = document.getElementById('seletorUnidade');
let unidadeAtiva = 'Unidade 1';

const leitosLista = document.getElementById('leitos-lista');
const addLeitoBtn = document.getElementById('addLeitoBtn');
const tipoLeitoFiltro = document.getElementById('tipoLeitoFiltro');
const tipoLeitoCadastro = document.getElementById('tipoLeitoCadastro');
const nomeLeitoInput = document.getElementById('nomeLeitoInput');

const suprimentosLista = document.getElementById('suprimentos-lista');
const suprimentoNomeInput = document.getElementById('suprimento-nome');
const suprimentoQtdInput = document.getElementById('suprimento-quantidade');
const addSuprimentoBtn = document.getElementById('addSuprimentoBtn');

const totalPacientesSpan = document.getElementById('totalPacientes');
const totalProfissionaisSpan = document.getElementById('totalProfissionais');
const totalAgendamentosSpan = document.getElementById('totalAgendamentos');
const gerarRelatorioBtn = document.getElementById('gerarRelatorioBtn');
const relatorioFinanceiroBtn = document.getElementById('relatorioFinanceiroBtn');


function getChave(chave) {
    const safeUnidade = unidadeAtiva.replace(/[^a-zA-Z0-9]/g, '_');
    return `${safeUnidade}_${chave}`;
}

function getLeitos() {
    return JSON.parse(localStorage.getItem(getChave('adminLeitos'))) || [];
}

function setLeitos(leitos) {
    localStorage.setItem(getChave('adminLeitos'), JSON.stringify(leitos));
}

function getSuprimentos() {
    return JSON.parse(localStorage.getItem(getChave('adminSuprimentos'))) || [];
}

function setSuprimentos(suprimentos) {
    localStorage.setItem(getChave('adminSuprimentos'), JSON.stringify(suprimentos));
}


function renderizarLeitos() {
    const leitos = getLeitos();
    leitosLista.innerHTML = '';

    const filtro = tipoLeitoFiltro.value;

    let leitosFiltrados = leitos;
    if (filtro !== 'Todos') {
        leitosFiltrados = leitos.filter(l => l.tipo === filtro);
    }

    if (!leitosFiltrados.length) {
        leitosLista.innerHTML = `<p class="text-muted">Nenhum leito (${filtro}) cadastrado ou encontrado.</p>`;
        return;
    }

    const leitosUTI = leitosFiltrados.filter(l => l.tipo === 'UTI');
    const leitosEnfermaria = leitosFiltrados.filter(l => l.tipo === 'Enfermaria');

    const renderizarGrupo = (grupo, titulo) => {
        if (grupo.length > 0) {
            const tituloGrupo = document.createElement('h6');
            tituloGrupo.className = "mt-3 mb-2 text-secondary fw-bold";
            tituloGrupo.textContent = `${titulo} (${grupo.filter(l => !l.ocupado).length} Livres)`;
            leitosLista.appendChild(tituloGrupo);

            grupo.forEach(leito => {
                const item = document.createElement('div');
                const index = leitos.findIndex(l => l.id === leito.id);
                const statusClass = leito.ocupado ? 'list-group-item-danger' : 'list-group-item-success';

                item.className = `list-group-item d-flex justify-content-between align-items-center ${statusClass}`;

                const statusTexto = leito.ocupado
                    ? `Ocupado por: ${leito.pacienteInternado || '?'}`
                    : 'Livre';

                item.innerHTML = `
                    <strong>${leito.nome}</strong>
                    <small>${statusTexto}</small>
                `;

                item.onclick = () => internarPaciente(index);
                leitosLista.appendChild(item);
            });
        }
    };

    if (filtro === 'Todos' || filtro === 'UTI') {
        renderizarGrupo(leitosUTI, 'Unidade de Terapia Intensiva (UTI)');
    }
    if (filtro === 'Todos' || filtro === 'Enfermaria') {
        renderizarGrupo(leitosEnfermaria, 'Enfermaria Geral');
    }
}

function internarPaciente(indexLeito) {
    const leitos = getLeitos();
    let leito = leitos[indexLeito];

    if (leito.ocupado) {
        if (confirm(`O leito ${leito.nome} está OCUPADO por ${leito.pacienteInternado}. Deseja dar ALTA e liberar o leito?`)) {
            leito.ocupado = false;
            leito.pacienteInternado = null;
            setLeitos(leitos);
            renderizarLeitos();
            alert(`✅ Alta registrada. Leito ${leito.nome} liberado.`);
        }
    } else {
        const pacientesAtivos = JSON.parse(localStorage.getItem('pacientes')) || [];

        if (!pacientesAtivos.length) {
            alert('⚠️ Não há pacientes cadastrados para internação.');
            return;
        }

        const listaPacientes = pacientesAtivos
            .map((p, i) => `${i + 1}. ${p.nome} (Nasc: ${p.dataNascimento || '—'})`)
            .join('\n');

        const op = prompt(`Internar paciente no leito ${leito.nome} (${leito.tipo}).\n\nDigite o número do paciente:\n\n${listaPacientes}`);
        const idx = parseInt(op) - 1;

        if (op !== null && pacientesAtivos[idx]) {
            const paciente = pacientesAtivos[idx];

            leito.ocupado = true;
            leito.pacienteInternado = paciente.nome;

            setLeitos(leitos);
            renderizarLeitos();

            alert(`✅ ${paciente.nome} internado no leito ${leito.nome} com sucesso!`);
        } else if (op !== null && op.trim() !== "") {
            alert('❌ Opção de paciente inválida ou cancelada.');
        }
    }
}

tipoLeitoFiltro.onchange = renderizarLeitos;

addLeitoBtn.onclick = () => {
    const tipo = tipoLeitoCadastro.value;
    const nome = nomeLeitoInput.value.trim();

    if (!nome) {
        alert('⚠️ Por favor, digite o nome ou número do leito antes de cadastrar.');
        return;
    }

    const indexSelecionado = seletorUnidade.selectedIndex;
    const nomeHospital = seletorUnidade.options[indexSelecionado].text;

    const nomeCompleto = `${tipo} - ${nome}`;

    const leitos = getLeitos();

    leitos.push({
        nome: nomeCompleto,
        ocupado: false,
        tipo: tipo,
        pacienteInternado: null,
        id: Date.now()
    });

    setLeitos(leitos);
    nomeLeitoInput.value = '';
    renderizarLeitos();

    alert(`✅ Leito ${nomeCompleto} cadastrado com sucesso para o ${nomeHospital}!`);
};


function renderizarSuprimentos() {
    const suprimentos = getSuprimentos();
    suprimentosLista.innerHTML = '';

    if (!suprimentos.length) {
        suprimentosLista.innerHTML = '<li class="list-group-item text-muted">Nenhum suprimento registrado.</li>';
        return;
    }

    suprimentos.forEach((sup, index) => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            ${sup.nome}
            <span class="badge bg-secondary">${sup.quantidade}</span>
            <button class="btn btn-sm btn-danger py-0 px-1 ms-2 remover-sup" data-index="${index}">X</button>
    `;
        suprimentosLista.appendChild(item);
    });

    document.querySelectorAll('.remover-sup').forEach(btn => {
        btn.onclick = (e) => removerSuprimento(e.target.dataset.index);
    });
}

addSuprimentoBtn.onclick = () => {
    const nome = suprimentoNomeInput.value.trim();
    const quantidade = parseInt(suprimentoQtdInput.value, 10);

    if (nome && quantidade > 0) {
        let suprimentos = getSuprimentos();

        const itemExistente = suprimentos.find(s => s.nome.toLowerCase() === nome.toLowerCase());

        if (itemExistente) {
            itemExistente.quantidade += quantidade;
        } else {
            suprimentos.push({ nome: nome, quantidade: quantidade, id: Date.now() });
        }

        setSuprimentos(suprimentos);

        suprimentoNomeInput.value = '';
        suprimentoQtdInput.value = '';
        renderizarSuprimentos();

        const indexSelecionado = seletorUnidade.selectedIndex;
        const nomeHospital = seletorUnidade.options[indexSelecionado].text;

        alert(`✅ ${quantidade} unidades de ${nome} adicionadas ao estoque do ${nomeHospital}.`);
    } else {
        alert('⚠️ Preencha o nome e uma quantidade válida (> 0).');
    }
};

function removerSuprimento(index) {
    if (confirm('Tem certeza que deseja remover este suprimento?')) {
        let suprimentos = getSuprimentos();
        suprimentos.splice(index, 1);
        setSuprimentos(suprimentos);
        renderizarSuprimentos();
    }
}

function carregarTotais() {
    const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];

    fetch('./data/profissionais.json')
        .then(res => res.json())
        .then(profissionais => {
            totalProfissionaisSpan.textContent = profissionais.length;
        })
        .catch(() => {
            totalProfissionaisSpan.textContent = '0';
        });

    totalPacientesSpan.textContent = pacientes.length;
    totalAgendamentosSpan.textContent = agendamentos.length;
}

gerarRelatorioBtn.onclick = () => {
    const leitos = getLeitos();
    const livres = leitos.filter(l => !l.ocupado).length;
    const ocupados = leitos.filter(l => l.ocupado).length;
    const total = leitos.length;

    const indexSelecionado = seletorUnidade.selectedIndex;
    const nomeHospital = seletorUnidade.options[indexSelecionado].text;

    alert(`
     --- Relatório de Fluxo e Ocupação: ${nomeHospital} ---
    Total de Leitos: ${total}
    Leitos Ocupados: ${ocupados}
    Leitos Livres: ${livres}
        
    Taxa de Ocupação: ${total > 0 ? ((ocupados / total) * 100).toFixed(2) : 0}%
 
    Total de Pacientes no Sistema: ${totalPacientesSpan.textContent}
     Total de Agendamentos: ${totalAgendamentosSpan.textContent}
    `);
};

relatorioFinanceiroBtn.onclick = () => {
    const receita = (Math.random() * 50000 + 100000).toFixed(2);
    const despesa = (Math.random() * 20000 + 50000).toFixed(2);
    const lucro = (receita - despesa).toFixed(2);

    const indexSelecionado = seletorUnidade.selectedIndex;
    const nomeHospital = seletorUnidade.options[indexSelecionado].text;

    alert(`
    --- Simulação de Relatório Financeiro (Mês) para ${nomeHospital} ---
    💰 Receita Total: R$ ${receita.replace('.', ',')}
    💸 Despesa Operacional: R$ ${despesa.replace('.', ',')}
    -------------------------------------------
    ✅ Lucro Estimado: R$ ${lucro.replace('.', ',')}
    `);
};


function gerenciarPerfis() {
    alert('✅ Navegando para: Tela de Gerenciamento de Perfis de Usuário.\n\n(Ações: Adicionar/Remover perfis, ajustar permissões de acesso e logs de auditoria).');
}

function gerarRelatorioLGPD() {
    alert('⏳ Gerando Relatório de Logs e Auditoria (LGPD). O processo pode levar alguns segundos...');

    setTimeout(() => {
        alert('📊 Relatório de Logs de Acesso gerado com sucesso!\n\n(Este relatório é crucial para a Conformidade com a LGPD e Auditoria de Acesso a Dados Sensíveis).');
    }, 1500);
}


function recarregarDadosDaUnidade() {
    renderizarLeitos();
    renderizarSuprimentos();
    carregarTotais();
}

function inicializarAdministracao() {
    if (seletorUnidade) {
        unidadeAtiva = seletorUnidade.value;

        seletorUnidade.onchange = () => {
            const novoValorUnidade = seletorUnidade.value;
            unidadeAtiva = novoValorUnidade;

            const indexSelecionado = seletorUnidade.selectedIndex;
            const nomeHospital = seletorUnidade.options[indexSelecionado].text;

            recarregarDadosDaUnidade();

            alert(`✅ Unidade alterada para: ${nomeHospital}. Os dados foram recarregados.`);
        };
    }

    recarregarDadosDaUnidade();
}


window.onload = inicializarAdministracao;