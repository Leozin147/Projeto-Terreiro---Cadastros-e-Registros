const webhookBuscarUrl = 'https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/06c94d77-4683-407c-a706-9b0f6264dd87';    
const webhookFeitoUrl  = 'https://SEU-SERVIDOR.com/webhookFeito';     


let currentData = [];   
let currentKeys = [];   
                      


function beautifyHeader(key) {
  return key
    .split('_')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
}

function gerarTabela() {
  const container = document.getElementById('tabela-presenca-container');
  container.innerHTML = ''; 

  if (!Array.isArray(currentData) || currentData.length === 0) {
    container.innerHTML = '<p>Nenhum dado encontrado.</p>';
    return;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  currentKeys.forEach(key => {
    const th = document.createElement('th');
    th.textContent = beautifyHeader(key);
    headerRow.appendChild(th);
  });

  const thFeito = document.createElement('th');
  thFeito.textContent = 'Feito';
  headerRow.appendChild(thFeito);

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  currentData.forEach((item, index) => {
    const tr = document.createElement('tr');

    currentKeys.forEach(key => {
      const td = document.createElement('td');
      td.textContent = item[key];
      tr.appendChild(td);
    });

    const tdCheck = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('feito-checkbox');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        const payloadFeito = {
          consulente: item.consulente,
          data: item.data
        };

        fetch(webhookFeitoUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadFeito)
        })
          .then(resp => {
            if (!resp.ok) {
              console.error('Erro ao enviar “feito” para o webhook:', resp.statusText);
            }

          })
          .catch(err => console.error('Erro de rede ao enviar “feito”:', err));
      }
    });

    tdCheck.appendChild(checkbox);
    tr.appendChild(tdCheck);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

function populaFiltro() {
  const filtroSelect = document.getElementById('filtro-consulente');
  const nomesUnicos = Array.from(new Set(currentData.map(item => item.consulente)));

  filtroSelect.innerHTML = '<option value="">Todos</option>';

  nomesUnicos.forEach(nome => {
    const opt = document.createElement('option');
    opt.value = nome;
    opt.textContent = nome;
    filtroSelect.appendChild(opt);
  });

  filtroSelect.addEventListener('change', () => {
    const valorSelecionado = filtroSelect.value; 
    const tbody = document.querySelector('#tabela-presenca-container tbody');
    if (!tbody) return;

    Array.from(tbody.rows).forEach((tr, idxRow) => {
      if (
        valorSelecionado === '' ||
        currentData[idxRow].consulente === valorSelecionado
      ) {
        tr.style.display = ''; 
      } else {
        tr.style.display = 'none'; 
      }
    });
  });
}

function fetchData() {
  const pegarFeitos = document.getElementById('pegar-feitos').checked;
  const payload = { status: 'Chegou' };

  if (pegarFeitos) {
    payload.pegarFeitos = true;
  }

  fetch(webhookBuscarUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Resposta não OK: ' + response.statusText);
      }
      return response.json();
    })
    .then(jsonData => {

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        currentData = [];
        currentKeys = [];
      } else {
        currentData = jsonData;
        currentKeys = Object.keys(jsonData[0]);
      }

      gerarTabela();

      document.getElementById('atualizar-tabela').style.display = 'inline-block';

      const filtro = document.getElementById('filtro-consulente');
      filtro.style.display = 'inline-block';
      populaFiltro();
    })
    .catch(err => {
      console.error('Erro ao obter dados da API:', err);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const btnBuscar = document.getElementById('buscar-trabalhos');
  const btnAtualizar = document.getElementById('atualizar-tabela');

  btnBuscar.addEventListener('click', () => {
    fetchData();
  });

  btnAtualizar.addEventListener('click', () => {
    fetchData();
  });
});
