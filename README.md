# fromscratch
Angular project to host recipes for New Zealander's 
Live at http://www.fromscratch.lol

Built to allow people easier access to recipes, removing the budgeting & location concerns. Also built to learn angular & typescript.
Website uses a mixture of the Angular stack along with python, mysql, php, & mongodb for the backend and their resources.


# Premise: 
I originally started this application to increase my skills with JavaScript, having little-to-no experience with it beforehand. After some research about creating modern dynamic webapps I chose the framework Angular due to it’s popularity with businesses, which also meant switching my main language to Typescript; a superset of Javascript I’d hadn’t heard of at that point. 
# Goal:
I hope to increase New Zealander’s ease at planning & preparing delicious food for themselves & loves one with the barest of effort.
# Method:
Using python, along with the Scrapy library I scrape data off supermarket websites to get product prices, which are then uploaded to a MySQL database. With PHP these products go through data pre-processing & are imported into an Angular app, where they are matched to different recipes to give users fully-priced recipes with products from their local supermarket. 
# Languages Used:
Along with front-end development I wanted to learn simple database management & webscraping. The languages I used to achieve this are listed below.

Typescript:
A superset of Javascript that uses stronger-typing & encourages OOP practices, this is the de facto language with Angular.

PHP: 
An unusual choice combined when combined with Angular, I hadn’t used it before. It is an almost universally-accepted language that has been used with frequency for decades.

Python: 
Used to scrape data with selenium/scrapy, also some MySQL interfacing. 

MYSQL:
Having never used a database before I was quite keen to learn what I could of MySQL & relational databasing. 

MongoDB:
NoSQL interested me and it seems the most popular choice to intertwine with angular, I’m using it store caches of the websites recipes as they have been matched to supermarkets. First the combinations are created in the website, they are then stored for retrieval. 

# TODO
1.	~~Create timer component~~
2.	~~Replace naive-matching ingredient->product algorithm.~~
3.	Allow 'current' ingredients that the user already has in ther pantry.
4.	Allow configuration of recipe layout.



