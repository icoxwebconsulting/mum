<?php

require 'C:\icox\mum\server\vendor\twilio\sdk\Services\Twilio.php';
require 'connect.php';

// set your AccountSid and AuthToken from www.twilio.com/user/account
$AccountSid = "AC934c77b4f508d051c382213aed1b5400";
$AuthToken = "236ea63e4e19f433de6d62181cbff27c";

//obtener valores del POST

//$number = $_POST['number'];
$number = "+584123600295";

//defino la respuesta
$respuesta = array(
    'error' => true,
    'message' => "Error al ejecutar el query de insert"
);

//verifico si existe el numero en bd
$query = "SELECT * FROM user_phones WHERE phone = $number LIMIT 1";

$result = $mysqli->query($query);

if ($result->num_rows) {
    //existe un registro
    $fila = $result->fetch_object();
    $rand = $fila->code;

    $respuesta['error'] = false;
    $respuesta['message'] = 'Existe previo';
} else {
    //no existe registro previo, generar aleatorio y almacenarlo
    $rand = rand(1000, 9999);
    //guardar el numero aleatorio
    $query = "INSERT INTO user_phones (phone, code) VALUES ($number, $rand)";
    $resultado = $mysqli->query($query);

    if ($resultado) {
        $respuesta['error'] = false;
        $respuesta['message'] = '';
    }
}


if (!$respuesta['error']) {
    $client = new Services_Twilio($AccountSid, $AuthToken);

    $message = $client->account->messages->create(array(
        "From" => "+12018977269",
        "To" => $number,
        "Body" => "Su codigo de verificacion es $rand",
    ));
}

echo json_encode($respuesta);