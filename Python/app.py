from countdownSpider import startScrape
from productDataUploaderClass import dataUploader
from databaseClass import database


def start():
    print("initalizing...")
    print("""
    *********************************
    ** Supermarket Product Scraper **
    *********************************
    """)
    menu()


def menu():
    optionDict = {"1": "Crawl All", "2": "Upload Product Data",
                  "3": "Crawl Some", "e": "Exit Program"}
    print(optionDict.items())
    print("Enter Option")
    option = input()
    print("You chose:", optionDict[option])
    options(option)


def options(text):
    if (text == "1"):
        startScrape()
        print("Crawl completed.")
        menu()
    elif (text == "2"):
        dataUploader("Product Data")
        print("Upload product data selected")
        menu()
    elif (text == "3"):
        db = database("products")
        supermarketsOnDatabase = db.getTables()
        supermarketsOnDatabase = [first[0] for first in supermarketsOnDatabase]
        startScrape(skipSupermarkets=supermarketsOnDatabase)
        print("Crawl completed.")
        menu()
    elif (text == "e"):
        exit = input("Are you sure you want to exit? Y/N").capitalize()
        if (exit == "Y"):
            print("Exiting...")
            quit()
        elif (exit == "N"):
            menu()


if __name__ == "__main__":
    start()
