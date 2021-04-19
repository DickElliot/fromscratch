from pathlib import Path
import pandas as pd

currentdir = Path(".")
supermarketdirs = []
for x in currentdir.iterdir():
    if x.is_dir() and x.name.__contains__("Countdown"):
        print(x.name)
        supermarketdirs.append(x)

for market in supermarketdirs:
    allFiles = []
    for file in market.iterdir():
        if not file.name.__contains__("_import.csv"):
            pf = pd.read_csv(
                file,
                na_filter=False,
                header=3,
                names=["Title", "Price", "Unit"],
                usecols=[0, 1, 2],
            )
            supermarketsection = (file.name.split("_")[1]).replace(".csv", "")
            pf.insert(3, "supermarket_section", supermarketsection)
            allFiles.append(pf)
    print("AllFiles for " + market.name + " " + str(len(allFiles)))
    for title in allFiles:
        print(title)
    marketname = market.name.replace(" ", "_").lower()
    finalFile = pd.concat(allFiles)
    finalFile.to_csv(
        "import" + "/" + marketname + "_import.csv",
        index=False,
    )
