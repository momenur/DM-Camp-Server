const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;


//  middleWire
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vrpqnh1.mongodb.net/?retryWrites=true&w=majority`;

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
    const classesCollection = client.db("summerDanceDB").collection("classes");
    const instructorsCollection = client.db("summerDanceDB").collection("instructors");
    const selectedClassCollection = client.db("summerDanceDB").collection("selectedClass");
    const usersClassCollection = client.db("summerDanceDB").collection("users");


    app.get('/classes', async(req, res) => {
        const result = await classesCollection.find().toArray();
        res.send(result);
    })
    app.get('/instructors', async(req, res) => {
        const result = await instructorsCollection.find().toArray();
        res.send(result);
    })


    // Selected Class POST and GET

    app.get('/selected', async(req, res) => {
      const email = req.query.email;
      if(!email){
        res.send([]);
      }
      const query = {email: email}
      const result = await selectedClassCollection.find(query).toArray();
      res.send(result);
    })


    app.post('/selected', async(req, res) => {
      const item = req.body;
      const result = await selectedClassCollection.insertOne(item);
      res.send(result);
    })

    app.delete('/selected/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await selectedClassCollection.deleteOne(query);
      res.send(result)
    })

    // User API
    app.get('/users', async(req, res) => {
      const result = await usersClassCollection.find().toArray();
      res.send(result);
    })

    app.post('/users', async(req, res) => {
      const user = req.body;
      const query = {email: user.email}
      const existingUser = await usersClassCollection.findOne(query);
      if(existingUser){
        return res.send({message: 'All Ready Stay User'})
      }
      const result = await usersClassCollection.insertOne(user);
      res.send(result)
    })

    // Admin API Make 
    // app.get('/adminUsers/:email', async (req, res) => {
    //   const email = req.params.email;
    //   const query = {email: email}
    //   const user = await usersClassCollection.findOne(query)
    //   const result ={ admin: user?.role === 'admin'}
    //   res.send(result)
    // })

    app.patch('/users/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          role: 'admin'
        },

      };
      const result = await usersClassCollection.updateOne(filter, updateDoc);
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
    res.send('Summer Dance Camp Is Running')
})

app.listen(port, () => {
    console.log(`Summer Dance is running on PORT ${port}`);
})