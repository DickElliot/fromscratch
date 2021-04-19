<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers:*');
header('Content-type: *');

// require '../../../includes/details.php';
// Connect to Database
try {
    $goodrecipes = new PDO('mysql:dbname=goodrecipes;host=localhost', "root", "ZXyYSNMF38iV");
    $fromscratch_admin = new PDO('mysql:dbname=fromscratch_administration;host=localhost', "root", "ZXyYSNMF38iV");
} catch (PDOException $ex) {
    echo 'Connection failed: ' . $ex->getMessage();
}

$recipeTitle = str_replace('+', ' ', $_SERVER['QUERY_STRING']);
if ($recipeTitle == "all_recipes") {
    $sql = ("SELECT id, title, diet, servingsize, preptime, cooktime, ingredients FROM recipes");
} else {
    $sql = ("SELECT id, title, diet, servingsize, preptime, cooktime, ingredients FROM recipes WHERE (title='$recipeTitle')");
}
$statement = $goodrecipes->prepare($sql);
$statement->execute();
$results = $statement->fetchAll();
$resultsArray = array($results);

$sub_record_statement = $fromscratch_admin->prepare("SELECT * FROM substitute_record");
$sub_record_statement->execute();
$substitutions = $sub_record_statement->fetchAll();

$sub_statement = $fromscratch_admin->prepare("SELECT data FROM substitutions WHERE id=:sub_id");

if (count($results) > 0) {
    // TODO Remove double loop
    foreach ($results as &$recipe) {
        foreach ($substitutions as &$sub) {
            if ($recipe['id'] == $sub['recipe_id']) {
                $recipe_ingredients = $recipe['ingredients'];
                $sub_locations = explode(',', $sub['substitution_location']);
                $sub_lengths = explode(',', $sub['substitution_length']);
                $sub_ids = explode(',', $sub['substitution_id']);
                for ($i = 0; $i < count($sub_locations); $i++) {
                    $sub_statement->bindParam(':sub_id', $sub_ids[$i]);
                    $sub_statement->execute();
                    $sub_replacement = $sub_statement->fetch();
                    // echo $sub_replacement['data'];
                    $recipe_ingredients = substr_replace($recipe_ingredients, trim($sub_replacement['data'], "\""), $sub_locations[$i], $sub_lengths[$i]);
                }
                $recipe['ingredients'] = $recipe_ingredients;
            }
        }
    }
    print json_encode($results);
}

//$rowobj = (object) array(($row)); 
//echo  $rowObj->ingredients;
//echo "Title: " . $row["title"]. "Preptime: " . $row["preptime"]. "Cooktime: " . $row["cooktime"]. "ServingSize: " . $row["servingsize"]. "Ingredients: " . $row["ingredients"]. "Method: " . $row["method"]. "<br>";

// while($row = $results->fetch_assoc()){
// $results = mysql_fetch_array($raw_results) puts data from database into array, while it's valid it does the loop
//echo "<p><h3>".$results[0]."</h3>"."</p>";
// posts results gotten from database(title and text) you can also show id ($results['id'])
// echo (json_encode($resultsArray));
else { // if there is no matching rows do following
    echo "No results";
}
// print json_encode($resultsArray);
