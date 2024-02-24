const express = require("express");
const cors = require("cors");
var bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const registerSchema = require("./validationSchema");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { dotenv } = require("dotenv").config();
const PORT = "4000";

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
});
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Country = mongoose.connection.collection("country");
const State = mongoose.connection.collection("state");
const City = mongoose.connection.collection("city");
const Users = mongoose.connection.collection("users");

mongoose
  .connect(
    ""
  )
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.get("/country", async (_, res) => {
  try {
    const countries = await Country.find({}).toArray(); // Fetch all documents from the "country" collection
    res.json(countries); // Send the countries as a JSON response
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/state/:countryId", async (req, res) => {
  const { countryId } = req.params;
  try {
    const allStates = await State.find({}).toArray(); // Fetch all documents from the "country" collection
    const filteredStates = allStates.filter((state) => {
      return state.countryId.toString() === countryId;
    });
    res.json(filteredStates); // Send the countries as a JSON response
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/state", async (_, res) => {
  try {
    const states = await State.find({}).toArray(); // Fetch all documents from the "country" collection
    res.json(states); // Send the countries as a JSON response
  } catch (error) {
    console.error("Error fetching state:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/city/:stateId", async (req, res) => {
  const { stateId } = req.params;
  try {
    const allCity = await City.find({}).toArray();
    const filteredCity = allCity.filter((city) => {
      return city.stateId.toString() === stateId;
    });
    res.json(filteredCity);
  } catch (error) {
    console.error("Error fetching city:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/city", async (_, res) => {
  try {
    const city = await City.find({}).toArray(); // Fetch all documents from the "country" collection
    res.json(city); // Send the countries as a JSON response
  } catch (error) {
    console.error("Error fetching city:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    address,
    city,
    country,
    state,
    password,
  } = req.body;
  registerSchema
    .validate(req.body, { abortEarly: false })
    .then(async () => {
      const hashedPassword = bcrypt.hashSync(password, 10);
      console.log(Users, "Users");
      const isExistingUser = await Users.find({ email }).toArray();
      console.log(isExistingUser, "isExistingUser");
      if (isExistingUser.length > 0) {
        res.status(400).json({ message: "User already exists" });
      } else {
        await Users.insertOne({
          firstName,
          lastName,
          email,
          phoneNumber,
          address,
          city,
          country,
          state,
          password: hashedPassword,
        });
        res.status(200).json({ message: "User created successfully" });
      }
    })
    .catch((error) => {
      const errors = error.inner.reduce((acc, curr) => {
        acc[curr.path] = curr.message;
        return acc;
      }, {});
      res.status(400).json({ errors });
    });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.find({ email }).toArray();
    if (user.length > 0) {
      const isPasswordCorrect = bcrypt.compareSync(password, user[0].password);
      if (isPasswordCorrect) {
        res.status(200).json({ message: "Login successful" });
      } else {
        res.status(400).json({ message: "Invalid credentials" });
      }
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/product/:categoryName", async (req, res) => {
  const { categoryName } = req.params;
  try {
  } catch (error) {}
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
