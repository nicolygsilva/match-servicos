# App Serviços

Plataforma web para conectar clientes e prestadores de serviço em uma busca de duas vias.

O cliente pode procurar profissionais próximos, ver avaliações públicas, conferir uma média de preço e iniciar um match para conversar no chat. O prestador, por sua vez, também pode visualizar clientes próximos que estão buscando um serviço e decidir se quer iniciar o contato.

## Visão geral

O projeto foi pensado como um marketplace simples de serviços locais.

Fluxo principal:

1. O usuário cria uma conta como `cliente` ou `prestador`.
2. Cada perfil pode preencher informações de localização.
3. O cliente informa o serviço que procura e visualiza prestadores próximos.
4. O prestador informa o serviço que oferece, sua descrição e o orçamento médio.
5. Quando existe interesse, uma das partes inicia um `match`.
6. O match abre um chat persistido durante a execução do backend.
7. O cliente pode voltar depois ao chat e, ao final, deixar uma avaliação pública.

## O que o sistema faz hoje

- Cadastro e login de cliente e prestador
- Edição de perfil
- Campo de CEP, endereço, bairro, cidade e coordenadas
- Botão `Usar minha localização`
- Vitrine de prestadores para o cliente
- Vitrine de clientes próximos para o prestador
- Cálculo de distância com base em endereço e coordenadas
- Match entre cliente e prestador
- Chat entre as partes
- Envio de orçamento no chat
- Avaliações públicas visíveis na vitrine
- Persistência de usuários em arquivo JSON local

## Estrutura do projeto

```text
app-servicos/
├── backend/
│   ├── data/
│   │   ├── mockUsers.js
│   │   └── users.json
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── README.md
```

## Tecnologias utilizadas

- React
- Vite
- React Router
- Express
- Node.js
- JSON local para persistência simples de usuários

## Como funciona a distância

Hoje a distância segue esta ordem:

- Se endereço, bairro e cidade forem iguais, o sistema considera `0.0 km`
- Se houver latitude e longitude, a distância é calculada de forma mais precisa
- Se não houver coordenadas, o sistema usa uma aproximação por bairro e cidade

Para testes mais realistas, vale preencher a localização no perfil ou usar o botão `Usar minha localização`.

## Requisitos para rodar localmente

Você precisa ter instalado:

- Node.js 18+ recomendado
- npm

## Como baixar e testar

### 1. Clonar o repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd app-servicos
```

### 2. Instalar dependências do frontend

```bash
cd frontend
npm install
```

### 3. Instalar dependências do backend

```bash
cd ../backend
npm install
```

### 4. Iniciar o backend

```bash
cd backend
npm run dev
```

O backend sobe em:

```text
http://127.0.0.1:5001
```

### 5. Iniciar o frontend

Em outro terminal:

```bash
cd frontend
npm run dev
```

O frontend normalmente sobe em:

```text
http://localhost:5173
```

## Como testar o fluxo principal

### Cliente

- Criar conta como cliente
- Preencher perfil com localização
- Informar o serviço que está procurando
- Ver prestadores na home
- Dar match e abrir chat
- Voltar depois em `Seus chats ativos`
- Enviar avaliação pública ao final

### Prestador

- Criar conta como prestador
- Preencher perfil com serviço, descrição, localização e orçamento médio
- Ver clientes próximos na home
- Dar match se houver interesse
- Entrar no chat
- Enviar orçamento

## Persistência atual

Os usuários ficam salvos em:

- [backend/data/users.json](/Users/nicolyguedes/app-servicos/backend/data/users.json)

Isso significa que:

- novos cadastros permanecem salvos mesmo se o backend reiniciar
- o sistema hoje não usa banco de dados real
- os chats e solicitações ainda estão em memória e podem se perder ao reiniciar o backend

## Pontos que ainda podem evoluir

- Persistir chats e solicitações em arquivo ou banco de dados
- Melhorar filtros de busca
- Integrar geocodificação por CEP
- Melhorar o sistema de match com etapas mais claras
- Adicionar deploy
- Adicionar testes automatizados

## Observação importante

Este README foi preparado como uma primeira versão para publicação no GitHub. Ele já explica bem o projeto e como rodar localmente, mas pode continuar evoluindo junto com a aplicação.
