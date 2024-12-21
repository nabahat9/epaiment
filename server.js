const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");

app.use(express.json());

const users = [];

// get all users
app.get("/users", (req, res) => {
  res.json(users);
});

// post a new user
app.post("/users", async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.email || !req.body.name || !req.body.password) {
      return res.status(400).send("Missing required fields");
    }

    // Check if the user with the same email already exists
    const existingUser = users.find((user) => user.email === req.body.email);
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create the user and store it
    const user = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    };
    users.push(user);

    // Respond with 201 (Created) status code
    res.status(201).send();
  } catch (error) {
    res.status(500).send("Error creating user");
  }
});

// login to an existing user
app.post("/users/login", async (req, res) => {
  // Validate that the email and password are provided
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Missing required fields");
  }

  const user = users.find((user) => user.email === req.body.email);
  if (user == null) {
    return res.status(400).send("Cannot find user");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.send("Login successful");
    } else {
      res.send("Incorrect password");
    }
  } catch {
    res.status(500).send("Error during login");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
