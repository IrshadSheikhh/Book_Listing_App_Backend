const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const User = require('./models/User');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://irshads:irshad@cluster0.npl8qn0.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
  name: { type: String,
    
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  isbn: { type: String, required: true },
  description: { type: String, required: true },
  publishDate: { type: String, required: true },
  publisher: { type: String, required: true },
});

const Book = mongoose.model("Book", bookSchema);


app.use(bodyParser.json());
app.use(cors());

app.get("/api/test", (req,res) => {
  res.send("test");
})

app.post("/api/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send({ message: "Email not found" });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send({ message: "Invalid password" });

  const token = jwt.sign({ _id: user._id }, "secret_key");
res.send({ token });
});

app.post("/api/register", async (req, res) => {
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(req.body.password, salt);

const user = new User({
name: req.body.name,
email: req.body.email,
password: hashedPassword,
});

try {
await user.save();
res.send({ message: "User created successfully" });
} catch (err) {
if (err.code === 11000) {
return res.status(400).send({ message: "Email already exists" });
}
res.status(500).send({ message: "Server error" });
}
});

app.post('/api/books', async (req, res) => {
  //console.log(req);
  //console.log(res)
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    genre: req.body.genre,
    isbn: req.body.isbn,
    description: req.body.description,
    publishDate: req.body.publishDate,
    publisher: req.body.publisher
    //id: uuidv4() // add a new field for ID and generate a unique ID using uuidv4()
  });
  try {
    await book.save();
    res.send({ message: "book created successfully" });
    } catch (err) {
      console.log(err);
    if (err.code === 11000) {
    return res.status(400).send({ message: "Email already exists" });
    }
    res.status(500).send({ message: "Server error" });
    }
  // book.save((err) => {
  //   console.log('ooked Block')
  //   if (err) {
  //     console.log(err);
  //     res.sendStatus(500);
  //   } else {
  //     console.log('Book added successfully');
  //     res.sendStatus(200);
  //   }
  // });
});

app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/:bookId", async (req, res) => {
  const { title, author, genre, isbn, description, publishDate, publisher } = req.body;

  try {
    const book = new Book({
      title,
      author,
      genre,
      isbn,
      description,
      publishDate,
      publisher
      //id: uuidv4() // add a new field for ID and generate a unique ID using uuidv4()
    });
    await book.save();
    res.send({ message: "Book created successfully" });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).send({ message: "Email already exists" });
    }
    res.status(500).send({ message: "Server error" });
  }
});

app.get("/api/:bookId", async (req, res) => {
  const { bookId } = req.params;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).send({ message: "Book not found" });
    }
    res.send(book);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server error" });
  }
});

app.delete('/api/books/:bookId', async (req, res) => {
  try {
    const bookId = req.params.id;
    // Find the book in the database by its ID
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    // Delete the book from the database
    await Book.findByIdAndDelete(bookId);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});





app.listen(port, () => {
console.log(`Server started on port ${port}`);
});

// app.post('/api/register', async (req, res) => {
//   const { email, password } = req.body;

//   const userExists = await User.findOne({ email });

//   if (userExists) {
//     return res.status(400).json({ message: 'User already exists' });
//   }

//   const salt = await bcrypt.genSalt();
//   const hashedPassword = await bcrypt.hash(password, salt);

//   const user = new User({
//     email,
//     password: hashedPassword,
//   });

//   try {
//     await user.save();
//     res.status(201).json({ message: 'User created' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.post('/api/login', async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });

//   if (!user) {
//     return res.status(400).json({ message: 'User not found' });
//   }

//   const isPasswordCorrect = await bcrypt.compare(password, user.password);

//   if (!isPasswordCorrect) {
//     return res.status(400).json({ message: 'Invalid credentials' });
//   }

//   const token = jwt.sign({ email: user.email }, 'secret');

//   res.json({ token });
// });

// const port = process.env.PORT || 5000;

// app.listen(port, () => {
//   console.log(`Server started on port ${port}`);
// });
