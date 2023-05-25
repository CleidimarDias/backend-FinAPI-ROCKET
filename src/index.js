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


// Middleware para verificar se o usuário existe
function verifyIfExistsAccountCPF(request, response, next){
    const {cpf} = request.headers;
    const customer = customers.find((customers)=>customers.cpf === cpf);

    if(!customer){
        return response.status(400).json({erro: "customer not found"})
    }

    request.customer = customer; //respansndo o customer para as demais rotas
    
    return next();
}

function getBalance(statement) {

    const balance = statement.reduce((acc, operation) => {
      if (operation.type === "credit") {
        return acc + (parseFloat(operation.amount));

      } else if (operation.type === "debit") {
        return acc - (parseFloat(operation.amount));

      }else {
        return acc;
      }
    }, 0);

    return balance;
}

// Para criar uma conta: 
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
});

// Para verificar se o cpf existe em TODAS as rotas: 
// app.use(verifyIfExistsAccountCPF)

// Para puxar o extrato: 
app.get("/statement",verifyIfExistsAccountCPF, (request, response)=>{
    const {customer} = request;
    
    return response.json(customer.statement);

});

// Para fazer um depósito: 
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
});

//operação de saque
app.post("/withdraw", verifyIfExistsAccountCPF, (request, response)=>{
    const {amount} = request.body;
    const {customer} = request;

    const balance = getBalance(customer.statement);

    if(balance <amount){
        return response.status(400).json({error: "Insufficient funds"});
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
});

//verifica o extrato por data
app.get('/statement/date', verifyIfExistsAccountCPF, (request, response)=>{
    const {customer} = request;
    const {date} = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter((statement)=>
     statement.created_at.toDateString() === new Date(dateFormat).toDateString())
    
        return response.json(statement)
});

app.put("/account", verifyIfExistsAccountCPF, (request, response)=>{
    const {name} = request.body;
    const {customer} = request;

    customer.name = name;

    return response.status(201).send();
})

//Para buscar os dados da conta do cliente
app.get("/account", verifyIfExistsAccountCPF, (request, response)=>{
    const {customer} = request;

    return response.json(customer)
});

//Para deletar uma conta
app.delete("/account", verifyIfExistsAccountCPF, (request, response)=>{
    const {customer} = request;

    customers.splice(customer, 1);

    return response.status(200).json(customers)
})

//Para ver o saldo da conta
app.get("/balance", verifyIfExistsAccountCPF, (request, response)=>{
    const {customer} = request;
    const balance = getBalance(customer.statement);
    return response.json(balance);

})


app.listen(3333, ()=>{

    console.log("Servidor rodando na porta 3333");
})

