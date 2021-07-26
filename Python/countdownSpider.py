import scrapy
import json
import math
from selenium import webdriver
from getSupermarketsList import getSupermarkets
from productDataScraper import getProducts
from scrapy.crawler import CrawlerProcess
from selenium.webdriver import ActionChains
from csvFileClass import CSVFile
from pathlib import Path


class CountdownSpider(scrapy.Spider):
    name = "Countdown"
    supermarketCount = 50
    supermarkets = {}
    missSupermarkets = {}
    currentsupermarketindex = 0
    url = "https://shop.countdown.co.nz/bookatimeslot"
    headers = {
        'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    def __init__(self, **kwargs):
        self.skipSupermarkets = kwargs["skipSupermarkets"]
        options = webdriver.ChromeOptions()
        # options.add_argument('headless')
        self.driver = webdriver.Chrome(
            executable_path="C:/Users/ellio/Downloads/chromedriver_91/chromedriver.exe", options=options)
        self.driver.implicitly_wait(5)

    def start_requests(self):
        cookies = {
            'dtid': '2:eZxBFAnOJIvVeT+u1u4riK8CobULTNnQ7CNiyMIthZ4239cUQlFo6mEfiHrfbxJd+Q22aFSXlzn5adbuby7azQNH4Ep+ns0dsHxWpYH1N20qQlH55rIuh50yW4B6Igojroc=',
            'ASP.NET_SessionId': 'e5tjopjul1cwvcpdyj25rrfm',
            'cw-laie': '0c6ee48e93bc4d648e45c8bc304d4ffc',
            'cw-arjshtsw': 'j54ef723fdbe84e1ba24206c6fe4c94d0jozkualjf',
            'akavpau_vpshop': '1625218883~id=ed67eee64a05757bb48c78e7c8f7994e',
            'ARRAffinity': 'ef118ee760e0fe9344f9a8a27e58630725a431fea30d778e6489ecd95a2d4a5a',
            'ARRAffinitySameSite': 'ef118ee760e0fe9344f9a8a27e58630725a431fea30d778e6489ecd95a2d4a5a',
            'gig_canary': 'false',
            'gig_canary_ver': '12208-3-27086970',
            'ai_user': 'bCw26scV8JahwlBLQmVj6E|2021-07-02T08:28:31.744Z',
            'ai_sessioncw-': 'ANNerXhq8tq+NjWFrTEr9X|1625214512120|1625218582924',
            'gig_bootstrap_3_PWTq_MK-V930M4hDLpcL_qqUx224X_zPBEZ8yJeX45RHI-uKWYQC5QadqeRIfQKB': 'login_ver4',
            'cw-lrkswrdjp': 'dm-Pickup,f-9412,a-619,s-10339',
            'AKA_A2': 'A',
        }
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://shop.countdown.co.nz/bookatimeslot(modal:change-pick-up-store)',
            'Content-Type': 'application/json',
            'X-Requested-With': 'OnlineShopping.WebApp',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT',
            'Request-Id': '|3131ff5d74014d0091b0a5a750ad75d3.f6a470c264d04e76',
            'traceparent': '00-3131ff5d74014d0091b0a5a750ad75d3-f6a470c264d04e76-01',
            'DNT': '1',
            'Connection': 'keep-alive',
            'TE': 'Trailers',
        }
        yield scrapy.Request(url='https://shop.countdown.co.nz/api/v1/addresses/pickup-addresses',
                             headers=headers, cookies=cookies, callback=self.parseSupermarkets)
        yield scrapy.Request(url=self.url,  headers=self.headers, callback=self.chooseAddress)

    def chooseAddress(self, response):
        for i in range(0, len(self.supermarkets)):
            print(f"Market: {i}/{len(self.supermarkets)}")
            ii = math.min(i+1, len(self.supermarkets))
            print('Current: ',
                  self.supermarkets[i].get("name"), 'Next:', self.supermarkets[ii].get("name"))
            self.driver.get(response.url)
            self.currentsupermarketindex = i
            actions = ActionChains(self.driver)
            try:
                choosePickUpLocation = self.driver.find_element_by_xpath(
                    '//*[@id="method-pickup"]'
                )
            except:
                try:
                    choosePickUpLocation = self.driver.find_element_by_xpath(
                        "//input[@id='method-pickup']"
                    )
                except:
                    try:
                        choosePickUpLocation = self.driver.find_element_by_xpath(
                            "//body/wnz-content[1]/div[2]/wnz-how-where-when[1]/div[1]/main[1]/form[1]/section[1]/fulfilment-method-selection[1]/fieldset[1]/div[1]/div[2]/form-selection-tile[1]"
                        )
                    except:
                        choosePickUpLocation = self.driver.find_element_by_xpath(
                            "/html[1]/body[1]/wnz-content[1]/div[2]/wnz-how-where-when[1]/div[1]/main[1]/form[1]/section[1]/fulfilment-method-selection[1]/fieldset[1]/div[1]/div[2]/form-selection-tile[1]"
                        )
            actions.move_to_element(choosePickUpLocation).click().perform()
            try:
                choosePickUpAddressButton = self.driver.find_element_by_xpath(
                    '//button[@data-cy="link"][contains(.,"Change store")]'
                )
            except:
                choosePickUpAddressButton = self.driver.find_element_by_xpath(
                    "//body[1]/wnz-content[1]/div[2]/wnz-how-where-when[1]/div[1]/main[1]/form[1]/section[1]/fieldset[1]/p[1]/button[1]"
                )
            choosePickUpAddressButton.click()
            try:
                selectARegion = self.driver.find_element_by_xpath(
                    '//select[contains(@name,"area-dropdown-0")]'
                )
            except:
                try:
                    selectARegion = self.driver.find_element_by_xpath(
                        '//option[contains(text(),"Select a region")]'
                    )
                except:
                    selectARegion = self.driver.find_element_by_xpath(
                        "//body[1]/wnz-content[1]/cdx-modal-view[1]/ng-component[1]/wnz-change-pickup-store-modal[1]/cdx-slotted-modal[1]/div[2]/cdx-card[1]/div[1]/div[2]/fulfilment-pickup-store-selection[1]/div[1]/div[1]/form-dropdown[1]/div[1]/select[1]"
                    )
                    print("Couldn't find 'SelectARegion' element")
            self.driver.execute_script("arguments[0].click();", selectARegion)
            chooseAllRegions = self.driver.find_element_by_xpath(
                '//option[contains(text(),"All Pick up locations")]'
            )
            chooseAllRegions.click()
            chooseAllSupermarkets = self.driver.find_elements_by_xpath(
                '//strong[contains(text(),"Countdown")]'
            )
            currentSupermarketName = self.supermarkets[i].get("name")
            currentSupermarket = self.driver.find_element_by_xpath(
                "//strong[@class='addressList-title ng-star-inserted'][contains(.,'" +
                currentSupermarketName + "')]"
            )
            location = currentSupermarket
            locationPath = currentSupermarketName
            self.driver.execute_script(
                "arguments[0].scrollIntoView(true);", location)
            location.click()
            self.parseProductJSON()

    def parseProductJSON(self):
        print("parsing started")
        urlPrefix = "https://shop.countdown.co.nz/shop/browse/"
        sections = [
            "meat-seafood",
            "fruit-veg",
            "pantry",
            "fridge-deli",
            "bakery",
            "frozen",
            "drinks",
        ]
        urlAppendage = "?page=1&size=120"
        currentSuperMarket = self.supermarkets[self.currentsupermarketindex].get(
            "name").strip()
        headers = [
            "name", "variety", "brand", "unit",
            "price", "min_purchase", "max_purchase",
            "increment_purchase", "each_unit_quantity",
            "average_weight_per_unit", "volume_size",
            "package_type", "cup_price", "cup_measure",
            "substitutions_allowed", "supports_both_each_and_kg_pricing",
            "section", "subsection"
        ]
        filePath = Path("Product Data/" + currentSuperMarket)
        csvFile = CSVFile(headers, filePath)
        # url = urlPrefix + sections[0] + urlAppendage
        # self.driver.get(url)
        for section in sections:
            url = urlPrefix + section + urlAppendage
            self.driver.get(url)
            subsectionElements = self.driver.find_elements_by_xpath(
                "//body/wnz-content[1]/div[2]/wnz-search[1]/div[1]/nav[1]/cdx-search-filters[1]/div[1]/ul[1]//li")
            for s in range(1, (len(subsectionElements) + 1)):
                subsectionDetails = json.loads(self.driver.find_element_by_xpath(
                    "//body/wnz-content[1]/div[2]/wnz-search[1]/div[1]/nav[1]/cdx-search-filters[1]/div[1]/ul[1]//li[" + str(s) + "]//button").get_attribute("data-facet-data"))
                subsectionName = subsectionDetails["name"]
                subsectionAmountOfProducts = subsectionDetails["productCount"]
                pageLengthOfSubsection = math.ceil(
                    subsectionAmountOfProducts/120)
                for i in range(1, (pageLengthOfSubsection + 1)):
                    requestData = json.loads(getProducts(i, self.cleanAPIString(
                        section), self.cleanAPIString(subsectionName)))
                    for product in requestData["products"]["items"]:
                        if(self.isProduct(product)):
                            productDict = {
                                "name": product["name"],
                                "variety": product["variety"],
                                "brand": product["brand"],
                                "unit": product["unit"],
                                "each_unit_quantity": product["eachUnitQuantity"],
                                "average_weight_per_unit": product["averageWeightPerUnit"],
                                "substitutions_allowed": product["subsAllowed"],
                                "supports_both_each_and_kg_pricing": product["supportsBothEachAndKgPricing"],
                                "section": section,
                                "subsection": subsectionName
                            }
                            productDict["price"] = (
                                self.getPrice(product["price"]))
                            productDict.update(
                                self.getSize(product["size"]))
                            productDict.update(
                                self.getPurchaseQuantity(product["quantity"]))
                            productDict = self.stringifyDict(productDict)
                            csvFile.writeDict(productDict)
        csvFile.closeFile()

    def isProduct(self, data):
        return data.get("type") == "Product"

    def stringifyDict(self, dict):
        for key, value in dict.items():
            dict[key] = str(value)
        return dict

    def getPrice(self, data):
        if (data["isClubPrice"] == True):
            return data["originalPrice"]
        else:
            return data["salePrice"]

    def getSize(self, data):
        size = {}
        size["volume_size"] = data["volumeSize"]
        size["package_type"] = data["packageType"]
        size["cup_price"] = data["cupPrice"]
        size["cup_measure"] = data["cupMeasure"]
        return size

    def getPurchaseQuantity(self, data):
        quantity = {}
        quantity["min_purchase"] = data["min"]
        quantity["max_purchase"] = data["max"]
        quantity["increment_purchase"] = data["increment"]
        return quantity

    def cleanAPIString(self, text):
        return text.lower().replace(' & ', '-').replace(' ', '-')

    def parse(self, response):
        json_response = json.loads(response.text)
        listings = json_response["data"]
        for listing in listings:
            yield {
                "Name": listing["name"],
                "Price": listing["price"],
                "Quantity": listing["quantity"],
                "Size": listing["size"],
            }

    # Saves supermarkets for spider to use to select
    # supermarkets to scrape

    def parseSupermarkets(self, response):
        jsonResponse = json.loads(response.text)
        supermarkets = jsonResponse["storeAreas"][0]["storeAddresses"]
        self.supermarkets = supermarkets
        skipSupermarkets = [self.parse(supermarket)
                            for supermarket in self.skipSupermarkets]
        for supermarket in supermarkets:
            name = supermarket["name"].strip()
            if name in skipSupermarkets:
                print(f"Skipping {name}, it already exists in database.")
                self.supermarkets.remove(supermarket)
        try:
            with open('supermarketslist.json', 'w') as f:
                json.dump(supermarkets, f)
        except:
            print("Supermarket list couldn't be saved")

    def parse(self, string):
        return string.title().strip().replace("_", " ")


def startScrape(**kwargs):
    process = CrawlerProcess(settings={
        "LOG_LEVEL": "ERROR",
        "DOWNLOAD_DELAY": "0.1"
    })
    process.crawl(CountdownSpider, skipSupermarkets=kwargs["skipSupermarkets"])
    process.start()
