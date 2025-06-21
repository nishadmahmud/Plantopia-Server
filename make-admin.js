const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ph-cluster.8kwdmtt.mongodb.net/?retryWrites=true&w=majority&appName=PH-Cluster`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function makeAdmin(email) {
  try {
    await client.connect();
    const database = client.db("plantopia");
    const users = database.collection("users");

    const result = await users.updateOne(
      { email: email },
      { $set: { role: 'admin', updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      console.log('❌ User not found with email:', email);
    } else if (result.modifiedCount > 0) {
      console.log('✅ Successfully made admin:', email);
    } else {
      console.log('ℹ️ User is already an admin:', email);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node make-admin.js <email>');
  console.log('Example: node make-admin.js your-email@example.com');
  process.exit(1);
}

makeAdmin(email); 