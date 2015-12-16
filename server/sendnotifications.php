<?php
/* Send an SMS using Twilio. You can run this file 3 different ways:
 *
 * - Save it as sendnotifications.php and at the command line, run
 *        php sendnotifications.php
 *
 * - Upload it to a web host and load mywebhost.com/sendnotifications.php
 *   in a web browser.
 * - Download a local server like WAMP, MAMP or XAMPP. Point the web root
 *   directory to the folder containing this file, and load
 *   localhost:8888/sendnotifications.php in a web browser.
 */

// Step 1: Download the Twilio-PHP library from twilio.com/docs/libraries,
// and move it into the folder containing this file.
require "Services/Twilio.php";

// Step 2: set our AccountSid and AuthToken from www.twilio.com/user/account
$AccountSid = "AC934c77b4f508d051c382213aed1b5400";
$AuthToken = "236ea63e4e19f433de6d62181cbff27c";

// Step 3: instantiate a new Twilio Rest Client
$client = new Services_Twilio($AccountSid, $AuthToken);

// Step 4: make an array of people we know, to send them a message.
// Feel free to change/add your own phone number and name here.
$people = array(
    "+584123600295" => "David"
);

// Step 5: Loop over all our friends. $number is a phone number above, and
// $name is the name next to it
foreach ($people as $number => $name) {

    $sms = $client->account->messages->sendMessage(

    // Step 6: Change the 'From' number below to be a valid Twilio number
    // that you've purchased, or the (deprecated) Sandbox number
        "+12018977269",

        // the number we are sending to - Any phone number
        $number,

        // the sms body
        "Hey $name, Monkey Party at 6PM. Bring Bananas!"
    );

    // Display a confirmation message on the screen
    echo "Sent message to $name";
}