document.getElementById('btn-buscar-relatorio').addEventListener('click', async () => {
    const dataInput = document.getElementById('relatorio-data');
    const messageEl = document.getElementById('relatorio-message');
    const tabelaContainer = document.getElementById('relatorio-tabela-container');
  
    const dataSelecionada = dataInput.value;
    if (!dataSelecionada) {
      messageEl.textContent = "Por favor, selecione uma data.";
      messageEl.className = "message error";
      tabelaContainer.innerHTML = "";
      return;
    }
  
    messageEl.textContent = "Buscando dados...";
    messageEl.className = "message";
  
    try {
      const webhookUrl = 'https://webhook-test.com/10db0ca862557b2b55bc554938bc898d'; // substitua pela sua URL real
  
      // Faz a requisição POST enviando a data no corpo JSON
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: dataSelecionada })
      });
  
      if (!response.ok) {
        const textoErro = await response.text();
        throw new Error(`Erro: ${response.status} - ${textoErro}`);
      }
  
      const dados = await response.json();
  
      if (!dados || dados.length === 0) {
        messageEl.textContent = "Nenhum dado encontrado para a data selecionada.";
        messageEl.className = "message error";
        tabelaContainer.innerHTML = "";
        return;
      }
  
      // Monta a tabela com os dados recebidos
      let tabelaHTML = "<table><thead><tr>";
  
      const colunas = Object.keys(dados[0]);
      colunas.forEach(col => {
        tabelaHTML += `<th>${col}</th>`;
      });
      tabelaHTML += "</tr></thead><tbody>";
  
      dados.forEach(item => {
        tabelaHTML += "<tr>";
        colunas.forEach(col => {
          tabelaHTML += `<td>${item[col]}</td>`;
        });
        tabelaHTML += "</tr>";
      });
  
      tabelaHTML += "</tbody></table>";
  
      tabelaContainer.innerHTML = tabelaHTML;
      messageEl.textContent = "Dados carregados com sucesso.";
      messageEl.className = "message success";
  
    } catch (error) {
      messageEl.textContent = "Erro ao buscar dados: " + error.message;
      messageEl.className = "message error";
      tabelaContainer.innerHTML = "";
    }
  });
  