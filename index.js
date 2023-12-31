const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  // origin: '*',
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://hotel-boo-c51b7.web.app'
  ],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bajp1jm.mongodb.net/?retryWrites=true&w=majority`;

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

    const roomCollection = client.db('hotelBooking').collection('rooms');
    const bookingCollection = client.db('hotelBooking').collection('bookings')

    // rooms api created
    app.get('/rooms', async(req, res) => {
        const cursor = roomCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    // single room api created
    app.get('/rooms/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomCollection.findOne(query);
      res.send(result)
    })


    //booking collection for specific user
    app.get('/bookings', async(req, res) => {
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result)
    }) 



    // booking collection api created
    app.post('/bookings', async(req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result)
    })


    // delete api created
    app.delete('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result)
    })


    // update booking api created
    app.put('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true }
      const bookings = req.body;
      const updatedBooking = {
        $set: {
          check_in: bookings.check_in,
          check_out: bookings.check_out
        }
      }
      const result = await bookingCollection.updateOne(filter, updatedBooking, options);
      res.send(result)
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
    res.send('hotel is running')
})

app.listen(port, () => {
    console.log(`Hotel Booking Server is running on port ${port}`);
})