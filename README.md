# Monster Hunter — Caderneta do Caçador

Projeto acadêmico desenvolvido para a disciplina de desenvolvimento web da FATEC Taquaritinga.
Um bestário interativo baseado no universo de **Monster Hunter Wilds**, construído com HTML, CSS e Vue.js 3.

---

## 🖥️ Tecnologias utilizadas

- **HTML5** — estrutura da página
- **CSS3** — estilização e layout
- **Vue.js 3** — reatividade e lógica da interface
- **API pública** — [wilds.mhdb.io](https://wilds.mhdb.io) para dados dos monstros
- **localStorage** — persistência dos monstros cadastrados manualmente

---

## 📋 Funcionalidades

### Bestário (API)
Os monstros do jogo são carregados automaticamente ao abrir a página através da API pública `wilds.mhdb.io/pt-BR/monsters`. Para cada monstro são exibidos:
- Nome
- Espécie (traduzida para português)
- Tamanho em metros
- Fraquezas elementais

### Ficha de detalhe
Ao clicar no nome de qualquer monstro na tabela, abre uma ficha com:
- Ícone do monstro
- Nome
- Espécie e Porte (Grande/Pequeno)
- Tamanho
- Fraquezas e Resistências elementais
- Descrição do monstro

### Cadastro manual
O formulário à esquerda permite registrar monstros personalizados com:
- Nome
- Espécie (seleção por lista)
- Tamanho em metros
- Fraquezas
- Descrição
- URL de imagem (opcional)

Os dados são salvos no **localStorage** do navegador — persistem mesmo após fechar a página.

O botão **Salvar** só é habilitado quando todos os campos obrigatórios estiverem preenchidos.

### Editar e excluir
- **Monstros manuais** podem ser editados (os dados voltam para o formulário) ou excluídos permanentemente
- **Monstros da API** podem ser excluídos da listagem — o ID fica salvo no localStorage para não reaparecer nas próximas visitas. Essa exclusão é local: outros usuários continuam vendo o monstro normalmente

### Busca
Três campos de busca em tempo real filtram a tabela simultaneamente por:
- Nome
- Espécie
- Fraquezas

---

## 📁 Estrutura de arquivos

```
mhw-bestiario/
├── index.html          # Estrutura da página e diretivas Vue
├── app.js              # Lógica Vue 3 (dados, métodos, API)
├── style.css           # Estilos e layout
└── imagens/
    ├── papelwpp.png        # Textura de papel usado nos painéis
    ├── ruins_wpp.jpeg      # Imagem de fundo da página
    ├── florest_wpp.jpg     # Imagem de fundo alternativa
    ├── rathaloswpp.png     # Imagem decorativa do cabeçalho
    └── monstros/           # Ícones dos monstros (nomeados pelo slug do monstro)
        ├── rey-dau.png
        ├── zoh-shia.png
        ├── gore-magala.png
        └── ...
```

---

## ⚙️ Como rodar localmente

1. Clone o repositório:
```bash
git clone https://github.com/Castilho64/mhw-bestiario.git
```

2. Abra o arquivo `index.html` diretamente no navegador

> **Atenção:** a API requer conexão com a internet para carregar os monstros do jogo. Os monstros cadastrados manualmente funcionam offline pois ficam salvos no localStorage.

---

## 🗂️ Como adicionar ícones de monstros

Os ícones dos monstros ficam na pasta `imagens/monstros/`. O arquivo deve ser nomeado com o nome do monstro em letras minúsculas com hífens no lugar dos espaços:

| Monstro | Nome do arquivo |
|---|---|
| Rey Dau | `rey-dau.png` |
| Zoh Shia | `zoh-shia.png` |
| Gore Magala | `gore-magala.png` |
| Doshaguma Guardião | `doshaguma-guardiao.png` |

Se o arquivo não existir, o ícone 🐉 é exibido no lugar.

---

## 📌 Observações

- Os assets visuais (imagens de fundo e ícones dos monstros) pertencem à **Capcom** e são utilizados exclusivamente para fins acadêmicos
- O projeto usa Vue.js 3 carregado via CDN — não requer instalação de dependências
- Os dados da API são em `pt-BR`; espécies e elementos são traduzidos por dicionários internos no `app.js`

---

*Desenvolvido por [João Vitor Castilho](https://linkedin.com/in/jvcastilho/) — FATEC Taquaritinga, ADS*
