require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
const cors = require('cors')

morgan.token('body', (request) => {
  if(request.body)
    return JSON.stringify(request.body)
})


const app=express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// let persons = [
//   {
//     'id': 1,
//     'name': 'Arto Hellas',
//     'number': '040-123456'
//   },
//   {
//     'id': 2,
//     'name': 'Ada Lovelace',
//     'number': '39-44-5323523'
//   },
//   {
//     'id': 3,
//     'name': 'Dan Abramov',
//     'number': '12-43-234345'
//   },
//   {
//     'id': 4,
//     'name': 'Mary Poppendieck',
//     'number': '39-23-6423122'
//   }
// ]

// const generateId = () => {
//   const maxId = persons.length > 0
//     ? Math.max(...persons.map(person => person.id))
//     : 0
//   return maxId + 1
// }

app.get('/info', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.send(`<p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>`)
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person)
        response.json(person)
      else
        response.status(404).end()
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', async(request, response, next) => {

  const { name, number } = request.body
  if(!name || !number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const existingPerson = await Person.findOne({ name })
  if(existingPerson)
    return response.status(400).json({
      error: 'name must be unique'
    })

  const person = new Person({
    name,
    number
  })

  person.save()
    .then(() => {
      response.json(person)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  const person = { name, number }
  Person.findByIdAndUpdate(
    request.params.id,
    person,
    { new: true, runValidators: true, context: 'query' })
    .then(updatedperson => {
      response.json(updatedperson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if(error.name === 'CastError')
    return response.status(400).send({ error: 'malformatted id' })
  else if (error.name === 'ValidationError')
    return response.status(400).json({ error: error.message })

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`)
})