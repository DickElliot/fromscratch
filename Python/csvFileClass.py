import csv
from pathlib import Path


class CSVFile(object):
    def __init__(self, headers, filePath):
        filePath = str(filePath) + ".csv"
        self.filePath = filePath
        self.headers = headers
        self.csvFile = open(filePath, 'w+', newline='')
        self.dictWriter = csv.DictWriter(
            self.csvFile, extrasaction='ignore', fieldnames=headers, delimiter=',')
        self.dictWriter.writeheader()
        # self.writer = csv.writer(self.csvFile)

    def getPath(self):
        return self.filePath

    def writeDictRow(self, dictData):
        try:
            self.dictWriter.writerow(dictData)
        except:
            print("Error writing dict row to file")

    def writeRow(self, data):
        try:
            self.writer.writerow(str(data))
        except:
            print("Error writing row to file")

    def closeFile(self):
        self.csvFile.close()
