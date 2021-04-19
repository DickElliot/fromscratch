# fromscratch
Angular project to host recipes for New Zealanander's 
Live at http://www.fromscratch.lol

Built to allow people easier access to recipes, removing the budgeting & location concerns. Also built to learn angular & typescript.
Website uses a mixture of angular (inc. html/css/typescript) for the frontend with python, mysql, php, & mongodb for the backend and their resources.


# Premise: 
I originally started this application to increase my skills in Js (JavaScript), having little-to-no experience with it beforehand. After some research about creatin modern dynamic webapps I chose the framework Angular due to it’s popularity with businesses, which also meant switching my main language to Typescript; a superset of Js I’d hadn’t heard of at that point. 
# Goal:
With this task completed I would hope to increase New Zealander’s chances at planning& preparing delicious food for themselves & those they love, all with the barest of preparation.
# Method:
Using python, along with the Scrapy library I scrape data off supermarket websites to get their local product prices, which are then uploaded to a MySQL database. With PHP these products go through data pre-processing & are imported into an Angular app which they are then matched to different recipes to give a user a fully-priced recipe at their local supermarket. 
# Languages Used:
Along with front-end development I wanted to learn simple database management & webscraping. The languages I used to achieve this are listed below.

Typescript:
A superset of Js that uses stronger-typing & encourages OOP practices, this is the de facto language with Angular.

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
2.	Replace naive-matching ingredient->product algorithm.
3.	Allow 'current' ingredients that the user already has in ther pantry.
4.	Allow configuration of recipe layout.



