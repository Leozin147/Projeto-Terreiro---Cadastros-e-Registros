const webhookBuscarUrl = 'https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/relatorio_presenca';    
const webhookFeitoUrl  = 'https://n8n-n8n-start.3gbv4l.easypanel.host/webhook/atualizar_status_chegou_feito';     

document.addEventListener('DOMContentLoaded', () => {
  const btnBuscar = document.getElementById('buscar-trabalhos');
  const btnAtualizar = document.getElementById('atualizar-tabela');
  const btnResetFiltros = document.getElementById('resetar-filtros');
  const statusBuscarMsg = document.getElementById('status-message'); 
  const statusAtualizarMsg = document.getElementById('status-atualizar-message'); 
  const container = document.getElementById('tabela-presenca-container');
  const filtroSelect = document.getElementById('filtro-consulente-presença');
  const filtrosContainer = document.getElementById('relatorio-presenca-filtros');
  
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
      statusBuscarMsg.textContent = 'Nenhum trabalho presente.';
      statusBuscarMsg.className = 'status-error'; 
      
      filtroSelect.style.display = 'none'; 
      filtrosContainer.style.display = 'none';
      btnResetFiltros.style.display = 'none'; 
      btnAtualizar.style.display = 'none'; 
      return;
    }
    

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    

    const filterkeys = currentKeys.filter (filterkeys => filterkeys !== "id_atendimento");
    
   

    filterkeys.forEach(filterkeys => {
      const th = document.createElement('th');
      th.textContent = beautifyHeader(filterkeys);
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

      filterkeys.forEach(filterkeys => {
        const td = document.createElement('td');
        td.textContent = item[filterkeys];
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
            id_atendimento: item.id_atendimento,
            status: "feito"
          };

          fetch(webhookFeitoUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadFeito)
          })
          .then(resp => resp.json())
          .then(data => {
            if (data[0] && data[0].status === 'Atualizado') {
              statusAtualizarMsg.textContent = 'Status atualizado com sucesso';
              statusAtualizarMsg.className = 'status-success';
            } else {
              statusAtualizarMsg.textContent = 'Erro ao atualizar status';
              statusAtualizarMsg.className = 'status-error';
              checkbox.checked = false;
            }
            setTimeout(() => {
              statusAtualizarMsg.textContent = '';
              statusAtualizarMsg.className = '';
              checkbox.checked = false;
            }, 5000);
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

    filtrosContainer.style.display = 'flex'; 
    filtroSelect.style.display = 'inline-block'; 
    btnAtualizar.style.display = 'inline-block';

    populaFiltro(); 
  }

  function populaFiltro() {
    if (currentData.length > 0) {
      const nomesUnicos = Array.from(new Set(currentData.map(item => item.consulente))).sort();

      filtroSelect.innerHTML = '<option value="">Todos os consulentes</option>';
      nomesUnicos.forEach(nome => {
        const opt = document.createElement('option');
        opt.value = nome;
        opt.textContent = nome;
        filtroSelect.appendChild(opt);
      });
    }
  }

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

    if (valorSelecionado) {
      btnResetFiltros.style.display = 'inline-block';
    } else {
      btnResetFiltros.style.display = 'none';
    }
  });

  btnResetFiltros.addEventListener('click', () => {
    filtroSelect.value = '';
    const tbody = container.querySelector('tbody');
    if (!tbody) return;

    Array.from(tbody.rows).forEach(tr => {
      tr.style.display = '';
    });
    btnResetFiltros.style.display = 'none';
  });

  function fetchData(status) {
    if (status === 'buscar') {
      statusBuscarMsg.textContent = 'Buscando dados...';
      statusBuscarMsg.className = ''; 
    } else {
      statusAtualizarMsg.textContent = 'Atualizando tabela...';
      statusAtualizarMsg.className = ''; 
    }

    const payload = { status: 'Chegou' };

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
      if (!jsonData || jsonData.length === 0 || jsonData.every(item => !item.consulente || !item.data || item.consulente === null || item.data === null || item.consulente === "" || item.data === "")) {
        currentData = [];
        currentKeys = [];
        if (status === 'buscar') {
          statusBuscarMsg.textContent = 'Nenhum trabalho presente.';
          statusBuscarMsg.className = 'status-error'; 
        } else {
          statusAtualizarMsg.textContent = 'Nenhum trabalho presente.';
          statusAtualizarMsg.className = 'status-error'; 
        }
      } else {
        currentData = jsonData;
        currentKeys = Object.keys(jsonData[0]);
      }

      gerarTabela(); 

      if (status === 'buscar') {
        if (currentData.length > 0) {
          statusBuscarMsg.textContent = 'Dados carregados com sucesso!';
          statusBuscarMsg.className = 'status-success';
        }
      } else {
        statusAtualizarMsg.textContent = 'Tabela Atualizada';
        statusAtualizarMsg.className = 'status-success';
      }

      setTimeout(() => {
        if (status === 'buscar') {
          statusBuscarMsg.textContent = '';
          statusBuscarMsg.className = '';
        } else {
          statusAtualizarMsg.textContent = '';
          statusAtualizarMsg.className = '';
        }
      }, 5000);
    })
    .catch(err => {
      if (status === 'buscar') {
        statusBuscarMsg.textContent = 'Nenhum trabalho presente encontrado.';
        statusBuscarMsg.className = 'status-error';
      } else {
        statusAtualizarMsg.textContent = 'Nenhum trabalho presente encontrado.';
        statusAtualizarMsg.className = 'status-error';
      }

      setTimeout(() => {
        if (status === 'buscar') {
          statusBuscarMsg.textContent = '';
          statusBuscarMsg.className = '';
          setTimeout(() => {
            statusAtualizarMsg.textContent = '';
            statusAtualizarMsg.className = '';
          }, 5000);
        } else {
          statusAtualizarMsg.textContent = '';
          statusAtualizarMsg.className = '';
        }
      }, 5000);

      console.error('Erro ao obter dados da API:', err);
    });
  }

  btnBuscar.addEventListener('click', () => {
    fetchData('buscar'); 
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
      container.innerHTML = '';
      fetchData('atualizar'); 
    } catch (err) {
      statusAtualizarMsg.textContent = 'Nenhum trabalho presente.';
      statusAtualizarMsg.className = 'status-error';

      setTimeout(() => {
        statusAtualizarMsg.textContent = '';
        statusAtualizarMsg.className = '';
      }, 5000);
    }
  });
});
