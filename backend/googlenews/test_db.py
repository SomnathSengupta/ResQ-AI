from pymongo import MongoClient


client = MongoClient("mongodb+srv://disaster_user:1234Arashikage@cluster0.zkggmy5.mongodb.net/?appName=Cluster0")

print(client.list_database_names())