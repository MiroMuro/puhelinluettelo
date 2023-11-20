const express = require("express");
var morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(express.json());
morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :res[content-length] :body - :response-time ms")
);
app.use(cors());

const checkNameDuplicates = (name) => {
  if (persons.map((p) => p.name).includes(name)) {
    console.log("nimi on jo olemassa");
    return false;
  } else {
    console.log("Puhenluettelossa ei ole tätä nimeä");
    return true;
  }
};

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  { id: 2, name: "Ada Lovelace", number: "39 - 44 - 5323523" },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12 - 43 - 234345",
  },
  { id: 4, name: "Mary Poppendick", number: "39-23-642122" },
];

app.get("/api/persons", (req, res) => {
  res.json(persons);
  res.end();
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((p) => p.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.get("/api/info", (req, res) => {
  res.send(
    `<p>Phonebook has info for ${persons.length} people <br><br> ${Date()}</p>`
  );
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((p) => p.id !== id);

  res.status("204").end();
});

app.post("/api/persons", (req, res) => {
  const body = req.body;
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "No name or number",
    });
  } else if (!checkNameDuplicates(body.name)) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }
  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 1000000),
  };
  persons = persons.concat(person);
  res.json(person);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
