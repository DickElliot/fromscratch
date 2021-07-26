import scrapy
from urllib.parse import quote_plus
from scrapy.crawler import CrawlerProcess
import scrapy.crawler as crawler
from twisted.internet import reactor
from selenium import webdriver
import time
from multiprocessing import Process, Queue
from scrapy.signalmanager import dispatcher
from scrapy import signals


class coordinatesSpider(scrapy.Spider):
    name = "Coordinates"
    headers = {
        'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    def __init__(self, path):
        parsedPath = quote_plus(path)
        self.url = f"https://www.google.co.nz/maps?hl=en&q={parsedPath}"
        options = webdriver.ChromeOptions()
        options.add_argument('headless')
        self.driver = webdriver.Chrome(
            executable_path="C:/Users/ellio/Downloads/chromedriver_91/chromedriver.exe", options=options)

    def start_requests(self):
        yield scrapy.Request(url=self.url,  headers=self.headers, callback=self.parseResponse)

    def parseResponse(self, response):
        self.driver.get(self.url)
        i = 0
        print("time elapsed...")
        while (self.url == self.driver.current_url):
            time.sleep(1)
            i += 1
            print(f"{i} seconds")
        parsedUrl = self.driver.current_url.replace(
            'https://www.google.co.nz/', '').split('/')
        details = ''
        for parts in parsedUrl:
            if parts[0] == "@":
                details = parts
        details = details.split(',')
        latitude = details[0].replace('@', '')
        longitude = details[1]
        coordinates = {'latitude': latitude, 'longitude': longitude}
        return coordinates


def scrapeLocation(location):
    results = {}

    def crawler_results(signal, sender, item, response, spider):
        results.update(item)
    dispatcher.connect(crawler_results, signal=signals.item_scraped)
    process = CrawlerProcess(settings={
        "LOG_LEVEL": "ERROR",
        "DOWNLOAD_DELAY": "0.1"
    })
    process.crawl(coordinatesSpider, location)
    process.start()
    print(results)
    return results


def f(q, location):
    try:
        results = {}

        def crawler_results(signal, sender, item, response, spider):
            results.update(item)
        dispatcher.connect(crawler_results, signal=signals.item_scraped)
        runner = crawler.CrawlerRunner()
        deferred = runner.crawl(coordinatesSpider, location)
        deferred.addBoth(lambda _: reactor.stop())
        reactor.run()
        q.put(results)
    except Exception as e:
        q.put(e)


def getCoordinates(location):
    q = Queue()
    p = Process(target=f, args=(q, location))
    p.start()
    result = q.get()
    p.join()
    print(result)
    return result
    # if result is not None:
    # raise result


def getCombined(location):
    results = {}

    def f(q):
        try:
            def crawler_results(signal, sender, item, response, spider):
                results.update(item)
            dispatcher.connect(crawler_results, signal=signals.item_scraped)
            runner = crawler.CrawlerRunner(settings={
                "LOG_LEVEL": "ERROR",
                "DOWNLOAD_DELAY": "0.1"
            })
            deferred = runner.crawl(coordinatesSpider, location)
            deferred.addBoth(lambda _: reactor.stop())
            reactor.run()
            q.put(None)
        except Exception as e:
            q.put(e)

    q = Queue()
    p = Process(target=f, args=(q,))
    p.start()
    result = q.get()
    p.join()

    if result is not None:
        raise result
    print(results)
    return results
