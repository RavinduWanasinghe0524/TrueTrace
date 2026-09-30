"""
Run this script to verify your MongoDB Atlas connection is working.

Usage:
    .\\venv\\Scripts\\python test_db.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")

async def test():
    if not MONGODB_URI or "<password>" in MONGODB_URI:
        print("ERROR: Set your real MONGODB_URI in .env first!")
        return

    print(f"Connecting to MongoDB Atlas...")
    client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=5000)

    try:
        # Ping the deployment
        await client.admin.command("ping")
        print("SUCCESS: Connected to MongoDB Atlas!")

        # Create test collections
        db = client["truetrace"]
        collections = await db.list_collection_names()
        print(f"Existing collections: {collections or '(none yet)'}")

        # Insert a test document
        result = await db["analyses"].insert_one({"_test": True})
        print(f"Test document inserted: {result.inserted_id}")

        # Clean it up
        await db["analyses"].delete_one({"_test": True})
        print("Test document removed. Database is ready!")

    except Exception as e:
        print(f"FAILED: {e}")
        print("\nTroubleshooting:")
        print("  1. Check your MONGODB_URI in .env")
        print("  2. Ensure 0.0.0.0/0 is whitelisted in Atlas Network Access")
        print("  3. Verify your username/password are correct")
    finally:
        client.close()

asyncio.run(test())
