const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { decode } = require("jsonwebtoken");
const port = process.env.PORT || 5000;
//MiddleWare
app.use(cors());
app.use(express.json());
// Verify JWT
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized Access!" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.MY_SECRET_KEY, (error, decoded) => {
    if (error) {
      return res.status(403).send({ message: "Forbidden Access!" });
    }
    console.log("Decoded", decoded);
    req.decoded = decoded;
  });

  next();
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mxlhj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//Connect with The  server site
const run = async () => {
  try {
    await client.connect();
    console.log("site is Connected");
    const itemsCollection = client.db("gadget-world").collection("items");
    const reviewCollection = client.db("gadget-world").collection("reviews");
    /// Load all Products from Db
    app.get("/items", async (req, res) => {
      const query = {};
      const cursor = itemsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    /// Load all Reviews from Db
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    //Load a Specific Product Detail
    app.get("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const item = await itemsCollection.findOne(query);
      res.send(item);
    });
    //Update Specific Product
    app.put("/items/:id", async (req, res) => {
      const id = req.params.id;
      const updateProduct = req.body;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      console.log(updateProduct.Quantity);
      const updateDoc = {
        $set: {
          quantity: updateProduct.Quantity,
          sale: updateProduct.Sale,
        },
      };
      const result = await itemsCollection.updateOne(filter, updateDoc, option);
      res.send(result);
    });
    //Add a Item
    app.post("/items", async (req, res) => {
      const newItem = req.body;
      console.log(newItem);
      const result = await itemsCollection.insertOne(newItem);
      res.send(result);
    });
    //Delete a Specific Product item
    app.delete("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemsCollection.deleteOne(query);
      res.send(result);
    });

    //Get my Items
    app.get("/myitem", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.user;
      if (email === decodedEmail) {
        const query = { user: email };
        const cursor = itemsCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
      } else {
        res.status(403).send({ message: "Forbidden Access!" });
      }
    });

    //Get JWT
    app.post("/login", (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.MY_SECRET_KEY, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });
  } catch (error) {}
};
run();
app.get("/", (req, res) => {
  res.send("Hello World! This is from the Server Site of Gadget World");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
