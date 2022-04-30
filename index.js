const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
//MiddleWare
app.use(cors());
app.use(express.json());

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
    /// Load all Products from Db
    app.get("/items", async (req, res) => {
      const query = {};
      const cursor = itemsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
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
