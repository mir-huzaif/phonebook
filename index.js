const express = require('express');
const morgan = require('morgan');
const cors = require('cors')

morgan.token('body', getBody = (request) => {
  if(request.body)
    return JSON.stringify(request.body);
})


const app=express();

app.use(cors())
app.use(express.static('dist'));
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(person => person.id))
    : 0
    return maxId + 1;
}

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>`);
});

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);
  if(person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);

  response.status(204).end();
})

app.post('/api/persons', (request, response) => {

  const body = request.body
  const name = body.name; 
  const number = body.number;

  if(!name || !number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  if(persons.filter(person => person.name === name).length) {
    return response.status(400).json({
      error: 'name must be unique'
    })  
  }

  const person = {
    id: generateId(),
    name,
    number
  }
  persons = persons.concat(person);

  response.json(person);
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`)
});