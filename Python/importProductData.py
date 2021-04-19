import os
import mysql.connector
from pathlib import Path
import pandas as pd


def getCurrentSupermarketProductTables():
    statement = "show tables"
    dbCursor.execute(statement)
    supermarketproducttables = dbCursor.fetchall()
    supermarketproducttables.pop()
    currentsupermarkettables = []
    for x in supermarketproducttables:
        for title in x:
            currentsupermarkettables.append(str(title))
    print(currentsupermarkettables)
    return currentsupermarkettables


def replaceSupermarketProductTable(supermarket, currentImportData):
    for x in currentImportData:
        if x.stem.__contains__(supermarket):
            deleteStatement = "truncate table " + supermarket
            dbCursor.execute(deleteStatement)
            uploadCSVToTable(supermarket)


def uploadCSVToTable(supermarket):
    table = pd.read_csv(
        supermarket + "_import.csv",
        na_filter=False,
        header=4,
        names=["Title", "Price", "Unit", "supermarket_section"],
        usecols=[0, 1, 2, 3],
    )
    statement = (
        "INSERT INTO "
        + supermarket
        + " (title,price,unit,supermarket_section) values(%s,%s,%s, %s)"
    )
    for row in table.index:
        values = (
            table["Title"][row],
            table["Price"][row],
            table["Unit"][row],
            table["supermarket_section"][row],
        )
        dbCursor.execute(statement, values)
        databaseConnection.commit()


def createSupermarketProductTable(supermarketTitle):
    statement = (
        "CREATE table "
        + supermarketTitle
        + " (product_id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), price VARCHAR(100), unit VARCHAR(100), supermarket_section VARCHAR(255))"
    )
    if supermarketTitle not in getCurrentSupermarketProductTables():
        dbCursor.execute(statement)
        result = dbCursor.fetchall()
        databaseConnection.commit()
        print("created table", supermarketTitle, result)
        uploadCSVToTable(supermarket)


def getSizeOfExistingTable(supermarketTitle):
    querySizeStatement = "SELECT supermarket_section FROM %s" % supermarketTitle
    dbCursor.execute(querySizeStatement)
    supermarketSectionList = dbCursor.fetchall()
    supermarketSectionDict = {
        "fridge-deli": 0,
        "fruit-veg": 0,
        "pantry": 0,
        "meat-seafood": 0,
    }
    for tuple in supermarketSectionList:
        for section in tuple:
            supermarketSectionDict[section] = supermarketSectionDict[section] + 1
    # print(f"{supermarketTitle} has {str(supermarketSectionDict)}")
    return supermarketSectionDict


def getTotalEntriesOfDict(dict):
    # print(sum(dict.values))
    return sum(dict.values())


def getImportData():
    currentdir = Path(".")
    currentSupermarketImportFiles = []
    for x in currentdir.iterdir():
        if x.suffix == ".csv" and x.stem.__contains__("countdown"):
            currentSupermarketImportFiles.append(x)
    return currentSupermarketImportFiles


def cleanImportFilenamesToTablenameFormat(filenames):
    tablenames = []
    for name in filenames:
        formattedName = name.stem.removesuffix("_import")
        tablenames.append(formattedName)
    return tablenames


def getDictOfCSVSupermarketSection(supermarket):
    pandafile = pd.read_csv(
        supermarket + "_import.csv",
        na_filter=False,
        header=4,
        names=["Title", "Price", "Unit", "supermarket_section"],
        usecols=[0, 1, 2, 3],
    )
    supermarketSectionDict = {
        "fridge-deli": 0,
        "fruit-veg": 0,
        "pantry": 0,
        "meat-seafood": 0,
    }
    for row in pandafile.index:
        section = pandafile["supermarket_section"][row]
        supermarketSectionDict[section] = supermarketSectionDict[section] + 1
    return supermarketSectionDict


def inputHandling(input):
    accept = ["yes", "y"]
    decline = ["no", "n"]
    if input in accept:
        return True
    elif input in decline:
        return False
    else:
        print("input not handled")


databaseConnection = mysql.connector.connect(
    host="localhost", user="root", database="products"
)
dbCursor = databaseConnection.cursor()
currentTables = getCurrentSupermarketProductTables()
currentImportData = getImportData()
currentImportDataNames = cleanImportFilenamesToTablenameFormat(currentImportData)
databaseOperationsDict = {}
for supermarket in currentImportDataNames:
    if supermarket in currentTables:
        existingTableDict = getSizeOfExistingTable(supermarket)
        newTableDict = getDictOfCSVSupermarketSection(supermarket)
        print(
            f"{supermarket}: old: {getTotalEntriesOfDict(existingTableDict)} vs. new: {getTotalEntriesOfDict(newTableDict)}"
        )
        userinput = input("Would you like to replace existing table with new table?")
        if inputHandling(userinput) == True:
            databaseOperationsDict[supermarket] = "replace"
    else:
        print(f"{supermarket} is not in database, will have to create new table")
        userinput = input("Would you like to create a new table?")
        if inputHandling(userinput) == True:
            databaseOperationsDict[supermarket] = "create"

for supermarket in databaseOperationsDict:
    print(supermarket, databaseOperationsDict[supermarket])
userinput = input("Proceed with these actions?")
if inputHandling(userinput) == True:
    for supermarket in databaseOperationsDict:
        if databaseOperationsDict[supermarket] == "create":
            createSupermarketProductTable(supermarket)
        elif databaseOperationsDict[supermarket] == "replace":
            replaceSupermarketProductTable(supermarket, currentImportData)

""" currentDir = Path(".")
for x in currentDir.iterdir():
    supermarkets = []
    importFiles = []
    for filename in dirs:
        if filename.startswith("Countdown"):
            supermarkets.append(filename)

            importFiles.append()
 """
