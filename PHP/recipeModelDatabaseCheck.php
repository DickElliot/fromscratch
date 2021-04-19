<?php
require 'vendor/autoload.php';
// require '../../../includes/details.php';
// Connect to database
$username = "mongoAdmin";
$password = "greenpillowbrowncat";
$host = "localhost";
$mongo = new MongoDB\Client(
    'mongodb://' . $username . ':' . $password . '@' . $host . ':27017/?authSource=admin'
);
try {
    $database = $mongo->recipes;
} catch (exception $e) {
    echo $e;
}
$supermarket = str_replace(' ', '_', $_SERVER['QUERY_STRING']);
$collectionNames = array();
foreach ($database->listCollections()  as $collectionInfo) {
    array_push($collectionNames, $collectionInfo["name"]);
}

// $isThere = is_int(in_array($supermarket, $collectionNames));
if ((in_array($supermarket, $collectionNames)) == true) {
    echo true;
} else {
    echo false;
}
