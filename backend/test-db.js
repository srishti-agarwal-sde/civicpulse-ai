const mongoose = require('mongoose');

// Paste the connection string here to test it locally
const testUri = "mongodb+srv://srishti094:MyPassword@civicpulseaicluster.zjv5pry.mongodb.net/civicpulse?appName=CivicPulseAICluster&retryWrites=true&w=majority";

console.log("Testing database connection to MongoDB Atlas...");
console.log(`URI: ${testUri.replace(/:([^:@]+)@/, ':****@')}`);

mongoose.connect(testUri, { 
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000 
})
  .then(() => {
    console.log("SUCCESS: Successfully connected to MongoDB Atlas!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FAILURE: Connection failed!");
    console.error(err.message);
    process.exit(1);
  });
