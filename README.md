# Sistema de Cadastro de Consulentes e Registro de Trabalhos

Sistema web para cadastro de consulentes, registro dos trabalhos realizados e geração de relatórios detalhados.

---

## Índice

- [Descrição](#descrição)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Como Usar](#como-usar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuições](#contribuições)
---

## Descrição

Este projeto é uma aplicação web que permite cadastrar consulentes, registrar diversos tipos de trabalhos realizados para cada consulente, e gerar relatórios filtrados por período e tipo de trabalho. Foi desenvolvido para facilitar a organização e controle de atendimentos.

---

## Funcionalidades

- Cadastro simples de consulentes (nome e telefone).
- Registro de trabalhos com múltiplas opções e subcategorias (como Saída de Fogo, Cura, Ebó).
- Seleção de datas para os trabalhos realizados.
- Relatórios dinâmicos que permitem filtrar registros por data e status (feito ou não compareceu).
- Interface intuitiva com menu em abas para navegação entre cadastro, registro e relatórios.

---

## Tecnologias Utilizadas

- HTML5 (arquivo principal: `home.html`)
- CSS3 (`styles/main.css`)
- JavaScript modularizado:
  - `cadastro/cadastro.js` — lógica de cadastro de consulentes
  - `trabalhos/registro.js` — lógica para registro de trabalhos
  - `trabalhos/consulta.js` — lógica para geração e filtragem de relatórios

---

## Como Usar

1. Abra o arquivo `home.html` em seu navegador preferido.
2. Navegue entre as abas para:
   - **Cadastro:** inserir dados de consulentes.
   - **Registro de Trabalhos:** registrar os trabalhos realizados, com seleção detalhada de tipos.
   - **Relatório de Trabalhos:** consultar, filtrar e atualizar o status dos trabalhos.
3. Utilize os botões e campos para interagir com o sistema conforme necessário.

---

## Estrutura do Projeto

/
├── cadastro/
│ └── cadastro.js
├── styles/
│ └── main.css
├── trabalhos/
│ ├── consulta.js
│ └── registro.js
└── home.html



---

## Contribuições

Contribuições são bem-vindas! Para colaborar, abra uma issue ou envie um pull request com sugestões ou melhorias.
