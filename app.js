/*
 * app.js — Lógica da aplicação Vue 3
 * ─────────────────────────────────────────────────────────────
 * Fontes de dados:
 *   1. API  → https://wilds.mhdb.io/pt-BR/monsters  (monstros do jogo)
 *   2. localStorage → monstros cadastrados manualmente pelo formulário
 *
 * Os dois são exibidos juntos na tabela.
 * Monstros da API têm origem: 'api' | manuais têm origem: 'manual'
 */


/* ─────────────────────────────────────────────────────────────
   CLASSE MONSTRO
   Molde para monstros cadastrados manualmente pelo formulário.
   Monstros da API são mapeados separadamente em carregarAPI().
   ───────────────────────────────────────────────────────────── */
class Monstro {
    constructor(nome, especie, tamanho, fraquezas, descricao, imagem) {
        this.nome      = nome
        this.especie   = especie
        this.tamanho   = tamanho       // número em metros
        this.fraquezas = fraquezas     // texto livre, ex: "Fogo, Trovão"
        this.descricao = descricao
        this.imagem    = imagem        // URL da imagem (opcional)
        this.origem    = 'manual'      // identifica que veio do formulário
        this.kind      = ''
        this.resistencias = ''
    }
}


/* ─────────────────────────────────────────────────────────────
   DICIONÁRIOS DE TRADUÇÃO
   A API retorna kind e species em inglês mesmo no locale pt-BR.
   Estes objetos traduzem os valores para exibição.
   ───────────────────────────────────────────────────────────── */
const TRADUCAO_KIND = {
    'large': 'Grande',
    'small': 'Pequeno'
}

const TRADUCAO_SPECIES = {
    'flying-wyvern':  'Serpe Voadora',
    'brute-wyvern':   'Serpe Bruta',
    'fanged-beast':   'Serpe de Presas',
    'bird-wyvern':    'Serpássaro',
    'leviathan':      'Leviatã',
    'temnoceran':     'Temnocerano',
    'amphibian':      'Anfíbio',
    'elder-dragon':   'Dragão Ancião',
    'construct':      'Constructo',
    'cephalopod':     'Cefalópode',
    'machine':        'Máquina',
    'demi-elder':     'Semi-Ancião',
    'fish':           'Peixe',
    'neopteron':      'Neóptero',
    'wingdrake':      'Serpássaro Alado'
}

const TRADUCAO_ELEMENTOS = {
    'fire':    'Fogo',
    'water':   'Água',
    'thunder': 'Trovão',
    'ice':     'Gelo',
    'dragon':  'Dragão',
    'poison':  'Veneno',
    'blast':   'Explosão',
    'sleep':   'Sono',
    'paralysis': 'Paralisia',
    'stun':    'Atordoamento',
    'noise':   'Ruído',
    'flash':   'Flash',
    'exhaust': 'Exaustão',
    'blastblight': 'Explosão'
}


