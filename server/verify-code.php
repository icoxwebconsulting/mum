<?php

require 'C:\icox\mum\server\vendor\twilio\sdk\Services\Twilio.php';
require 'connect.php';

//obtener valores del POST

//$number = $_POST['number'];
//$code = $_POST['code'];
$number = "+584123600295";
$code = "9976";

//defino la respuesta
$respuesta = array(
    'error' => true,
    'message' => "numero no verificado"
);

//verifico si existe el numero en bd
$query = "SELECT * FROM user_phones WHERE phone = $number AND code = $code LIMIT 1";

$result = $mysqli->query($query);

if ($result->num_rows) {

    $respuesta['error'] = false;
    $respuesta['message'] = 'Verificacion correcta';


}

echo json_encode($respuesta);