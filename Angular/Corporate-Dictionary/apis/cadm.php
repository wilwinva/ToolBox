<?php


//header('Content-Type: text/html');

//error_reporting(E_ALL);
//ini_set('display_errors', 1);





/**
 * Provides Web Services for the Corporate Dictionary and Acronym DB
 */
/*
* Database connection credentials
*
*  Connection info for all three environments is stored in this section.
*  Using the following format:
* array(<development username>, <development password>, <development PDO server string>),
* array( <quality username>,  <quality password>, <quality PDO server string>),
* array(  <production username>, <production password>, <production PDO server string>)
* )
*/
$_db_connections = array(array("cdm_dev", "j9h#kLtr", "dblib:host=db13snlnt:3904;dbname=CDM"),
    array("cdm_user", "wkz#cJ9y", "dblib:host=db13snlnt:3905;dbname=CDM"),
    array("cdm_user", "Soemkr#8", "dblib:host=db15snlnt:1186;dbname=CDM"));
/*
 * Environment
 *
 * One of: dev, qual, prod
 */
$_environment = "dev";



function get_db_connection()
{
    global $_db_connections, $_environment;

    // Environment determines which credentials' array to grab
    $env_offset = 2; // prod by default
    if ($_environment == "dev") {
        $env_offset = 0;
    } else if ($_environment == "qual") {
        $env_offset = 1;
    }
    return $_db_connections[$env_offset];
}

function query($sql, $params = array(), $max_rows = 500)
{
    $credentials = get_db_connection();
    $server = $credentials[2];
    $username = $credentials[0];
    $password = $credentials[1];
    // Catch $max_rows passed into $params
    if (is_numeric($params) && func_num_args() == 5) {
        $max_rows = $params;
        $params = array();
    }
    // Create Db connection
    $dbh = null;
    try {
        $dbh = new PDO($server, $username, $password);
    } catch (PDOException $e) {
        print "Error!: " . $e->getMessage() . "\n\n<br/>";
        die();
    }
    $stmt = $dbh->prepare($sql);

    // Execute statement
    $success = $stmt->execute();
    // Populate return object
    $rows = array();
    $num_rows = 0;
    while (($row = $stmt->fetch(PDO::FETCH_ASSOC)) && ($num_rows < $max_rows || $max_rows == -1)) {
        $rows[] = $row;
        $num_rows++;
    }

    return $rows;
}

// Handle querystring actions

if (isset($_GET['q'])) {
    retrieve_terms_by_index($_GET['q']);
}
else {
    retrieve_categories();
}

if (isset($_POST['searchText'])) {
    //$_POST['searchType']
}



/**
 * Retrieves categories and their associated sub-categories (and sub-glossaries for ES&H)
 * e.g. [{"category":"Corporate Governance","sub_categories":["--None--","Assurance"]},
 *       {"category":"ES&H","sub_categories":["--None--","ES&H General"]}]
 * @access public
 * @return array    array with rows representing a category that includes an array of sub-categories
 */
function retrieve_categories()
{
    $sql = "SELECT PA.policy_area_id as id, PA.policy_area_desc as name
	FROM dbo.policy_area PA
	WHERE PA.delete_flag <> 'Y'
	ORDER BY PA.policy_area_desc";

    $results =  query($sql, -1);
    echo json_encode($results);

}


function retrieve_terms_by_index($alphaIndex)
{
    $sql = "select t.term_id as id, t.term_name as term, t.acronym , t.abbrev_simplified, t.definition, t.delete_flag, t.create_application, pa.policy_area_desc, pa.policy_area_id, related.term_name as related_term_name
			from dbo.term t
			inner join dbo.term_2_sub_policy_area t2sp on t.term_id = t2sp.term_id and t2sp.delete_flag <> 'y'
			inner join dbo.sub_policy_area spa on t2sp.sub_policy_area_id = spa.sub_policy_area_id and spa.delete_flag <> 'y'
			inner join dbo.policy_area pa on pa.policy_area_id = spa.policy_area_id and pa.delete_flag <> 'y'
			left join dbo.related_term rt on t.term_id = rt.term_id and rt.delete_flag <> 'y'
			left join dbo.term related on rt.related_term_id = related.term_id and related.delete_flag <> 'y'
			where (t.term_name like '%".$alphaIndex."%' OR t.ACRONYM_SIMPLIFIED like '%".$alphaIndex."%')
			order by t.term_name";


    $results =  query($sql, -1);
    // The results will have duplicate terms when they have either different categories (policy area desc) or related terms.
    foreach($results as  $index => & $item) {
        // Add arrays and populate them with any values to the evantual json to hold the cats and related terms.
        $item['categories'] = array();
        $item['relatedTerms'] = array();
        array_push($item['categories'], array("name" => $results[$index]['policy_area_desc']));
        array_push($item['relatedTerms'], array("term" => $results[$index]['related_term_name'], "link" => $index));
        $x=1;
        // Look ahead to see if the next term is the same.
        while($results[$index+$x]['term'] == $item['term']) {
            // If so, and it has either a different policy area or related term, add it to the array.
            if($results[$index+$x]['policy_area_desc'] != $item['policy_area_desc']) {
                array_push($item['categories'], array("name" => $results[$index+$x]['policy_area_desc']));
            }
            if($results[$index+$x]['related_term_name'] != $item['related_term_name']) {
                array_push($item['relatedTerms'], array("term" => $results[$index+$x]['related_term_name'], "link" => $index+$x));
            }
            // finally, remove the duplicate from the result set (after extracting the related term or cat).
            unset($results[$index+$x]);
            $x++;
        }
    }
    // Unset doesn't change the index of the arrays and it leaves gaps that Angular can't deal with.  array_values simply rebases the indexs in the arrays to remove the gaps.
    $results = array_values($results);
    echo '{"q":"'.strtoupper($alphaIndex).'", "results": ' . json_encode($results) . '}';


}
function retrieve_filtered_terms($category, $subCategory, $term, $definition, $term_defn)
{

    $sql = "SELECT t.term_id, t.term_name, t.acronym, t.abbrev_simplified, t.definition, PA.policy_area_desc, SPA.sub_policy_area_desc, g.sub_glossary_desc, related.term_name
        FROM dbo.term t
        INNER JOIN dbo.term_2_sub_policy_area T2SP ON t.term_id = T2SP.term_id and T2SP.delete_flag <> 'Y'
        INNER JOIN dbo.sub_policy_area SPA ON T2SP.sub_policy_area_id = SPA.sub_policy_area_id and SPA.delete_flag <> 'Y'
        INNER JOIN dbo.policy_area PA ON PA.policy_area_id = SPA.policy_area_id and PA.delete_flag <> 'Y'
        LEFT JOIN dbo.related_term RT ON t.term_id = RT.term_id and RT.delete_flag <> 'Y'
        LEFT JOIN dbo.term related ON RT.related_term_id = related.term_id and related.delete_flag <> 'Y'
        WHERE t.delete_flag <> 'Y' --admin filters change to ?
        AND t.term_name LIKE 'A%' -- letter selected from dropdown
        AND t.term_name LIKE '%?%' OR t.definition LIKE '%?%' -- term and def'n
        AND PA.policy_area_id=?
        AND t.term_id = ? --admin filters
        AND t.source_id = ? --admin filters
        ORDER BY t.term_name;";

    $results =  query($sql, -1);
    echo  json_encode($results);
}
