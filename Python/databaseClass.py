import pymysql
import csv
import math
import re


class database(object):
    def __init__(self, database):
        self.username = ''
        self.password = ''
        self.host = ''
        self.database = database
        self.login()
        self.connection = pymysql.connect(
            host=self.host, user=self.username,
            passwd=self.password, db=self.database)
        self.cursor = self.connection.cursor()
        self.cursor.execute(f"USE {self.database}")

    def insertRow(self, dictData, table):
        keys = dictData.keys()
        values = [item for item in dictData.values()]
        if (len(keys) > 1):
            keyString = ",".join(keys)
        else:
            keyString = str(keys)
        insertStatement = f"INSERT INTO {table}({keyString})"
        self.cursor.execute(
            f"INSERT INTO {table}({keyString}) VALUES % s", [values])
        self.connection.commit()

    def uploadDict(self, dictData, table):
        for row in dictData:
            self.insertRow(row, table)

    def createTableFromCSV(self, file, tableName):
        with open(file) as CSVFile:
            dictReader = csv.DictReader(CSVFile)
            structuredData = [row for row in dictReader]
        print(f"StructuredData: {len(structuredData)}")
        self.createTableFromDict(structuredData, tableName)

    def createTableFromDict(self, dictData, tableName):
        sqlString = f"CREATE TABLE {tableName} (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY"
        columnString = "{columnTitle} {columnType}"
        columns = {}
        if (isinstance(dictData, list)):
            headers = dictData[0].keys()
        elif (isinstance(dictData, csv.DictReader)):
            headers = dictData.fieldnames
        else:
            headers = dictData.keys()
        for header in headers:
            columns[header] = ['0']
        if (isinstance(dictData, list)):
            for row in dictData:
                for (k, v) in row.items():
                    columns[k].append(v)
        else:
            for (k, v) in dictData.items():
                columns[k].append(v)
        typeString = "<class 'str'>"
        typeInt = "<class 'int'>"
        for column in columns:
            columns[column].remove('0')
            types = set()
            length = 0
            for c in columns[column]:
                if (re.match(r"^-?\d*\.?\d*$", c)):
                    types.add(typeInt)
                else:
                    types.add(typeString)
                length += len(c)
            rowLength = math.ceil((length/len(columns[column])) * 2)
            print(
                f"For {column}, types are: {types} and average length of entry is: {rowLength/2}")
            if typeInt in types and len(types) == 1:
                columnType = "INT"
            else:
                columnType = f"VARCHAR({rowLength})"

            thisColumn = "," + \
                columnString.format(columnTitle=column,
                                    columnType=columnType)
            sqlString += thisColumn
        sqlString += ")"
        print(f"Execute: {sqlString}?")
        print("Y/N")
        proceed = input().lower()
        if proceed == "y":
            self.cursor.execute(sqlString)
            self.showResult()
        self.uploadDict(dictData, tableName)

    def deleteTable(self, table):
        sqlString = f"DROP TABLE {table}"
        print(f"Are you sure you want to run command {sqlString}?")
        print("It cannot be reversed Y/N")
        certain = input().capitalize()
        if (certain == "Y"):
            print(f"Dropping table {table}")
            self.cursor.execute(sqlString)
            self.showResult()

    def createTable(self, title, headers):
        print("1) Create Table from Scratch 2) Use existing as template")
        option = input()
        if(option == "1"):
            print("Creating from scratch")
            sqlString = f"CREATE TABLE {title} (id INT(11) NOT NULL AUTO_INCREMENT,"
            headerString = []
            if (len(headers) > 1):
                for header in headers:
                    headerString += self.createColumn(header)
                headerString = ",".join(headerString)
            else:
                headerString = f"{self.createColumn(headers)}"
            sqlString += headerString
            sqlString += "), PRIMARY KEY (id))"
        elif(option == "2"):
            print("Creating from template")
            print("Enter name of template")
            proceed = ""
            while proceed != "Y":
                template = input()
                print(f"{template} chosen, is this correct? Y/N")
                proceed = input().lower()
            sqlString = f"SELECT * INTO schema.{title} FROM schema.{template} WHERE 1 = 0"
        self.cursor.execute(sqlString)
        self.showResult()

    def createColumn(self, title):
        print(f"Creating column: {title}")
        columnTypes = ["1: VARCHAR", "2: INT"]
        print("Available types:")
        print(str(columnTypes))
        print("Enter type:")
        type = input()
        if (type == "1"):
            type = "VARCHAR"
        elif (type == "2"):
            type = "INT"
        print(f"{type} chosen")
        print("Enter size:")
        size = input()
        print(f"{title} {type}({size}) chosen")
        print("Is this correct? Y/N")
        answer = input().lower()
        if (answer == "y"):
            print(f"creating {title} {type}({size})")
            return f"{title} {type}({size})"
        else:
            self.createColumn(title)

    def getTables(self):
        self.cursor.execute(
            f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{self.database}'")
        return self.cursor.fetchall()

    def getColumnHeaders(self, table):
        sql = f"SHOW COLUMNS FROM {table}"
        self.cursor.execute(sql)
        return self.cursor.fetchall()

    def readTable(self, table, columns=[]):
        columnsString = "("
        if (len(columns) > 0):
            if (len(columns) > 1) and (type(columns) != type("string")):
                columnsString = "('" + "','".join(columns) + ")"
            else:
                columnsString += str(columns) + ")"
        else:
            columnsString = "*"
        sql = f"SELECT {columnsString} from {table}"
        print(f"Reading table with: {sql}")
        self.cursor.execute(sql)
        return self.cursor.fetchall()

    def showResult(self):
        self.connection.commit()
        print("Result:")
        print(self.cursor.fetchone())

    def login(self):
        correct = False
        while (correct == False):
            print("Enter username:")
            self.username = input()
            print("Enter host:")
            self.host = input()
            print("Enter password:")
            self.password = input()
            print(
                f"Connecting using u:{self.username} p:{self.password} h:{self.host}")
            print("Is this correct? (Y/N)")
            answer = input.lower()
            if (answer == "y"):
                correct = True
