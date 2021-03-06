<?php
/**
 * @author     Martin Høgh <mh@mapcentia.com>
 * @copyright  2013-2018 MapCentia ApS
 * @license    http://www.gnu.org/licenses/#AGPL  GNU AFFERO GENERAL PUBLIC LICENSE 3
 *
 */

ini_set("display_errors", "Off");
include_once(__DIR__ . "/../../vendor/autoload.php");

error_reporting(3);

use \app\conf\App;
use \app\conf\Connection;
use \app\inc\Model;
use \app\inc\Util;
use \app\models\Database;
use \GuzzleHttp\Client;

header("Content-type: text/plain");

include_once(__DIR__ . "/../../conf/App.php");

$db = $argv[1];
$schema = $argv[2];
$url = $argv[3];
$importTable = $argv[4];
$geomType = $argv[5];
$overwrite = $argv[6];
$encoding = $argv[7];
$srid = $argv[8];

new App();
Database::setDb($db);
$database = new Model();
$database->connect();
$client = new Client();

if ($overwrite) {
    $sql = "DROP TABLE {$schema}.{$importTable}";
    $res = $database->prepare($sql);
    try {
        $res->execute();
    } catch (\PDOException $e) {

    }
}

function which($cmd)
{
    $cmd = "/usr/bin/which {$cmd}";
    exec($cmd . ' 2>&1', $out, $err);
    return $out[0];
}

$pass = true;

$randFileName = "_" . md5(microtime() . rand());
$files = [];
$out = [];

// Check if file extension
// =======================
$extCheck1 = explode(".", $url);
$extCheck2 = array_reverse($extCheck1);
$extension = strtolower($extCheck2[0]);

array_shift($extCheck2);
$base = implode(".", array_reverse($extCheck2));


switch ($extension) {
    case "shp":
        $files[$randFileName . ".shp"] = $url;
        // Try to get both upper and lower case extension
        $files[$randFileName . ".dbf"] = $base . ".dbf";
        $files[$randFileName . ".DBF"] = $base . ".DBF";
        $files[$randFileName . ".shx"] = $base . ".shx";
        $files[$randFileName . ".SHX"] = $base . ".SHX";
        $fileSetName = $randFileName . ".shp";
        break;

    case "tab":
        $files[$randFileName . ".tab"] = $url;
        // Try to get both upper and lower case extension
        $files[$randFileName . ".map"] = $base.".map";
        $files[$randFileName . ".MAP"] = $base.".MAP";
        $files[$randFileName . ".dat"] = $base.".dat";
        $files[$randFileName . ".DAT"] = $base.".DAT";
        $files[$randFileName . ".id"] = $base.".id";
        $files[$randFileName . ".ID"] = $base.".ID";
        $fileSetName = $randFileName . ".tab";
        break;

    default:
        $files[$randFileName . ".general"] = $url;
        $fileSetName = $randFileName . ".general";
        break;
}

foreach ($files as $key => $file) {
    $path = "/var/www/geocloud2/public/logs/" . $key;
    $fileRes = fopen($path,'w');
    try {
        $response = $client->get($file, ['save_to' => $fileRes]);
    } catch (Exception $e) {
        print $file . "   ";
        // Delete files with errors
        unlink($path);
        print $e->getMessage() . "\n";
    }
}

$cmd = "PGCLIENTENCODING={$encoding} " . which("ogr2ogr") . " " .
    "-skipfailures " .
    "-append " .
    "-dim 2 " .
    "-lco 'GEOMETRY_NAME=the_geom' " .
    "-lco 'FID=gid' " .
    "-lco 'PRECISION=NO' " .
    "-a_srs 'EPSG:{$srid}' " .
    "-f 'PostgreSQL' PG:'host=" . Connection::$param["postgishost"] . " user=" . Connection::$param["postgisuser"] . " password=" . Connection::$param["postgispw"] . " dbname=" . Connection::$param["postgisdb"] . "' " .
    "/var/www/geocloud2/public/logs/" . $fileSetName . " " .
    "-nln {$schema}.{$importTable} " .
    "-nlt {$geomType}";
exec($cmd . ' 2>&1', $out, $err);

array_map('unlink', glob("/var/www/geocloud2/public/logs/" . $randFileName . ".*"));

foreach ($out as $line) {
    if (strpos($line, "FAILURE") !== false) {
        $pass = false;
        break;
    }
}

if (!$pass) {

    foreach ($out as $line) {
        echo $line . "\n";
    }

    exit(1);

}

echo "\n";
exit(0);


