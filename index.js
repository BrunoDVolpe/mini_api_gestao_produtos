const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

// Middleware para logar informações da requisição
const logReqInfo = (req, res, next) => {
    const horaAtual = new Date().toISOString()
    console.log(`[${horaAtual}]: Nova solicitação recebida: ${req.method} ${req.originalUrl}`);
    next();
}

// Aplicar em todas as solicitações
app.use(logReqInfo)

// Lista de produtos para simular um banco de dados e armazenar os dados. Inicializo com um produto nela.
const produtos = [{
    "id": 1,
    "nome": "notebook",
    "preco": 2499.00,
    "descricao": "Notebook Inspiron 15"},
]

app.get("/", (req, res) => {
    // Redirect apenas para que home seja alterada para listar os produtos
    res.redirect("/produtos");
})

app.post("/produtos", (req, res)=>{
    const { nome, preco, descricao } = req.body;
    let erro = [];
    // Validar que produto tenha
    if (!nome || !preco || !descricao){
        res.status(400).send("Erro: produto não criado. Faltando nome, preço ou descrição.");
        return
    }
    if (typeof(nome) !== 'string' && nome.length === 0) {
        // Obrigatório. Deve ser string e maior que zero.
        erro.push("'nome' deve ser uma string não vazia");
    }
    if (typeof(preco) !== 'number' && isNaN(parseFloat(preco))) {
        // Obrigatório. Deve ser número.
        erro.push("'preco' deve ser um número não vazio");
    }
    if (typeof(descricao) !== 'string' && descricao.length === 0) {
        // Obrigatório. Deve ser string não vazia.
        erro.push("'descricao' deve ser uma string não vazia");
    }
    if (erro.length > 0) {
        let msg = "Erro: " + erro.join(", ");
        res.status(400).send(msg);
        return
    }
    // Inserir id baseado no index + 1
    const novo_id = produtos.length + 1;
    let produto = {id:parseInt(novo_id), nome, preco: parseFloat(preco).toFixed(2), descricao};
    produtos.push(produto);
    res.status(201).json(produto);
})

app.get("/produtos", (req, res)=>{
    // Listar todos os produtos, excluindo os nulos (já apagados)
    res.json(produtos.filter(prod=>prod));
})

app.put("/produtos/:id", (req, res)=>{
    let { id } = req.params;
    const {nome, preco, descricao} = req.body
    let erro = [];

    // Verificar e validar o que está sendo alterado
    if (typeof(nome) !== 'string' && nome.length === 0) {
        // Obrigatório. Deve ser string e maior que zero.
        erro.push("'nome' deve ser uma string não vazia");
    }
    if (preco && (typeof(preco) !== 'number' && isNaN(parseFloat(preco)))) {
        // Obrigatório. Deve ser número.
        erro.push("'preco' deve ser um número não vazio");
    }
    if (descricao && (typeof(descricao) !== 'string' && descricao.length === 0)) {
        // Obrigatório. Deve ser string não vazia.
        erro.push("'descricao' deve ser uma string não vazia");
    }
    if (erro.length > 0) {
        let msg = "Erro: " + erro.join(", ");
        res.status(400).send(msg);
        return
    }
    let index = produtos.findIndex(el => {
        if (el) {
            return el.id === parseInt(id);
        }
        return false;
    })
    produtos[index] = {id: parseInt(id), nome, preco: parseFloat(preco).toFixed(2), descricao};
    res.status(200).json(`Produto ID ${id} atualizado com sucesso`);
})

app.delete("/produtos/:id", (req, res)=>{
    let { id } = req.params;
    let index = produtos.findIndex(el => {
        if (el) {
            return el.id === parseInt(id);
        }
        return false;
    })
    if (index === -1) {
        res.status(404).send(`Produto com ID ${id} não encontrado.`)
        return
    }
    delete produtos[index]
    res.status(200).send("Item deletado com sucesso.")
})

app.listen(PORT, ()=>{
    console.log(`Servidor rodando na porta ${PORT}`)
})