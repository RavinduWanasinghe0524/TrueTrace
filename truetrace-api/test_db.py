"""
Run this script to verify your MongoDB Atlas connection is working.
Usage:
    .\venv\Scripts\python test_db.py
"""
import asyncio
import os
from urllib.parse import quote_plus
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")


def encode_mongo_uri(uri: str) -> str:
    """
    Safely encodes username and password in a MongoDB URI,
    correctly handling passwords that contain @ symbols.
    Uses rfind('@') to locate the real credential/host boundary.
    """
    if "://" not in uri:
        return uri

    protocol, rest = uri.split("://", 1)

    # The LAST '@' separates credentials from the host
    at_index = rest.rfind("@")
    if at_index == -1:
        return uri  # no credentials in URI

    credentials = rest[:at_index]        # "username:raw_password"
    host_part   = rest[at_index:]        # "@host/db?params"

    # Split credentials on the FIRST ':'
    colon_index = credentials.find(":")
    if colon_index == -1:
        return uri  # no password found

    username = credentials[:colon_index]
    password = credentials[colon_index + 1:]

    enc_user = quote_plus(username)
    enc_pass = quote_plus(password)

    if enc_pass != password:
        print("[info] Password has special characters — auto-encoded for RFC 3986.")

    return f"{protocol}://{enc_user}:{enc_pass}{host_part}"


async def test():
    if not MONGODB_URI or "<db_password>" in MONGODB_URI or "<password>" in MONGODB_URI:
        print("ERROR: Set your real MONGODB_URI in .env first!")
        print("  Open .env and replace <db_password> with your actual Atlas password")
        return

    uri = encode_mongo_uri(MONGODB_URI)

    print("Connecting to MongoDB Atlas...")
    client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=10000)

    try:
        await client.admin.command("ping")
        print("SUCCESS: Connected to MongoDB Atlas! ✅")

        db = client["truetrace"]
        collections = await db.list_collection_names()
        print(f"Existing collections: {collections or '(none yet)'}")

        result = await db["analyses"].insert_one({"_test": True})
        print(f"Test document inserted: {result.inserted_id}")
        await db["analyses"].delete_one({"_test": True})
        print("Test document removed. Database is ready! ✅")

    except Exception as e:
        print(f"\nFAILED: {e}")
        print("\nTroubleshooting:")
        print("  1. Check password is correct in .env (no <db_password> placeholder)")
        print("  2. Ensure 0.0.0.0/0 is Active in Atlas → Network Access")
        print("  3. Check Atlas → Database Access that user exists")
    finally:
        client.close()


asyncio.run(test())
