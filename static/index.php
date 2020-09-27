<?php
    function writeToTimes($fname, $times) {
        $f = fopen($fname, 'w');
        fwrite($f, json_encode($times));
        fclose($f);
    }

    // Temp for dev
    header("Access-Control-Allow-Origin: http://localhost:3000");
    header("Access-Control-Allow-Headers: content-type");
    header("Access-Control-Allow-Credentials: true");

    $fname = 'times.json';
    $requestMethod = $_SERVER['REQUEST_METHOD'];


    $fileJson = file_get_contents($fname);
    if ($fileJson === '') {
        $fileJson = '{}';
    }
    $times = json_decode($fileJson);

    if (in_array($requestMethod, ["GET"])) {
        // On GET
        if (isset($_GET['id']) && !empty($_GET['id'])) {
            $id = $_GET['id'];
            if (isset($times->$id)) {
                echo json_encode($times->$id);
            } else {
                http_response_code(400);
                $res = (object) array(
                    'error' => "id $id does not exist"
                );
                echo json_encode($res);
            }
        } else if (isset($_COOKIE['token']) && !empty($_COOKIE['token'])) {
            // var_dump($_COOKIE);
            $token = $_COOKIE['token'];
            $newTimer = (object) array(
                "token" => $token,
                "start" => 0,
                "end" => 0
            );

            $newId = rand(10000, 99999);
            while (isset($times->$newId)) {
                $newId = rand(10000, 99999);
            }
            $times->$newId = $newTimer;

            writeToTimes($fname, $times);

            $res = (object) array(
                'id' => $newId
            );

            echo json_encode($res);
        } else {
            http_response_code(400);
        }
    } else if (in_array($requestMethod, ["POST"])) {
        // On post
        if (isset($_COOKIE['token']) && !empty($_COOKIE['token'])) {
            $token = $_COOKIE['token'];
            $json = json_decode(file_get_contents('php://input'));

            $id = $json->id;
            $start = $json->start;
            $end = $json->end;

            if (!is_numeric($start) || !is_numeric($end)) {
                http_response_code(400);
                $res = (object) array(
                    'error' => 'Non numeric start or end'
                );
                echo json_encode($res);
            } else if (!isset($times->$id)) {
                http_response_code(400);
                $res = (object) array(
                    'error' => "Id $id does not exist"
                );
                echo json_encode($res);
            } else if ($token === $times->$id->token) {
                $times->$id->start = $start;
                $times->$id->end = $end;

                writeToTimes($fname, $times);

                $res = (object) array(
                    'message' => "Updated times for $id"
                );

                echo json_encode($res);
            } else {
                http_response_code(401);
            }
        }
    }
