// config__
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

// middleware__
require("dotenv").config();
app.use(
  cors({
    origin: [
      // "http://localhost:5173",
      "https://doc-house-f6840.web.app",
      "https://doc-house-f6840.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());

// mongoDB using__

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hyp2y7c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    // collections_

    const db = client.db("DocHouseDB");
    const doctorsCollection = db.collection("Doctors");
    const reviewCollection = db.collection("Reviews");
    const usersCollection = db.collection("Users");

    // apis_

    app.put("/user", async (req, res) => {
      const user = req.body;
      const query = { email: user?.email };

      const isExist = await usersCollection.findOne(query);

      if (isExist) {
        if (user.status === "Requested") {
          const currentResult = await usersCollection.updateOne(query, {
            $set: { status: user?.status },
          });
          return res.send(currentResult);
        } else {
          return res.send(isExist);
        }
      }

      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...user,
          timestamp: Date.now(),
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const query = req.params.email;
      const result = await usersCollection.findOne({ query });
      res.send(result);
    });

    app.get("/doctors", async (req, res) => {
      const result = await doctorsCollection.find().toArray();
      res.send(result);
    });

    app.get("/doctors/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await doctorsCollection.findOne(query);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// port running here__
app.get("/", (req, res) => {
  res.send(`Doc House Port Is Working Well`);
});

app.listen(port, () => {
  console.log(`This is Running On Port: ${port}`);
});
