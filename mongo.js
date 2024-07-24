const mongoose = require('mongoose')

if(process.argv.length<3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://project0:${password}@cluster0.yg02dwj.mongodb.net/personApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

mongoose.connect(url)
  .then(() => {
    if(process.argv[3] && process.argv[4]) {
      const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
      })

      person.save().then(() => {
        console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
        mongoose.connection.close()
      })
    }
    else {
      Person.find({}).then(persons => {
        console.log('phonebook:')
        persons.forEach(({ name, number }) => {
          console.log(`${name} ${number}`)
        })
        mongoose.connection.close()
      })
    }
  })
  .catch((err) => console.log(err))



