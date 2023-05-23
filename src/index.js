const express = require('express');
const {v4: uuidv4} = require('uuid')

const app = express();
app.use(express.json())

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement []
 */
const customers = [];


// Middleware
function verifyIfExistsAccountCPF(request, response, next){
    const {cpf} = request.headers;
    const customer = customers.find((customers)=>customers.cpf === cpf);

    if(!customer){
        return response.status(400).json({erro: "customer not found"})
    }

    request.customer = customer; //respansndo o customer para as demais rotas
    
    return next();
}


app.post('/account', (request, response)=>{

    const {cpf, name} = request.body;

    const customersAlreadyExists = customers.some((customers)=>customers.cpf === cpf);

    if (customersAlreadyExists){
       
        return response.status(400).json({error: "Customer already exists!"})
    }    

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement:[]
    });

    return response.status(201).send()
})

// app.use(verifyIfExistsAccountCPF) quando precisar que todas as rotas contenha esse middleware

app.get("/statement",verifyIfExistsAccountCPF, (request, response)=>{
    const {customer} = request;
    
    return response.json(customer.statement);

});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response)=>{
    const {customer} = request;

    const { description, amount} = request.body;

    const statementOperation = {  //Operação para o depósito e saque
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    };

    customer.statement.push(statementOperation); // passando a operação para o statement de customer

    return response.status(200).send();
})


app.listen(3333, ()=>{

    console.log("Servidor rodando na porta 3333");
})

