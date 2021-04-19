import os
import pandas as pd


for subdir, dirs, files in os.walk(
    r"C:\Users\ellio\Documents\Projects\fromscratch\library\Supermarket Scrapers\Product Data"
):
    productDataDirs = []
    for filename in dirs:
        dirpath = filename
        if dirpath.startswith("Countdown"):
            productDataDirs.append(dirpath)
    for supermarket in productDataDirs:
        supermarketSectionFiles = []
        print("Supermarket: ", supermarket)
        for file in os.listdir(supermarket):
            if file.endswith(".csv") and not (file.endswith("_import.csv")):
                supermarketSectionFiles.append(file)
        allFiles = []
        for files in supermarketSectionFiles:
            print("supersec files: ", files)
            pf = pd.read_csv(
                supermarket + os.sep + (files),
                na_filter=False,
                header=3,
                names=["Title", "Price", "Unit"],
                usecols=[0, 1, 2],
            )
            supermarketsection = (files.split("_")[1]).replace(".csv", "")
            pf.insert(3, "supermarket_section", supermarketsection)
            allFiles.append(pf)
        finalFile = pd.concat(allFiles)
        finalFile.to_csv(
            "import" + "/" + supermarket.replace(" ", "_").lower() + "_import.csv",
            index=False,
        )
