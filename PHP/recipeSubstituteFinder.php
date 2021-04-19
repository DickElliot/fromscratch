<?php

/** 
 * Searches the recipe ingredients with the a list of (mostly) syntactic (sometimes semantic) substitutions, these substitutions
 * allow for products to be matched accurately to the ingredients.
 * It then records where and which substitution should occur when the recipe is being imported into the website. This 'hot' fixing
 * of the ingredients allow me to import recipes without combing them for corrections while also not erasing their original data.  
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers:*');
header('Content-type: *');
// require '../../../includes/details.php';
// Connect to Databases
$username = "root";
$password = "ZXyYSNMF38iV";
try {
    $fromscratch = new PDO('mysql:dbname=fromscratch_administration;host=127.0.0.1', $username, $password);
    $goodrecipes = new PDO('mysql:dbname=goodrecipes;host=127.0.0.1', $username, $password);
} catch (PDOException $ex) {
    echo 'Connection failed: ' . $ex->getMessage();
}
$stmt = $fromscratch->query("SELECT id,data,data_values FROM substitutions", PDO::FETCH_ASSOC);
$stmt->execute();
$substitutions = $stmt->fetchAll();
$stmt = $goodrecipes->prepare("SELECT id,title,ingredients FROM recipes");
$stmt->execute();
$recipes = $stmt->fetchAll();
$substitutions_result = array();
foreach ($recipes as $recipe) {
    foreach ($substitutions as $sub_row) {
        $sub_values = explode(',', $sub_row['data_values']);
        $sub_values = preg_replace('/(\[)|(\])|(\")/', '', $sub_values);
        foreach ($sub_values as $sub_value) {
            if (strpos($recipe['ingredients'], $sub_value) !== false) {
                // echo "\nFound: " . $sub_value . " in " . " in recipe " . $recipe['title'] . " at " . strpos($recipe['ingredients'], $sub_value);
                $lengthOfMatch = strlen($sub_value);
                $location = strpos($recipe['ingredients'], $sub_value);
                // $fixedIngredients = substr_replace($recipe['ingredients'], trim($sub_row['data'], "\""), $location, $lengthOfMatch);
                // echo  "\nFixed: " . $fixedIngredients;
                // echo "\nstore in database: " . $recipe['id'] . " " . $location . " " . $lengthOfMatch . " " . $sub_row['id'];
                if (array_key_exists($recipe['id'], $substitutions_result)) {
                    array_push($substitutions_result[$recipe['id']], $location . "," . $lengthOfMatch . "," . $sub_row['id']);
                } else {
                    $substitutions_result[$recipe['id']] = array($location . "," . $lengthOfMatch . "," . $sub_row['id']);
                }
                //record replacement, recipe in which to replace, and location of replacement
            }
        }
    }
}

// $prepchkstmt = $goodrecipes->prepare("SELECT EXISTS(SELECT * from substitute_record WHERE recipe_id=(:$recipe_id)");
$prepnewinsrtstmt = $fromscratch->prepare("INSERT INTO substitute_record(recipe_id,substitution_location,substitution_length,substitution_id) VALUES (:recipe_id, :sub_location, :sub_length, :sub_id)");
// print_r($substitutions_result);
foreach ($substitutions_result as $key => $value) {
    $recipe_id = $key;
    // $locations = array();
    // $lengths = array();
    $test_ids = array();
    $sub_dict = array();
    foreach ($value as $sub_row) {
        $sub_row_details = explode(",", $sub_row);
        $sub_location = $sub_row_details[0];
        $sub_length = $sub_row_details[1];
        $sub_id = $sub_row_details[2];
        if (end($test_ids) != $sub_id) {
            $thisSub = new \stdClass;
            $thisSub->location = $sub_location;
            $thisSub->length = $sub_length;
            $thisSub->id = $sub_id;
            array_push($test_ids);
            array_push($sub_dict, $thisSub);
        }
    }
    usort($sub_dict, fn ($a, $b) => $b->location <=> $a->location);
    $locations = array();
    $lengths = array();
    $ids = array();
    foreach ($sub_dict as $sub_input) {
        /*   $sub_exists = array_search($sub_input->location, $locations);
        if ($sub_exists != false && $sub_dict[$sub_exists]->length < $sub_input->length) {
            $sub_dict[$sub_exists]->length = $sub_input->length;
            $sub_dict[$sub_exists]->location = $sub_input->location;
            $sub_dict[$sub_exists]->id = $sub_input->id;
        } else if ($sub_exists == false) { */
        array_push($locations, $sub_input->location);
        array_push($lengths, $sub_input->length);
        array_push($ids, $sub_input->id);
        // }
    }
    $location_cell = implode(",", $locations);
    $length_cell = implode(",", $lengths);
    $id_cell = implode(",", $ids);
    $counts = [count($locations), count($lengths), count($ids)];
    if (count(array_count_values($counts)) == 1) {
        $prepnewinsrtstmt->bindParam(':recipe_id', $recipe_id);
        $prepnewinsrtstmt->bindParam(':sub_location', $location_cell);
        $prepnewinsrtstmt->bindParam(':sub_length', $length_cell);
        $prepnewinsrtstmt->bindParam(':sub_id', $id_cell);
        // echo "\n", $recipe_id, "|", $location_cell, "|", $length_cell, "|", $id_cell;
        if ($prepnewinsrtstmt->execute()) {
            echo "\nsuccess";
        } else {
            echo "\nerror";
        }
    } else {
        echo "error with" . $recipe_id . "substitution code arrays are not of same length";
    }
}
