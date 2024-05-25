const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log(token);
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.173efa4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Collections
    const roomsCollection = client.db("stayVista").collection("rooms");
    const usersCollection = client.db("stayVista").collection("users");

    // auth related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // Logout
    app.get("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
        console.log("Logout successful");
      } catch (err) {
        res.status(500).send(err);
      }
    });

    // Save user data in db
    app.put("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user?.email };

      // check if user already exist
      const isExist = await usersCollection.findOne(query);
      if (isExist) {
        if (user.status === "Requested") {
          // if existing user try to change his role
          const result = usersCollection.updateOne(query, {
            $set: { status: "Requested" },
          });
          res.send(result);
        } else {
          // if existing user login again
          return res.send(isExist);
        }
      }

      // Save user for the first time
      const options = { upsert: true };
      const updateDoc = {
        $set: { ...user, timestamp: Date.now() },
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    // Get all users data from db
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Get single user info from db
    app.get('/users/:email', async(req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({email});
      res.send(result);
    })

    // Update user role
    app.patch('/users/update/:email', async(req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = {email}
      const updateDoc = {
        $set: {
          ...user,
          timestamp: Date.now()
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })
    
    // -------------- Services related API --------------------

    // Get all rooms data from db
    app.get("/rooms", async (req, res) => {
      const category = req.query.category;
      console.log(category);
      let query = {};
      if (category && category !== "null") {
        query = { category };
      }
      const result = await roomsCollection.find(query).toArray();
      res.send(result);
    });

    // Get single room data from db using _id
    app.get("/room/:id", async (req, res) => {
      const id = req.params.id;
      const room = await roomsCollection.findOne({ _id: new ObjectId(id) });
      res.send(room);
    });

    app.delete("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const result = await roomsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Save a room data in db
    app.post("/rooms", async (req, res) => {
      const roomData = req.body;
      const result = await roomsCollection.insertOne(roomData);
      res.send(result);
    });

    // Get all rooms from db for host
    app.get("/my-listings/:email", async (req, res) => {
      const email = req.params.email;
      let query = { "host.email": email };
      const result = await roomsCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from StayVista Server..");
});

app.listen(port, () => {
  console.log(`StayVista is running on port ${port}`);
});
