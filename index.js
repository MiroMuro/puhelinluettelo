require("dotenv").config();
const express = require("express");
var morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
const app = express();
app.use(express.json());
morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :res[content-length] :body - :response-time ms")
);
app.use(cors());
app.use(express.static("dist"));

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    console.log(`persons ${persons.length}`);
    res.json(persons);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.get("/api/info", (req, res) => {
  Person.find({}).then((persons) => {
    console.log(`persons ${persons.length}`);
    res.send(
      `<p>Phonebook has info for ${
        persons.length
      } people <br><br> ${Date()}</p>`
    );
  });
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      console.log(
        `Deleted person ${result.name}, with a phone number of ${result.number} from the phonebook`
      );
      res.status(200).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  const person = new Person({
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 1000000),
  });
  person
    .save()
    .then((savedPerson) => {
      console.log(
        `Person called ${savedPerson.name} with a phone number of ${savedPerson.number} added to the phonebook`
      );
      res.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, { returnDocument: "after" })
    .then((updatedperson) => {
      res.json(updatedperson);
      console.log("Käyttäjän päivitys", updatedperson);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(`***ERROR***, ${error.message}`);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "MissingContactInfo") {
    return response.status(400).send({ error: "Missing number or name" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }
  next(error);
};
app.use(errorHandler);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
