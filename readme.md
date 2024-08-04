
# Documentação do projeto

Todas as funções js e componentes serão documentados aqui.




## Autores

- [@jvs-dev](https://www.github.com/jvs-dev)


## Alternar paginas

```javascript
  logoAlternateAnimation(page)
```

| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `page` | `Document HTML` | **Obrigatório**. Seção que para qual será redicecionado após uma breve animação |

<br/>
<br/>

```javascript
  alternatePage(page)
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `page`      | `Document HTML` | **Obrigatório**. Seção que para qual será redicecionado |


<br/>

## Comentarios

```javascript
  postComment(databaseName, id, email, text)
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `databaseName`      | `string` | **Obrigatório**. Nome do database a ser adicionado o comentario(pode ser "challenges" ou "lessons") |
| `id`      | `string` | **Obrigatório**. Id do desafio ou lição a ser adicionado o comentario |
| `email`      | `string` | **Obrigatório**. Email do usuario que esta adicionando um comentario |
| `text`      | `string` | **Obrigatório**. Texto do comentario |
**Retorna**: Id do comentario criado |

<br/>
<br/>

```javascript
  getComments(databaseName, id)
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `databaseName`      | `string` | **Obrigatório**. Nome do database a ser requisitado os comentarios(pode ser "challenges" ou "lessons") |
| `id`      | `string` | **Obrigatório**. Id do desafio ou lição a ser requisitado os comentarios |
**Retorna**: Todos os comentarios de uma aula ou desafio |

<br/>
<br/>

```javascript
  getThisComment(databaseName, id, comentId)
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `databaseName`      | `string` | **Obrigatório**. Nome do database a ser requisitado o comentario(pode ser "challenges" ou "lessons") |
| `id`      | `string` | **Obrigatório**. Id do desafio ou lição a ser requisitado o comentario |
| `comentId`      | `string` | **Obrigatório**. Id do comentario a ser requisitado |
**Retorna**: Dados do comentario ou "No such document!" caso não seja encontrado |

<br/>

## Informações do usuario

```javascript
  actualUserEmail()
```
**Retorna**: Email do usuario atualmente conectado ou "no user conected" se não houver usuario logado

<br/>
<br/>

```javascript
  actualUserData()
```
**Retorna**: Dados da database "user" do usuario atualmente conectado ou "no such document" se o documento não for encontrado

<br/>
<br/>

```javascript
  thisUserData(email)
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `email`     | `string`   | **Obrigatório**. Email do usuario que será requisitado os dados |
**Retorna**: Dados do usuario que foi passado o email da database "users" |