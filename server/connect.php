<?php

// mysqli
$mysqli = new mysqli("127.0.0.1", "root", "", "mum");

/* verificar la conexión */
if (mysqli_connect_errno()) {
    printf("Conexión fallida: %s\n", mysqli_connect_error());
    exit();
}
