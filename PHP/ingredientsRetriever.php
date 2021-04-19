<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers:*');
header('Content-type: *');
$hostname ="localhost";
$username = "root";
$database = "goodrecipes";
$password = "ZXyYSNMF38iV";


//Connect to the goodrecipes database
$conn = new mysqli($hostname, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

//$recipe_title = $original_ingredient_array = [];
$requestMethod = $_SERVER["REQUEST_METHOD"];

//echo "Connected Successfully";
if($requestMethod == "POST"){
    $PHPInput =(file_get_contents("php://input"));
    $INPUTEncoded = json_decode($PHPInput);  
    $sql = "INSERT INTO ingredients(original_string, recipe_title) VALUES(? , ?)";
        if($stmt = $conn->prepare($sql)){
            for($i = 0; $i < sizeof($INPUTEncoded->originalString); $i++){
                $stmt->bind_param("ss", $INPUTEncoded->originalString[$i], $INPUTEncoded->recipeTitle[$i]);
                if($stmt->execute()){} 
            }
        $stmt->close();
        } else {
            echo "Couldn't upload to database";
        }
}
//TODO: Make output of rows match output
if($requestMethod == "GET"){
    $sql = "SELECT original_string, recipe_title FROM ingredients";
    $results = $conn->query($sql);
    $myArray = array();
    if ($results->num_rows > 0) {
        while($row = $results->fetch_assoc()) {
            $myArray[] = $row;
        }
       print json_encode($myArray);
    } else {
        echo "Couldn't get";
    }
}
