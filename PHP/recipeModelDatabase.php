<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers:*');
header('Content-type: *');
//Adding Composer's autoloader
require 'vendor/autoload.php';
// require '../../../includes/details.php';
// Connect to database
$username = "mongoAdmin";
$password = "greenpillowbrowncat";
$mongo = new MongoDB\Client(
    'mongodb://' . $username . ':' . $password . '@localhost:27017/?ssl=false&authSource=admin'
);
$database = $mongo->recipes;
// $results = getCollectionNames($database);
// print_r($results);

$request_method = $_SERVER["REQUEST_METHOD"];
$supermarket = str_replace('%20', '_', $_SERVER['QUERY_STRING']);
if ($request_method == "GET") {
    $supermarket_collection = $database->$supermarket;
    $cursor = $supermarket_collection->find();
    echo json_encode((iterator_to_array($cursor, $use_keys = false)));
} else if ($request_method == "POST") {
    $recipes_input = (file_get_contents("php://input"));
    $recipes = json_decode($recipes_input);
    $deleteCurrentRecipes = $database->$supermarket->drop();
    $insertRecipes = $database->$supermarket->insertMany($recipes);
    printf("Inserted %d document(s)\n", $insertRecipes->getInsertedCount());
    /* $supermarket_collection = $database->$supermarket;
    $existing_recipes_count = $supermarket_collection->count();
    if ($existing_recipes_count != count($recipes)) {
        $supermarket_collection->drop();
        $supermarket_collection->insert($recipes);
    } else {
        echo "POST failed, number of recipes same on database.";
    } */
}
