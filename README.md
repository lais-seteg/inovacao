# SSI Seteg — Sistema de Solicitação de Inovação

Portal interno para qualquer colaborador da Seteg registrar ideias de inovação
(criação de sistemas, automações, dashboards ou melhorias em sistemas já
existentes), acompanhar o andamento e receber feedback do time responsável.

Aplicação estática (HTML + CSS + JS puro, sem build), com persistência em
[Supabase](https://supabase.com) e fallback automático para `localStorage`
quando offline.

## Sumário

- [Visão geral](#visão-geral)
- [Perfis de acesso](#perfis-de-acesso)
- [Fluxo de status](#fluxo-de-status)
- [Funcionalidades](#funcionalidades)
- [Estrutura de arquivos](#estrutura-de-arquivos)
- [Configuração do Supabase](#configuração-do-supabase)
- [Rodando localmente](#rodando-localmente)
- [Modelo de dados](#modelo-de-dados)
- [Segurança](#segurança)

## Visão geral

Qualquer pessoa (sem login) pode abrir o site e clicar em **"Nova
Solicitação"**, que abre um formulário em popup com:

| Campo | Tipo | Observação |
|---|---|---|
| Nome do Solicitante | texto | obrigatório, salvo em maiúsculas |
| Setor | select | Administrativo, Financeiro, Projetos, Inovação |
| Tipo de Solicitação | select | Criação de Sistema, Automação, Dashboard, Melhoria de Sistema |
| Qual sistema deseja melhorar | texto | só aparece quando o tipo é "Melhoria de Sistema" |
| Data Prevista | texto mascarado `00/00/0000` | data esperada de conclusão |
| Projeto Relacionado (Clockify) | autocomplete | opcional — busca projetos direto na API do Clockify |
| Melhoria Gerada para a Empresa | textarea | obrigatório — qual o ganho esperado |

Ao enviar, a solicitação recebe um ID sequencial (`INOV-001`, `INOV-002`, ...)
e entra automaticamente com status **Em Análise**, para o Gestor avaliar.

## Perfis de acesso

Login por senha/código individual (sem cadastro de usuário nem Supabase Auth
— validado por RPC direto no banco):

- **Gestor** — vê todas as solicitações. Pode aprovar/reprovar (com
  justificativa), atribuir um desenvolvedor, alterar status manualmente e
  excluir solicitações.
- **Desenvolvedor** — só vê as solicitações atribuídas a ele. Pode marcar
  "Finalizar Desenvolvimento" (envia para testes) e "Finalizar Testes"
  (conclui).
- **Anônimo (sem login)** — só enxerga o card de "Nova Solicitação" e a
  tabela geral; pode comentar em qualquer solicitação através do botão de
  balão 💬 na tabela.

## Fluxo de status

```
Em Análise ──► Aprovado ──► Em Desenvolvimento ──► Em Testes ──► Concluído
     │
     └──────► Reprovado (com justificativa)
```

- **Em Análise → Aprovado/Reprovado**: ação do Gestor.
- **Atribuir Desenvolvedor**: o Gestor escolhe quem vai executar; ao
  atribuir, o status muda automaticamente para **Em Desenvolvimento** (a
  menos que já esteja em Testes ou finalizado).
- **Em Desenvolvimento → Em Testes**: o Desenvolvedor clica em "Finalizar
  Desenvolvimento".
- **Em Testes → Concluído**: o Desenvolvedor clica em "Finalizar Testes".

## Funcionalidades

- **Tabela com ações estilo Compras** (`card_novo`): linha inteira clicável,
  botões de ação em ícone (`.btn-icon`), badge de ID em monospace.
- **Tela de detalhes**: seção "Identificação do Solicitante" (ID, status,
  nome, setor, datas, projeto) e "Detalhes da Solicitação", no mesmo padrão
  visual do sistema de Compras.
- **Comentários**: qualquer pessoa (inclusive quem não tem login) pode
  comentar em uma solicitação depois de criada; se não estiver logado, o
  sistema pede o nome antes de salvar.
- **KPIs laterais** com contagem por status (respeitando o filtro do perfil
  logado — o Desenvolvedor só vê números das suas próprias solicitações).
- **Filtros e busca**: por status (pills), setor, tipo, e busca livre por
  solicitante/setor/desenvolvedor/projeto/ID.
- **Autocomplete de projetos Clockify**: busca ao vivo na API do Clockify ao
  digitar no campo "Projeto Relacionado".
- **Tema claro/escuro** com preferência salva no navegador.
- **Modo offline**: se o Supabase estiver fora do ar, os dados são salvos em
  `localStorage` e sincronizados automaticamente na próxima conexão.

## Estrutura de arquivos

```
inovacao/
├── index.html            # markup + modais
├── script.js             # toda a lógica (Supabase, permissões, render, Clockify)
├── style.css             # tema, layout, componentes
├── images/                # logo, favicon, fundos
├── supabase_schema.sql   # schema completo do banco (NÃO versionado — .gitignore)
└── .gitignore
```

## Configuração do Supabase

1. Crie um projeto novo no [Supabase](https://supabase.com).
2. Abra o **SQL Editor** e rode o arquivo `supabase_schema.sql` inteiro (ele
   cria as tabelas, as funções RPC de login e os usuários iniciais).
3. Cole a **URL do projeto** e a **publishable key** no topo de `script.js`:

   ```js
   const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
   const SUPABASE_ANON_KEY = 'sb_publishable_...';
   ```

4. Para cadastrar um novo Gestor ou Desenvolvedor, insira uma linha na
   tabela `usuarios` (`tipo`, `nome`, `senha`, `ativo`) — não existe tela de
   cadastro no app, é feito direto no banco.

> `supabase_schema.sql` fica de fora do repositório (`.gitignore`) porque
> contém as senhas reais de acesso. Guarde-o com cuidado fora do Git.

## Rodando localmente

Este projeto não tem build nem dependências — é HTML/CSS/JS estático. Basta
servir a pasta com qualquer servidor local, por exemplo:

```bash
npx serve .
# ou
python -m http.server 8080
```

e abrir `http://localhost:PORTA` no navegador.

## Modelo de dados

**`solicitacoes_inovacao`**

| Coluna | Tipo | Descrição |
|---|---|---|
| `solicitacao_id` | text | ID sequencial `INOV-###` |
| `nomeSolicitante` | text | Nome de quem pediu |
| `setor` | text | Administrativo / Financeiro / Projetos / Inovação |
| `tipoInovacao` | text | Criação de Sistema / Automação / Dashboard / Melhoria de Sistema |
| `sistemaMelhoria` | text | Preenchido só quando o tipo é "Melhoria de Sistema" |
| `prazoEstimado` | text | Data prevista, formato `dd/mm/aaaa` |
| `projeto` / `projetoCodigo` | text | Projeto do Clockify vinculado (opcional) |
| `melhoriaEsperada` | text | Ganho esperado para a empresa |
| `status` | text | Em Análise / Aprovado / Reprovado / Em Desenvolvimento / Em Testes / Concluído |
| `desenvolvedor_responsavel` | text | Nome do dev atribuído |
| `reprovacao_justificativa` | text | Motivo, quando reprovado |

**`historico_inovacao`** — uma linha por evento (criação, atribuição,
aprovação/reprovação, mudança de status, comentário), com `usuario_nome` e
`usuario_tipo` de quem executou a ação.

**`usuarios`** — credenciais de Gestor(es) e Desenvolvedor(es) (`tipo`,
`nome`, `senha`, `ativo`).

## Segurança

- A tabela `usuarios` tem RLS ativo **sem nenhuma policy de leitura direta**
  — só é acessível através de duas funções RPC (`buscar_nome_por_codigo` e
  `listar_desenvolvedores`), rodando como `security definer`. Isso impede
  que alguém com a chave pública do Supabase consiga listar a tabela e ver
  as senhas.
- `solicitacoes_inovacao` e `historico_inovacao` são liberadas para leitura/
  escrita pela chave pública, pois são o próprio dado operacional do app
  (sem login/Auth do Supabase envolvido).
- A `SUPABASE_ANON_KEY` (publishable key) é feita para ficar no código do
  navegador — não é segredo. O que precisa de cuidado é o arquivo
  `supabase_schema.sql`, que contém as senhas reais e por isso não é
  versionado.
