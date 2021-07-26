<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers:*');
header('Content-type: *');
// require '../../../includes/details.php';
$hostname = "localhost";
$database = "products";
$username = "root";
$password = "ZXyYSNMF38iV";

//Create connection
$conn = new mysqli($hostname, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

//echo "Connected Successfully";
$sql = "SELECT name, longitude, latitude, address FROM supermarkets";
$result = mysqli_query($conn, $sql);
$myArray = array();

if ($result->num_rows > 0) {
  // output data of each row
  while ($row = $result->fetch_assoc()) {
    $myArray[]  = $row;
  }
  print json_encode($myArray);
} else {
  echo "0 results";
}
