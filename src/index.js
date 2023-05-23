const express = require('express');
const {v4: uuidv4} = require('uuid')

const app = express();
app.use(express.json())

const customers = [];

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement []
 */

app.post('/account', (request, response)=>{

    const {cpf, name} = request.body;

    const customersAlreadyExists = customers.some((customers)=>customers.cpf === cpf);

    if (customersAlreadyExists){
        console.log(cpf, name);
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

app.get("/statement", (request, response)=>{
    const {cpf} = request.headers;

    const customer = customers.find((customers) => customers.cpf === cpf);

    if(!customer){
        return response.status(400).json({error: "Customer not found"});
    }

    return response.json(customer.statement);

});


app.listen(3333, ()=>{

    console.log("Servidor rodando na porta 3333");
})

