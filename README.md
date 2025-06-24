# LoadTesterAPI

Uma ferramenta de teste de carga simples para APIs HTTP/HTTPS, desenvolvida em Node.js com TypeScript.

Este projeto permite que você envie um grande volume de requisições simultâneas a um endpoint e colete estatísticas detalhadas de desempenho, como:
- Tempo de resposta total
- Tempo até o primeiro byte (TTFB)
- Tempo até o último byte
- Código de status HTTP
- Erros de conexão (Timeout, ECONNREFUSED, etc.)

## 📚 Sumário
- [Funcionalidades](#1-funcionalidades)
- [Instalação](#2-instalação)
- [Uso](#3-uso)
- [Arquitetura](#4-arquitetura)
- [Documentação da API](#5-documentação-da-api)
- [Configuração](#6-configuração)
- [Licença](#7-licença)

## 1. Funcionalidades
- Teste de carga de endpoints HTTP e HTTPS
- Coleta de métricas detalhadas para cada requisição
- Detecção e contabilização de erros de conexão
- UUID para identificar cada execução de teste
- Resultados retornados em formato JSON estruturado

---

## 2. Instalação
### 2.1 Instalação via código fonte:

```bash
# Clone o repositório
$ git clone https://github.com/seu-usuario/load-tester.git

# Acesse a pasta
$ cd load-tester

# Instale as dependências
$ npm install
```

### 2.2 Instalação via Docker

```bash
# Fazer o build do Dockerfile
$ docker build -t load-tester-api .
```
OU

```bash
# Fazer o push da imagem do dockerhub
$ docker push luisfelixfilo\load-tester-api:latest
```

## 3. Uso
### 3.1 Uso via código fonte
```bash
# Compilar o código
$ npm run build

# Iniciar a aplicação
$ npm run start
```

### 3.2 Uso via Docker
- Após feito o build da imagem, ou push da imagem do docker hub no passo (#instalacao)
```bash
$ docker run -d -p 4000:4000 -t load-test-api:latest -n load-test-api

```

## 4. Arquitetura
- **Controllers**: Recebem as requisições HTTP e chamam os UseCases.
- **UseCases**: Lógica de negócio do teste de carga.
- **Entities/DTOs**: Definição de tipos como `ILoadTest`.
- **Utils**: Função `makeRequest` para medir requisições HTTP/HTTPS com coleta de tempos e códigos de status.
             Funçao `calcStat` para fazer o calculo de estatísticas da aplicação

----

## 5. Documentação da API
A `LoadTesterAPI` é uma ferramenta para realizar testes de carga em endpoints HTTP/HTTPS. Ela permite enviar um grande volume de requisições simultâneas e coletar métricas detalhadas de desempenho.
### 5.1 Rotas:

- `POST /load-test`[runLoadTest](#a-runloadtest)
- `GET /load-test` [getAllLoadTests](#b-getallloadtests)
- `GET /load-test/test/:id` [getLoadTestResults](#c-getloadtestresults)
- `GET /by-date?startDate={:dateStart}&endDate={:dateEnd}`[getTestsByDate](#d-gettestsbydate)


#### a. runLoadTest
Inicia um teste de carga.
#### Request Body
```json
{
  "targetUrl": "string",      // URL do endpoint a ser testado
  "numRequests": "number",    // Número total de requisições a serem enviadas
  "concurrency": "number",    // Número de requisições simultâneas
  "method": "string",         // (opcional) Método HTTP, ex: "POST"
  "payload": { ... },         // (opcional) Corpo da requisição para métodos como POST/PUT
  "headers": { ... },         // (opcional) Cabeçalhos HTTP personalizados
  "timeout": "number"         // (opcional) Timeout em ms
}
```

#### Exemplo de requisição POST com payload
```bash
curl -X POST http://localhost:4000/load-test \
-H "Content-Type: application/json" \
-d '{
  "targetUrl": "https://api.exemplo.com/endpoint",
  "numRequests": 50,
  "concurrency": 5,
  "method": "POST",
  "payload": { "nome": "Fulano", "idade": 30 },
  "headers": { "Authorization": "Bearer seu_token" }
}'
```

##### Response
- **201 Created**: Retorna os resultados do teste de carga.
```json
{
  "message": "Teste de carga completo com sucesso",
  "data": {
    "_id": "string",
    "url": "string",
    "requests": "number",
    "concurrency": "number",
    "result": [
      {
        "n": "number",
        "codeStatus": "number",
        "responseTime": "number",
        "timeToFirstByte": "number",
        "timeToLastByte": "number"
      }
    ],
    "stats": {
      "successCount": "number",
      "failedCount": "number",
      "requestsPerSecond": "number",
      "totalTime": { "min": "number", "max": "number", "avg": "number" },
      "timeToFirstByte": { "min": "number", "max": "number", "avg": "number" },
      "timeToLastByte": { "min": "number", "max": "number", "avg": "number" }
    },
    "createdAt": "string"
  }
}
```

- **400 Bad Request**: Parâmetros ausentes ou inválidos.
- **500 Internal Server Error**: Erro ao executar o teste.

---
#### b. getAllLoadTests
Retorna todos os testes de carga realizados.

##### Response
- **200 OK**: Lista de testes realizados.
```json
[
  {
    "_id": "string",
    "url": "string",
    "requests": "number",
    "concurrency": "number",
    "stats": {
      "successCount": "number",
      "failedCount": "number",
      "requestsPerSecond": "number",
      "totalTime": { "min": "number", "max": "number", "avg": "number" },
      "timeToFirstByte": { "min": "number", "max": "number", "avg": "number" },
      "timeToLastByte": { "min": "number", "max": "number", "avg": "number" }
    },
    "createdAt": "string"
  }
]
```

- **500 Internal Server Error**: Erro ao buscar os testes.

---
#### c. getLoadTestResults
Retorna os detalhes de um teste de carga específico.

##### Path Parameters
- `id`: ID do teste de carga.

##### Response
- **200 OK**: Detalhes do teste.
- **404 Not Found**: Teste não encontrado.
- **500 Internal Server Error**: Erro ao buscar o teste.

---
#### d. getTestsByDate
Retorna os testes realizados dentro de um intervalo de datas.

##### Query Parameters
- `startDate`: Data inicial no formato ISO (ex.: `2023-01-01`).
- `endDate`: Data final no formato ISO (ex.: `2023-01-31`).

##### Response
- **200 OK**: Lista de testes no intervalo especificado.
- **400 Bad Request**: Parâmetros ausentes ou inválidos.
- **500 Internal Server Error**: Erro ao buscar os testes.

---

### 5.2 Exemplo de Uso

#### a. Iniciar um teste de carga
```bash
curl -X POST http://localhost:4000/load-test \
-H "Content-Type: application/json" \
-d '{
  "targetUrl": "https://example.com",
  "numRequests": 100,
  "concurrency": 10
}'
```

#### b. Listar todos os testes
```bash
curl -X GET http://localhost:4000/load-test
```

#### c. Buscar um teste específico
```bash
curl -X GET http://localhost:4000/load-test/test/<id>
```

#### d. Buscar testes por intervalo de datas
```bash
curl -X GET "http://localhost:4000/load-test/by-date?startDate=2023-01-01&endDate=2023-01-31"
```

---

### 5.3 Erros Comuns

- **400 Bad Request**: Certifique-se de enviar todos os parâmetros obrigatórios no formato correto.
- **500 Internal Server Error**: Verifique os logs do servidor para mais detalhes.

---
## 6. Testes Automatizados

Este projeto possui testes unitários para os principais fluxos da API, utilizando [Jest](https://jestjs.io/) e [ts-jest](https://kulshekhar.github.io/ts-jest/).

### Como rodar os testes

```bash
# Execute todos os testes unitários
npm test

# Ou rode em modo watch (útil durante o desenvolvimento)
npm run test:watch
```

### O que é testado?

- **Controllers**: Validação dos fluxos de entrada e saída, tratamento de erros e integração com os serviços.
- **UseCases**: Execução do teste de carga, cálculo de estatísticas, contagem de sucessos/falhas e persistência dos resultados.

Os arquivos de teste estão localizados em:
- `src/controllers/runLoadTest.controller.spec.ts`
- `src/usecases/runLoadTest.usecase.spec.ts`

Os testes cobrem:
- Sucesso e falha ao criar um teste de carga
- Busca de resultados por ID e por intervalo de datas
- Cálculo correto de estatísticas e contagem de requisições bem-sucedidas/falhas

---

## 7. Configuração
- Porta padrão: `4000` (pode ser alterada via variável de ambiente `PORT`).
- Certifique-se de configurar o arquivo `.env` para variáveis sensíveis.

---

## 8. Licença
Este projeto está licenciado sob a [MIT License](LICENSE).