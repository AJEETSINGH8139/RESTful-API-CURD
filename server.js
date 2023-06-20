const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 3000;

// MongoDB connection URL and database name
const url = 'mongodb://0.0.0.0:27017';
const dbName = 'RESTfulAPI';
const collectionName = 'items';

// Middleware to parse JSON request body
app.use(express.json());

// MongoDB connection
let db;

MongoClient.connect(url, (err, client) => {
  if (err) {
    console.error(err);
    process.exit(1); // Exit the application on connection error
  }
  console.log('Connected to MongoDB');
  db = client.db(dbName); // Set the database object
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Retrieve all items
app.get('/api/items', (req, res, next) => {
  const collection = db.collection(collectionName);
  collection.find().toArray((err, items) => {
    if (err) {
      return next(err);
    }
    res.json(items);
  });
});

// Retrieve a specific item by ID
app.get('/api/items/:id', (req, res, next) => {
  const itemId = req.params.id;
  const collection = db.collection(collectionName);
  collection.findOne({ _id: new ObjectId(itemId) }, (err, item) => {
    if (err) {
      return next(err);
    }
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  });
});

// Create a new item
app.post('/api/items', (req, res, next) => {
  const newItem = req.body;
  const collection = db.collection(collectionName);
  collection.insertOne(newItem, (err, result) => {
    if (err) {
      return next(err);
    }
    res.status(201).json(result.ops[0]);
  });
});

// Update an item by ID
app.put('/api/items/:id', (req, res, next) => {
  const itemId = req.params.id;
  const updatedItem = req.body;
  const collection = db.collection(collectionName);
  collection.updateOne(
    { _id: new ObjectId(itemId) },
    { $set: updatedItem },
    (err, result) => {
      if (err) {
        return next(err);
      }
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.json({ message: 'Item updated' });
    }
  );
});

// Delete an item by ID
app.delete('/api/items/:id', (req, res, next) => {
  const itemId = req.params.id;
  const collection = db.collection(collectionName);
  collection.deleteOne({ _id: new ObjectId(itemId) }, (err, result) => {
    if (err) {
      return next(err);
    }
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
