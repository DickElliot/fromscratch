import json
import urllib.request
from bs4 import BeautifulSoup
import re
import mysql.connector
from math import ceil

def updateAndPrintExistingRecipes():
    dbCursor.execute("SELECT title FROM recipes")
    existingRecipesResult = dbCursor.fetchall()
    existingRecipes = list(sum(existingRecipesResult, ()))
    recipeIndex = originalDatabaseRecipeLength
    for recipe in range(recipeIndex, len(existingRecipes)):
        print(recipeIndex, ": ", existingRecipes[recipeIndex])
        recipeIndex = recipeIndex + 1


def iterateThroughRecipeCollection(collectionURL):
    recipesURL = urllib.request.urlopen(collectionURL)
    recipesURLREAD = recipesURL.read()
    largeSoup = BeautifulSoup(recipesURLREAD, features="lxml")
    # template-article__list-count template-article__list-count--masthead-led  fw-600 mb-md qa-list-count
    collectionSize = largeSoup.find(
        "p",
        class_="template-article__list-count template-article__list-count--masthead-led fw-600 mb-md qa-list-count",
    ).text
    collectionSizePattern = "\d{1,3}"
    collectionSize = re.search(collectionSizePattern, collectionSize).group()
    numberOfPages = int(ceil(int(collectionSize) / arcticlesPerPage))
    print("Collection Size: ", collectionSize, "Number of pages: ", numberOfPages)
    collectionPage = 1
    for page in range(numberOfPages):
        print("Retrieving from URL: ", (collectionURL + str(collectionPage)))
        retrieveRecipeURLSFromCollection(collectionURL + str(collectionPage))
        collectionPage = collectionPage + 1


def retrieveRecipeURLSFromCollection(collectionURL):
    recipesURL = urllib.request.urlopen(collectionURL)
    recipesURLREAD = recipesURL.read()
    largeSoup = BeautifulSoup(recipesURLREAD, features="lxml")
    recipeLinks = set()
    for links in largeSoup.find_all(
        href=re.compile("https://www.bbcgoodfood.com/recipes/"),
        class_="standard-card-new__article-title",
    ):
        # print(links.get('href'))
        recipeLinks.add(links.get("href"))
    for recipe in recipeLinks:
        getInformationFromRecipe(recipe)


def getInformationFromRecipe(recipe):
    # print(recipeLinks)
    # recipesDict = {'title': None, 'diet':None, 'servingsize':None,'preptime': None,'cooktime':None,'ingredients':None,'method':None}
    updateAndPrintExistingRecipes()
    thisRecipeURL = urllib.request.urlopen(recipe)
    thisRecipeURLRead = thisRecipeURL.read()
    thisRecipeSoup = BeautifulSoup(thisRecipeURLRead)
    jsonSoup = thisRecipeSoup.find("script", type="application/ld+json")
    for child in jsonSoup.descendants:
        recipesDict = {
            "title": None,
            "diet": None,
            "servingsize": None,
            "preptime": None,
            "cooktime": None,
            "ingredients": None,
            "method": None,
        }
        recipe = json.loads(child)


        removenonAlphaNum = re.compile("([^\s\w]|_)+")
        recipesDict["title"] = removenonAlphaNum.sub("", recipe["name"])
        try:
            dietSoup = BeautifulSoup(recipe["suitableForDiet"])
            dietswithDiet = re.sub("http://schema.org/", r"", dietSoup.get_text())
            diets = re.sub("Diet", r"", dietswithDiet)
            recipesDict["diet"] = diets
        except:
            recipesDict["diet"] = "EMPTYDiet"
        recipesDict["servingsize"] = recipe["recipeYield"]
        try:
            cooktimeStripped = re.sub("PT", r"", recipe["cookTime"])
            recipesDict["cooktime"] = cooktimeStripped
        except:
            totalCookTimeStripped = re.sub("PT", r"", recipe["totalTime"])
            recipesDict["cooktime"] = totalCookTimeStripped
        try:
            preptimeStripped = re.sub("PT", r"", recipe["prepTime"])
            recipesDict["preptime"] = preptimeStripped
        except:
            totalCookTimeStripped = re.sub("PT", r"", recipe["totalTime"])
            recipesDict["preptime"] = (
                totalCookTimeStripped + " minus " + str(recipesDict["cooktime"])
            )
        i = 1
        allIngredients = ""
        for ingredients in recipe["recipeIngredient"]:
            thisIngredient = "[[" + str(i) + "]]" + ingredients
            allIngredients = allIngredients + thisIngredient
            i += 1
        recipesDict["ingredients"] = allIngredients
        i = 1
        wholeMethod = ""
        for steps in recipe["recipeInstructions"]:
            recipeInstructionsSoup = BeautifulSoup(steps["text"], features="lxml")
            oneStep = recipeInstructionsSoup.get_text()
            oneStep = "[[" + str(i) + "]]" + oneStep
            wholeMethod = wholeMethod + oneStep
            i += 1
        recipesDict["method"] = wholeMethod

        if recipesDict.get("title") not in existingRecipes:
            print("Adding ", recipesDict.get("title"), " to database...")
            # dbCursor.execute("CREATE TABLE recipes (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), diet VARCHAR(255), servingsize VARCHAR(100), preptime VARCHAR(100), cooktime VARCHAR(100), ingredients TEXT, method TEXT)")
            addRecipe = (
                'INSERT INTO recipes(title, diet, servingsize, preptime, cooktime, ingredients, method) VALUES ("'
                + recipesDict["title"]
                + '","'
                + recipesDict["diet"]
                + '","'
                + str(recipesDict["servingsize"])
                + '","'
                + recipesDict["preptime"]
                + '","'
                + recipesDict["cooktime"]
                + '","'
                + recipesDict["ingredients"]
                + '","'
                + recipesDict["method"]
                + '")'
            )
            # print(addRecipe)
            dbCursor.execute(addRecipe)
            databaseConnection.commit()
        else:
            print(
                "Duplicate ",
                recipesDict["title"],
                " already in database at: ",
                existingRecipes.index(recipesDict["title"]),
            )


databaseConnection = mysql.connector.connect(
    host="localhost",
    user="root",
)
dbCursor = databaseConnection.cursor()
# dbCursor.execute("CREATE DATABASE IF NOT EXISTS goodrecipes")
dbCursor.execute("USE goodrecipes")
dbCursor.execute("SELECT title FROM recipes")
existingRecipesResult = dbCursor.fetchall()
existingRecipes = list(sum(existingRecipesResult, ()))
print("Recipes currently in database:")
for recipe in existingRecipes:
    print(existingRecipes.index(recipe), ": ", recipe)
originalDatabaseRecipeLength = len(existingRecipes)


# Enter collection to scrape 
collectionURL = (
    "https://www.bbcgoodfood.com/recipes/collection/cheap-and-healthy-recipes/"
)
arcticlesPerPage = 24
iterateThroughRecipeCollection(collectionURL)

# def recipes(href):
#    return href and re.compile("https://www.bbcgoodfood.com/recipes/").search(href)
