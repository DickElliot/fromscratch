<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers:*');
header('Content-type: *');
// require '../../../includes/details.php';
$hostname = "localhost";
$database = "products";
$password = "ZXyYSNMF38iV";
$username = "root";

//Connect to the products database

$conn = new mysqli($hostname, $username, $password, $database);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$requestMethod = $_SERVER["REQUEST_METHOD"];

if ($requestMethod == "GET") {
  $query = explode('?', $_SERVER['QUERY_STRING']);
  $blocked_terms = explode('[]', str_replace("%20", " ", $query[1]));
  $supermarket_location = str_replace('+', ' ', $query[0]);
  $blocked_terms_regex = " WHERE title NOT REGEXP '";
  foreach ($blocked_terms as $term) {
    $blocked_terms_regex .= ucwords($term) . "|";
  }
  $blocked_terms_regex = substr($blocked_terms_regex, 0, strlen($blocked_terms_regex) - 1) . "';";
  $sql = "SELECT title, price, unit, supermarket_section FROM " . $supermarket_location . $blocked_terms_regex;
  $results = $conn->query($sql);
  $myArray = array();
  if ($results->num_rows > 0) {
    while ($row = $results->fetch_assoc()) {
      $myArray[] = $row;
    }
    print json_encode($myArray);
  } else {
    echo "Couldn't get products from " . $supermarket_location;
  }
}