Vue.createApp({

    data() {
        return {
            // ── Formulário ──────────────────────────────────────
            nome:          '',   // campo Nome
            especie:       '',   // campo Espécie (select)
            tamanho:       '',   // campo Tamanho em metros
            fraquezas:     '',   // campo Fraquezas (texto livre)
            imagem:        '',   // campo URL da imagem (opcional)
            posicao:       -1,   // -1 = novo cadastro | 0+ = índice editado
            descricao:     '',   // campo descrição

            // ── Listas ──────────────────────────────────────────
            listaMonstros:    [],  // monstros manuais (localStorage)
            monstrосAPI:      [],  // monstros carregados da API
            carregandoAPI:    false, // true enquanto a requisição está em andamento
            erroAPI:          '',    // mensagem de erro se a API falhar
            monstrosBloqueados: [], // IDs dos monstros da API que foram excluídos

            // ── Busca ────────────────────────────────────────────
            buscaNome:      '',
            buscaEspecie:   '',
            buscaFraquezas: '',

            // ── Modal de detalhe ─────────────────────────────────
            monstroSelecionado: null,  // monstro exibido no modal (null = fechado)
        }
    },

    computed: {
        listaCompleta() {
            return [
                ...this.monstrосAPI.filter(m => !this.monstrosBloqueados.includes(m.id)),
                ...this.listaMonstros
            ]
        },

        listaFiltrada() {
            return this.listaCompleta.filter(monstro => {
                const nome      = (monstro.nome      || '').toLowerCase()
                const especie   = (monstro.especie   || '').toLowerCase()
                const fraquezas = (monstro.fraquezas || '').toLowerCase()
                return nome.includes(this.buscaNome.toLowerCase()) &&
                    especie.includes(this.buscaEspecie.toLowerCase()) &&
                    fraquezas.includes(this.buscaFraquezas.toLowerCase())
            })
        }

    },

    methods: {

        /* ── API ─────────────────────────────────────────────────
           carregarAPI()
           Busca todos os monstros da API e mapeia para o formato
           usado pelo projeto. Chamado automaticamente no created().
           ──────────────────────────────────────────────────────── */
        async carregarAPI() {
            this.carregandoAPI = true
            this.erroAPI = ''
            try {
                const resposta = await fetch('https://wilds.mhdb.io/pt-BR/monsters')
                const dados    = await resposta.json()

                // Mapeia cada item da API para o formato do projeto
                this.monstrосAPI = dados.map(m => ({
                    id:           m.id,
                    gameId:       m.gameId,
                    nome:         m.name  || 'Sem nome',
                    especie:      TRADUCAO_SPECIES[m.species] || m.species || '—',
                    kind:         TRADUCAO_KIND[m.kind]       || m.kind    || '—',
                    // size.base vem em milímetros — converte para metros com 2 casas
                    tamanho:      m.size  ? (m.size.base / 1000).toFixed(2) : '—',
                    // weaknesses: pega só os de kind "element" e junta os nomes
                    fraquezas:    this.extrairElementos(m.weaknesses),
                    // resistances: pega só os de kind "element"
                    resistencias: this.extrairElementos(m.resistances),
                    descricao:    m.description || '—',
                    // imagem montada pelo nome do monstro em minúsculo sem espaços
                    imagem:       this.montarCaminhoImagem(m.name),
                    origem:       'api'
                }))
            } catch (erro) {
                this.erroAPI = 'Não foi possível carregar os monstros da API.'
                console.error(erro)
            } finally {
                this.carregandoAPI = false
            }
        },

        /* extrairElementos(array)
           Recebe o array de weaknesses ou resistances da API e
           retorna apenas os de kind "element" como texto, ex: "Gelo, Trovão" */
        extrairElementos(array) {
            if (!array || array.length === 0) return '—'
            return array
                .filter(item => item.kind === 'element')
                .map(item => {
                    const chave = item.element || item.effect || ''
                    return TRADUCAO_ELEMENTOS[chave] || this.capitalizarPrimeira(chave)
                })
                .filter(Boolean)
                .join(', ') || '—'
        },

        /* montarCaminhoImagem(nome)
           Monta o caminho local da imagem pelo nome do monstro.
           Ex: "Rey Dau" → "imagens/monstros/rey-dau.png"
           Se a imagem não existir o HTML mostra o emoji 🐉 como fallback. */
        montarCaminhoImagem(nome) {
            if (!nome) return ''
            return 'imagens/monstros/' + nome.toLowerCase().replace(/\s+/g, '-') + '.png'
        },

        /* capitalizarPrimeira(texto) — "thunder" → "Thunder" */
        capitalizarPrimeira(texto) {
            if (!texto) return ''
            return texto.charAt(0).toUpperCase() + texto.slice(1)
        },

        /* ── Modal ───────────────────────────────────────────────
           abrirModal(monstro) — exibe a ficha de detalhe do monstro
           fecharModal()       — fecha o modal                        */
        abrirModal(monstro) {
            this.monstroSelecionado = monstro
        },

        fecharModal() {
            this.monstroSelecionado = null
        },

        /* ── Formulário ──────────────────────────────────────────
           salvar() — cria ou edita um monstro manual no localStorage */
        salvar() {
            let monstro = new Monstro(
                this.nome,
                this.especie,
                this.tamanho,
                this.fraquezas,
                this.descricao,
                this.imagem
            )
            if (this.posicao == -1) {
                this.listaMonstros.push(monstro)
            } else {
                // Edição: substitui o item no índice
                // Atenção: posicao se refere ao índice em listaMonstros, não em listaCompleta
                this.listaMonstros[this.posicao] = monstro
            }
            this.armazenar()
            this.limpar()
        },

        /* verificar() — habilita o botão Salvar só se os campos obrigatórios estiverem preenchidos */
        verificar() {
            return this.nome      != '' &&
                   this.especie   != '' &&
                   this.tamanho   != '' &&
                   this.fraquezas != '' &&
                   this.descricao   != '' 
        },

        /* limpar() — zera o formulário e volta posicao para -1 */
        limpar() {
            this.posicao   = -1
            this.nome      = ''
            this.especie   = ''
            this.tamanho   = ''
            this.fraquezas = ''
            this.descricao = ''
            this.imagem    = ''
        },

        /* alterar(monstro)
           Preenche o formulário com os dados do monstro manual para edição.
           Só funciona para monstros de origem 'manual' — os da API não são editáveis. */
        alterar(monstro) {
            // Encontra o índice real dentro de listaMonstros
            const idx = this.listaMonstros.indexOf(monstro)
            if (idx === -1) return  // segurança: não encontrado
            this.posicao   = idx
            this.nome      = monstro.nome
            this.especie   = monstro.especie
            this.tamanho   = monstro.tamanho
            this.fraquezas = monstro.fraquezas
            this.descricao = monstro.descricao
            this.imagem    = monstro.imagem
        },

        /* excluir(monstro)
           Remove o monstro manual da lista. Monstros da API não podem ser excluídos. */
        excluir(monstro) {
            if (confirm('Tem certeza que deseja excluir?')) {
                if (monstro.origem === 'api') {
                    this.monstrosBloqueados.push(monstro.id)
                    localStorage.setItem('monstrosBloqueados', JSON.stringify(this.monstrosBloqueados))
                } else {
                    const idx = this.listaMonstros.indexOf(monstro)
                    if (idx !== -1) {
                        this.listaMonstros.splice(idx, 1)
                        this.armazenar()
                    }
                }
            }
        },

        /* armazenar() — salva listaMonstros (manuais) no localStorage */
        armazenar() {
            localStorage.setItem('listaMonstros', JSON.stringify(this.listaMonstros))
        },

        /* carregar() — recupera listaMonstros do localStorage ao iniciar */
        carregar() {
            let dados = localStorage.getItem('listaMonstros')
            if (dados != null) {
                this.listaMonstros = JSON.parse(dados)
            }
            let bloqueados = localStorage.getItem('monstrosBloqueados')
            if (bloqueados != null) {
                this.monstrosBloqueados = JSON.parse(bloqueados)
            }
        }
    },

    /* created() — executado quando o Vue inicializa
       Carrega os monstros do localStorage e da API ao mesmo tempo. */
    created() {
        this.carregar()
        this.carregarAPI()
    }

}).mount('#app')
