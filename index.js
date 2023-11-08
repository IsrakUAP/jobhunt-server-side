const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());




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


    app.post('/jwt',async(req,res) =>{
        const user = req.body;
        console.log(user);
        const token = jwt.sign(user , process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
        res
        .cookie('token', token, {
          httpOnly: true,
          secure: false,
        })
        .send({success: true});
    })


    app.post('/category', async (req, res) => {
      const newJob = req.body;
      const result = await jobCollection.insertOne(newJob);
      res.send(result);
    })

    app.get('/category', async (req, res) => {
      const cursor = jobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/category/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await jobCollection.findOne(query);
      res.send(result);
    })

    app.put('/category/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateJob = req.body;
      const job = {
        $set: {
          email: updateJob.email,
          title: updateJob.title,
          deadline: updateJob.deadline,
          shortDescription: updateJob.shortDescription,
          category: updateJob.category,
          minPrice: updateJob.minPrice,
          maxPrice: updateJob.maxPrice
        }
      }
      const result = await jobCollection.updateOne(filter,job,options);
      res.send(result);
    })

    app.delete('/category/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/category/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const options = {
        projection: { minPrice: 1, maxPrice: 1, deadline: 1, title: 1, shortDescription: 1, email: 1 },
      };
      const result = await jobCollection.findOne(query, options);
      res.send(result);
    })

    app.post('/bidList', async (req, res) => {
      const newBid = req.body;
      const result = await bidCollection.insertOne(newBid);
      res.send(result);
    })

    app.get('/bidList', async (req, res) => {
      const cursor = bidCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.put('/bidList/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateStatus = req.body;
      const update = {
        $set: {
          status: updateStatus.status
        }     
      }
      const result = await bidCollection.updateOne(filter,update,options);
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