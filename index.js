const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8qysmqo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const jobCollection = client.db('jobList').collection('category');
    const bidCollection = client.db('jobList').collection('bidList')


    app.post('/category',async(req,res)=>{
      const newJob= req.body;
      const result = await jobCollection.insertOne(newJob);
      res.send(result);
    })

    app.get('/category', async (req, res) => {
      const cursor = jobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.delete('/category/:id',async(req,res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/category/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const options = {
        projection: { minPrice: 1, maxPrice: 1, deadline: 1,title: 1,shortDescription: 1, email: 1 },
      };
      const result = await jobCollection.findOne(query,options);
      res.send(result);
    })

    app.post('/bidList',async(req,res)=>{
      const newBid= req.body;
      const result = await bidCollection.insertOne(newBid);
      res.send(result);
    })

    app.get('/bidList', async (req, res) => {
      const cursor = bidCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})