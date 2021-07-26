 <?php
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: *');
  header('Access-Control-Allow-Headers:*');
  header('Content-type: *');
  require "simple_html_dom.php";
  $recipeTitle = urldecode($_SERVER['QUERY_STRING']);
  $recipeTitle = urlencode($recipeTitle);
  $html = file_get_html("https://www.google.com/search?q=" . $recipeTitle . "&hl=en&sxsrf=ALeKk01GYKJyjt1kzRzV6NrDKUXejWp4UQ:1615285672253&source=lnms&tbm=isch&sa=X&ved=2ahUKEwid8tGFgKPvAhXBzTgGHf7PA5AQ_AUoAXoECAwQAw&biw=763&bih=752&dpr=1.26&safe=active");
  $img_array = array();
  $img_file = "../images/recipe_images" . $recipeTitle . ".png";
  $recipe_image = $html->find('img');
  // foreach ($html->find('img') as $element) {
  // array_push($img_array, $element->src);
  // }
  file_put_contents($img_file, file_get_contents($recipe_image[8]->src));
  echo $recipeTitle;
  ?>
