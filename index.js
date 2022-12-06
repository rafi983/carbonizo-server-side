const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const app = express();

require("dotenv").config();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://carbozonic:b8EOS4bXItzcI0qI@cluster0.6kyz8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("car_DB");
    const carsCollection = database.collection("cars");
    const reviewsCollection = client.db("reviews_DB").collection("reviews");
    const ordersCollection = client.db("myorder_DB").collection("orderedcars");
    const usersCollection = client.db("users").collection("users");

    app.get("/cars", async (req, res) => {
      const cursor = carsCollection.find({});
      const cars = await cursor.limit(6).toArray();
      res.send(cars);
    });

    app.get("/allcars", async (req, res) => {
      const cursor = carsCollection.find({});
      const cars = await cursor.toArray();
      res.send(cars);
    });

    app.get("/allcars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const car = await carsCollection.findOne(query);
      res.send(car);
    });

    app.post("/allcars", async (req, res) => {
      const newlyAddedCar = req.body;
      const result = await carsCollection.insertOne(newlyAddedCar);
      res.json(result);
    });

    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.post("/reviews", async (req, res) => {
      const addedReview = req.body;
      const result = await reviewsCollection.insertOne(addedReview);
      res.json(result);
    });

    app.post("/myorders", async (req, res) => {
      const addedOrder = req.body;
      const result = await ordersCollection.insertOne(addedOrder);
      res.json(result);
    });

    app.get("/myorders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orderedcar = await cursor.toArray();
      res.send(orderedcar);
    });

    app.get("/myorders/:email", async (req, res) => {
      const queryEmail = req.params.email;
      const query = { email: queryEmail };
      const placedOrder = await ordersCollection.find(query).toArray();
      res.send(placedOrder);
    });

    app.delete("/myorders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deletedOrder = await ordersCollection.deleteOne(query);
      res.json(deletedOrder);
    });

    app.get("/allorders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orderedcar = await cursor.toArray();
      res.send(orderedcar);
    });

    app.put("/allorders/:id", async (req, res) => {
      const id = req.params.id;
      let prevStatus = req.body;
      const updStatus = "shipped";
      prevStatus.status = updStatus;

      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const updateStatus = {
        $set: {
          status: prevStatus.status,
        },
      };

      const result = await ordersCollection.updateOne(
        filter,
        updateStatus,
        options
      );
      res.json(result);
    });

    app.delete("/allorders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deletedOrder = await ordersCollection.deleteOne(query);
      res.json(deletedOrder);
    });

    app.delete("/allcars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deletedOrder = await carsCollection.deleteOne(query);
      res.json(deletedOrder);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("car server running");
});

app.listen(port, () => {
  console.log(` Listening to car server ${port}`);
});
