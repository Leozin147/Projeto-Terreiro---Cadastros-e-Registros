const webhookBuscarUrl = 'https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/06c94d77-4683-407c-a706-9b0f6264dd87';    
const webhookFeitoUrl  = 'https://SEU-SERVIDOR.com/webhookFeito';     

document.addEventListener('DOMContentLoaded', () => {
  const btnBuscar = document.getElementById('buscar-trabalhos');
  const btnAtualizar = document.getElementById('atualizar-tabela');
  const btnResetFiltros = document.getElementById('resetar-filtros');
  const statusBuscarMsg = document.getElementById('status-message');
  const statusAtualizarMsg = document.getElementById('status-atualizar-message');
  const container = document.getElementById('tabela-presenca-container');
  const filtroSelect = document.getElementById('filtro-consulente');
  const pegarFeitos = document.getElementById('pegar-feitos');

  let currentData = [];   
  let currentKeys = [];   

  function beautifyHeader(key) {
    return key
      .split('_')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  }

  function gerarTabela() {
    container.innerHTML = ''; 

    if (!Array.isArray(currentData) || currentData.length === 0) {
      container.innerHTML = '<p>Nenhum dado encontrado.</p>';
      filtroSelect.style.display = 'none';
      btnResetFiltros.style.display = 'none';
      btnAtualizar.style.display = 'none';
      return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Cabeçalhos
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

    currentData.forEach((item) => {
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

      const feitoStatus = document.createElement('div');
      feitoStatus.className = 'feito-status-message';
      feitoStatus.style.fontSize = '12px';
      feitoStatus.style.marginTop = '4px';
      feitoStatus.style.textAlign = 'center';

      checkbox.addEventListener('change', () => {
        feitoStatus.textContent = '';
        feitoStatus.className = 'feito-status-message';

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
            .then(resp => resp.json())
            .then(data => {
              if (data.status === 'feito') {
                statusAtualizarMsg.textContent = 'Status atualizado com sucesso';
                statusAtualizarMsg.className = 'status-success';
                setTimeout(() => {
                  statusAtualizarMsg.textContent = '';
                  statusAtualizarMsg.className = '';
                }, 5000);
              } else {
                statusAtualizarMsg.textContent = 'Erro ao atualizar status';
                statusAtualizarMsg.className = 'status-error';
                checkbox.checked = false;
                setTimeout(() => {
                  statusAtualizarMsg.textContent = '';
                  statusAtualizarMsg.className = '';
                }, 5000);
              }
            })
            .catch(() => {
              statusAtualizarMsg.textContent = 'Erro ao atualizar status';
              statusAtualizarMsg.className = 'status-error';
              checkbox.checked = false;
              setTimeout(() => {
                statusAtualizarMsg.textContent = '';
                statusAtualizarMsg.className = '';
              }, 5000);
            });
        }
      });

      tdCheck.appendChild(checkbox);
      tdCheck.appendChild(feitoStatus);
      tr.appendChild(tdCheck);
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);

    // Mostrar controles
    filtroSelect.style.display = 'inline-block';
    btnAtualizar.style.display = 'inline-block';
    btnResetFiltros.style.display = 'inline-block';

    populaFiltro();
  }

  function populaFiltro() {
    // Obter nomes únicos e ordenar
    const nomesUnicos = Array.from(new Set(currentData.map(item => item.consulente))).sort();

    filtroSelect.innerHTML = '<option value="">Todos</option>';
    nomesUnicos.forEach(nome => {
      const opt = document.createElement('option');
      opt.value = nome;
      opt.textContent = nome;
      filtroSelect.appendChild(opt);
      
    });
  }

  // Filtrar linhas da tabela pelo filtro selecionado
  filtroSelect.addEventListener('change', () => {
    const valorSelecionado = filtroSelect.value;
    const tbody = container.querySelector('tbody');
    if (!tbody) return;

    Array.from(tbody.rows).forEach((tr, idx) => {
      if (
        valorSelecionado === '' ||
        currentData[idx].consulente === valorSelecionado
      ) {
        tr.style.display = '';
      } else {
        tr.style.display = 'none';
      }
    });
  });

  // Resetar filtros — limpar filtro e mostrar todas as linhas
  btnResetFiltros.addEventListener('click', () => {
    filtroSelect.value = '';
    const tbody = container.querySelector('tbody');
    if (!tbody) return;

    Array.from(tbody.rows).forEach(tr => {
      tr.style.display = '';
    });
  });

  function fetchData() {
    statusBuscarMsg.textContent = 'Buscando dados...';
    statusBuscarMsg.className = ''; 

    const payload = { status: 'Chegou' };

    if (pegarFeitos && pegarFeitos.checked) {
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

      statusBuscarMsg.textContent = 'Dados carregados com sucesso!';
      statusBuscarMsg.className = 'status-success';
      

      setTimeout(() => {
        statusBuscarMsg.textContent = '';
        statusBuscarMsg.className = '';
      }, 5000);
    })
    .catch(err => {
      statusBuscarMsg.textContent = 'Erro ao obter dados: ' + err.message;
      statusBuscarMsg.className = 'status-error';

      setTimeout(() => {
        statusBuscarMsg.textContent = '';
        statusBuscarMsg.className = '';
      }, 5000);

      console.error('Erro ao obter dados da API:', err);
    });
  }

  btnBuscar.addEventListener('click', () => {
    fetchData();
  });

  btnAtualizar.addEventListener('click', () => {
    if (currentData.length === 0) {
      statusAtualizarMsg.textContent = 'Nenhum dado para atualizar. Por favor, busque os trabalhos primeiro.';
      statusAtualizarMsg.className = 'status-error';

      setTimeout(() => {
        statusAtualizarMsg.textContent = '';
        statusAtualizarMsg.className = '';
      }, 5000);

      return;
    }

    try {
      gerarTabela();

      statusAtualizarMsg.textContent = 'Tabela atualizada com sucesso!';
      statusAtualizarMsg.className = 'status-success';

      setTimeout(() => {
        statusAtualizarMsg.textContent = '';
        statusAtualizarMsg.className = '';
      }, 5000);
    } catch (err) {
      statusAtualizarMsg.textContent = 'Erro ao atualizar tabela: ' + err.message;
      statusAtualizarMsg.className = 'status-error';

      setTimeout(() => {
        statusAtualizarMsg.textContent = '';
        statusAtualizarMsg.className = '';
      }, 5000);
    }
  });
});
