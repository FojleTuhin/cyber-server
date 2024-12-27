const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion } = require("mongodb");

app.use(express.json());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z7hla77.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {

    const usersCollection = client.db('Cyber').collection('users');
    const dataCollection = client.db('Cyber').collection('data');

    // save user in database
    app.post("/user", async (req, res) => {
      const { name, email, number, pin } = req.body;
      console.log(pin);

      const query = { number: number };
      const isExistingUser = await usersCollection.findOne(query);

      if (isExistingUser) {
        return res.send({
          message: "user already exists",
          insertedId: null,
        });
      }

      const user = {
        name,
        email,
        pin,
        number,
      };
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });



    // check  password with hash password from database
    app.post("/login", async (req, res) => {
      const { number, pin } = req.body;
      console.log(pin);
      const query = { number: number };

      try {
        console.log("Received login request:", req.body);

        const result = await usersCollection.findOne(query);
        if (!result) {
          console.log("User not found for number:", number);
          return res.status(400).json({ message: "User not found" });
        }

        console.log("User found:", result);

        const isMatch = (pin === result.pin);
        if (isMatch) {
          console.log("Password match for user:", number);

          res.status(200).json({ message: "Login successful" });
        } else {
          console.log("Invalid password for user:", number);
          res.status(400).json({ message: "Invalid password" });
        }
      } catch (err) {
        console.log("Error during login:", err);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/addData", async (req, res) => {
      const { text } = req.body;
      console.log(text);
      const data= {
        text
      };
      const result = await dataCollection.insertOne(data);
      res.send(result);
    });

    app.get("/getData", async (req, res) => {
      const result = await dataCollection.find().toArray();
      res.send(result);
    }); 

    await client.connect();

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Cyber security project");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
