<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers:*');
header('Content-type: *');
// require '../../../includes/details.php';
// Connect to Database
$dsn = 'mysql:dbname=goodrecipes;host=localhost';
$username = "root";
$password = "ZXyYSNMF38iV";
try {
  $goodrecipes = new PDO($dsn, $username, $password);
} catch (PDOException $ex) {
  echo 'Connection failed: ' . $ex->getMessage();
}
$recipeTitle = urldecode($_SERVER['QUERY_STRING']);
$sql = ("SELECT method FROM recipes WHERE (title='$recipeTitle')");
$statement = $goodrecipes->prepare($sql);
$statement->execute();
$results = $statement->fetch(PDO::FETCH_ASSOC);
if (count($results) > 0) {
  print json_encode($results['method']);
}
