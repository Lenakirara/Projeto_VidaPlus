const agendaLista = document.getElementById('agenda-lista');
const nomePacienteAtualSpan = document.getElementById('nome-paciente-atual');
const iniciarConsultaBtn = document.getElementById('iniciar-consulta-btn');
const prontuarioTexto = document.getElementById('prontuario-texto');
const prescricaoTexto = document.getElementById('prescricao-texto');
const finalizarAtendimentoBtn = document.getElementById('finalizar-atendimento-btn');

let pacienteEmAtendimento = null; 
const PROXIMA_CONSULTA_SPAN = document.getElementById('horario-proxima-consulta');


function getAgendamentos() { 
    return JSON.parse(localStorage.getItem('agendamentos')) || []; 
}

function setAgendamentos(agendamentos) { 
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos)); 
}


function renderizarAgenda() {
    const todosAgendamentos = getAgendamentos();
    agendaLista.innerHTML = '';

    
    const agendaDoDia = todosAgendamentos.filter(a => a.status === 'Agendado');

    if (agendaDoDia.length === 0) {
        agendaLista.innerHTML = '<div class="list-group-item text-muted">Nenhuma consulta agendada.</div>';
        PROXIMA_CONSULTA_SPAN.textContent = '--';
        return;
    }

   
    agendaDoDia.sort((a, b) => a.hora.localeCompare(b.hora));
    PROXIMA_CONSULTA_SPAN.textContent = `${agendaDoDia[0].data} às ${agendaDoDia[0].hora} com ${agendaDoDia[0].profissional}`;
    
    agendaDoDia.forEach(consulta => {
        const item = document.createElement('div');
       
        item.className = `list-group-item d-flex justify-content-between align-items-center list-group-item-info agenda-item`;
        item.dataset.id = consulta.id;

        item.innerHTML = `
            <div>
                <strong>${consulta.hora} - ${consulta.paciente}</strong><br>
                <small class="text-muted">Profissional: ${consulta.profissional} (${consulta.especialidade})</small>
            </div>
            <button class="btn btn-sm btn-info iniciar-agora">Iniciar</button>
        `;
        
       
        item.querySelector('.iniciar-agora').onclick = (e) => {
            e.stopPropagation();
            selecionarPaciente(consulta);
            iniciarVideoChamada();
        };

        
        item.onclick = () => selecionarPaciente(consulta); 

        agendaLista.appendChild(item);
    });
}

function selecionarPaciente(consulta) {
   
    document.querySelectorAll('.agenda-item').forEach(item => {
        item.classList.remove('active', 'list-group-item-primary');
    });
    

    const selectedItem = document.querySelector(`[data-id="${consulta.id}"]`);
    if(selectedItem) {
        selectedItem.classList.add('active', 'list-group-item-primary');
    }
    
  
    pacienteEmAtendimento = consulta;
   
    nomePacienteAtualSpan.textContent = consulta.paciente; 
    
    
    iniciarConsultaBtn.classList.remove('disabled');
    iniciarConsultaBtn.textContent = 'Iniciar Videochamada';

    finalizarAtendimentoBtn.classList.add('disabled'); 
    prontuarioTexto.value = '';
    prescricaoTexto.value = '';
}

function iniciarVideoChamada() {
     if (iniciarConsultaBtn.classList.contains('disabled') || !pacienteEmAtendimento) {
        alert('⚠️ Selecione uma consulta ativa primeiro.');
        return;
    }

    
    const urlExterna = `https://meet.jit.si/VidaPlus-Consulta-${pacienteEmAtendimento.id}`; 
    window.open(urlExterna, '_blank');
    
    alert(`🔊 Iniciando consulta com ${pacienteEmAtendimento.paciente} na sala segura.`);
    
    
    iniciarConsultaBtn.classList.add('disabled');
    finalizarAtendimentoBtn.classList.remove('disabled');
}


iniciarConsultaBtn.onclick = iniciarVideoChamada;


finalizarAtendimentoBtn.onclick = () => {
    if (finalizarAtendimentoBtn.classList.contains('disabled') || !pacienteEmAtendimento) { 
        alert('⚠️ Nenhum atendimento em curso para finalizar.');
        return;
    }
    
    const prontuario = prontuarioTexto.value.trim();
    const prescricao = prescricaoTexto.value.trim();
    
    if (prontuario.length < 10) {
        alert('⚠️ Prontuário (Observações/Diagnóstico) obrigatório (mínimo 10 caracteres).');
        return;
    }

    if (!confirm(`⚠️ Confirmar registro e finalizar a consulta de ${pacienteEmAtendimento.paciente}?`)) {
        return;
    }

    
    const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    const pacienteIndex = pacientes.findIndex(p => p.nome === pacienteEmAtendimento.paciente);

    if (pacienteIndex !== -1) {
        const registro = `[${new Date().toLocaleDateString()}] - Atendimento: ${prontuario}. Prescrição: ${prescricao || 'Nenhuma'}. Dr(a). ${pacienteEmAtendimento.profissional}.`;
        
        
        if (!pacientes[pacienteIndex].historico) {
            pacientes[pacienteIndex].historico = [];
        }
        pacientes[pacienteIndex].historico.push(registro);
        
        localStorage.setItem('pacientes', JSON.stringify(pacientes));
    }
    
    
    const todosAgendamentos = getAgendamentos();
    const index = todosAgendamentos.findIndex(a => a.id === pacienteEmAtendimento.id);
    if (index !== -1) {
        todosAgendamentos[index].status = 'Concluído';
        setAgendamentos(todosAgendamentos);
    }
    
   
    pacienteEmAtendimento = null;
    nomePacienteAtualSpan.textContent = 'Nenhum em atendimento';
    prontuarioTexto.value = '';
    prescricaoTexto.value = '';
    iniciarConsultaBtn.classList.add('disabled');
    finalizarAtendimentoBtn.classList.add('disabled');

    renderizarAgenda();
    alert(`✅ Prontuário e Prescrição registrados para ${pacienteEmAtendimento.paciente}. Consulta finalizada.`);
};


window.onload = () => {
    renderizarAgenda();
};