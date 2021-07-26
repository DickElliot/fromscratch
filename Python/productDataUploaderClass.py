import csv
import os
import os.path
from databaseClass import database
import json
from coordinatesSpider import getCoordinates


class dataUploader(object):
    def __init__(self, relativeFilePath):
        self.productsDB = database("products")
        existing = self.productsDB.getTables()
        existing = [item for it in existing for item in it]
        print("Existing tables:")
        print(existing)
        for root, dirs, files in os.walk(f"{relativeFilePath}"):
            for file in files:
                supermarketName = file.removesuffix('.csv')
                supermarketTableName = supermarketName.lower().replace(' ', '_')
                print(f"Considering upload of {supermarketTableName} now")
                with open(os.path.join(root, file)) as CSVFile:
                    dictReader = csv.DictReader(CSVFile)
                    structuredData = [row for row in dictReader]
                    headers = dictReader.fieldnames
                    # If supermarket isn't uploaded
                    if (supermarketTableName not in existing):
                        print(f"{supermarketTableName} not in existing tables")
                        filePath = os.path.join(root, file)
                        self.productsDB.createTableFromCSV(
                            filePath, supermarketTableName)
                        self.productsDB.uploadDict(
                            structuredData, supermarketTableName)
                        self.uploadSupermarketDetails(supermarketTableName)
                    else:
                        details = self.productsDB.getColumnHeaders(
                            supermarketTableName)
                        details = [first[0] for first in details]
                        if "id" in details:
                            ids = self.productsDB.readTable(
                                supermarketTableName, "id")
                        elif "product_id" in details:
                            ids = self.productsDB.readTable(
                                supermarketTableName, "product_id")
                        sizeOfExistingTable = len(ids)
                        sizeOfNewTable = len(structuredData)
                        if (sizeOfExistingTable != sizeOfNewTable):
                            print(
                                f"Replacing {supermarketTableName}, has size of {sizeOfExistingTable} with data size of {sizeOfNewTable}")
                            self.productsDB.deleteTable(supermarketTableName)
                            filePath = os.path.join(root, file)
                            self.productsDB.createTableFromCSV(
                                filePath, supermarketTableName)
                            self.uploadSupermarketDetails(supermarketTableName)

    # Make sure the name is correct
    def uploadTable(self, dictData, tableName):
        headers = dictData[0].keys()
        self.productsDB.createTable(tableName, headers)
        self.productsDB.uploadDict(
            dictData, tableName)

    def uploadMissingSupermarketDetails(self):
        # def parseName(supermarket): return supermarket.replace(
        # "_", " ").title()
        existing = self.productsDB.getTables()
        existing = [first[0] for first in existing]
        print(f"Missing from {existing}")
        for supermarket in existing:
            self.uploadSupermarketDetails(self.parse(supermarket))

    # Uploads address, name & longitude/latitude
    # Make sure the name being checked is in the right format e.g. 'countdown_newtown'
    # not 'Countdown Newtown'
    def uploadSupermarketDetails(self, supermarket):
        supermarkets = self.productsDB.readTable("supermarket_details", "name")
        supermarkets = [self.parse(first[0]) for first in supermarkets]
        if supermarket not in supermarkets:
            with open("supermarketslist.json") as supermarketlist:
                data = json.load(supermarketlist)
                for s in data:
                    dataName = self.parse(s["name"])
                    if(dataName == supermarket):
                        coordinates = getCoordinates(s["name"].strip())
                        s.update(coordinates)
                        s["name"] = s["name"].strip()
                        s.pop("id", None)
                        self.productsDB.insertRow(
                            self.stringifyDict(s), "supermarket_details")

    def stringifyDict(self, dict):
        for key, value in dict.items():
            dict[key] = str(value)
        return dict

    # Turns string in "Countdown Bayfair" into "countdown_bayfair"
    # Used for checking names from JSON & from SQL database
    def parse(self, string):
        return string.lower().strip().replace(" ", "_")
