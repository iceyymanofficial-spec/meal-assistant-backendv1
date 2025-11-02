// server.js
import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("Loaded MONGO_URI =", process.env.MONGO_URI);

const mongoUri =
  process.env.MONGO_URI ||
  "mongodb+srv://Admin:admin@cluster0.vjgflvz.mongodb.net/MealAssistantDB?retryWrites=true&w=majority";

const client = new MongoClient(mongoUri, { useUnifiedTopology: true });

async function start() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("MealAssistantDB");
    const pantry = db.collection("PantryItems");

    // --- ROUTES ---
    app.get("/api/pantry", async (req, res) => {
      try {
        const items = await pantry.find({}).toArray();
        res.json(items);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch pantry" });
      }
    });

    app.post("/api/pantry", async (req, res) => {
      try {
        const item = req.body; // expect { name, quantity, unit }
        const r = await pantry.insertOne(item);
        res.json({ insertedId: r.insertedId });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to insert item" });
      }
    });

    // ✅ Test route
    app.get("/api/test", async (req, res) => {
      try {
        const collection = db.collection("meals");
        const allMeals = await collection.find({}).toArray();
        res.json(allMeals);
      } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching meals");
      }
    });

    app.get("/api/price-compare", async (req, res) => {
      const item = req.query.item || "";
      res.json({
        item,
        offers: [
          { store: "Checkers", price: 24.99 },
          { store: "PicknPay", price: 25.49 },
        ],
      });
    });

    // --- START SERVER ---
    const port = process.env.PORT || 4000;
    app.listen(port, () =>
      console.log(`🚀 Server ready at http://localhost:${port}`)
    );
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
