<?php

class ThreatController extends Controller {

    public function actionIndex() {
        $this->render('index');
    }

    protected function queryNodeLink($majorWayPoints, $wayPoints, $threshold, $date) {
        //uncomment the line below and remove the function argument if testing from backend
        $nodeArray = ThreatType::model()->getNodeLinkData($majorWayPoints, $wayPoints, $threshold, $date);
        $max = 0;
        foreach ($nodeArray as $node) {
            if ($max < $node['count']) {
                $max = $node['count'];
            }
        }
        $id = -1;
        $start = 0;
        for ($i = 0; $i < count($nodeArray); $i++) {
            if ($nodeArray[$i]['id'] != $id) {
                $id = $nodeArray[$i]['id'];
                $start = $nodeArray[$i]['link'];
            }

            $nodeArray[$i]['count'] = ($nodeArray[$i]['count'] / $max) * 15 + 15;
            $nodeArray[$i]['link'] = $nodeArray[$i]['link'] - $start + 1;
        }

        return $nodeArray;
    }

    public function actionGetData() {
        $data = CJSON::decode($_POST['json_string']);
        $wayPoints = $data['wayPoints'];
        $majorWayPoints = $data['majorWayPoints'];
        $threshold = (isset($_POST['threshold'])) ? $_POST['threshold'] : ".001";
        $date = (isset($_POST['start_date'])) ? $_POST['start_date'] : "01/01/2009";
        $temporal = ThreatType::model()->getSparklineData($wayPoints, $date, $threshold);

        $nodelink = $this->queryNodeLink($majorWayPoints, $wayPoints, $threshold, $date);
        $areachart = ThreatType::model()->getStreamGraphData($wayPoints, $date, $threshold, null, null);
        $data = array(
            "temporal" => $temporal,
            "nodelink" => $nodelink,
            "area" => $areachart
        );
        echo CJSON::encode($data);
    }

    public function actionUpdateStackArea() {
        $data = CJSON::decode($_POST['json_string']);
        $wayPoints = $data['wayPoints'];

        $threshold = (isset($_POST['threshold'])) ? $_POST['threshold'] : ".001";
        $date = (isset($_POST['start_date'])) ? $_POST['start_date'] : "01/01/2009";
        $day = (isset($_POST['day'])) ? $_POST['day'] : null;
        $time = (isset($_POST['time'])) ? $_POST['time'] : null;

        $areachart = ThreatType::model()->getStreamGraphData($wayPoints, $date, $threshold, $day, $time);
        echo CJSON::encode($areachart);
    }

    public function actionStackArea($json_string = '{"bounds":{"fa":{"d":33.79144,"b":33.79984},"ga":{"b":-84.39265,"d":-84.37427000000001}},"copyrights":"Map data ©2013 Google","legs":[{"distance":{"text":"1.4 mi","value":2265},"duration":{"text":"6 mins","value":364},"end_address":"Atlanta Botanical Garden, 1345 Piedmont Avenue Northeast, Atlanta, GA 30309, USA","end_location":{"e":33.7916056,"pb":-84.3742681},"start_address":"Atlanta, GA 30309, USA","start_location":{"e":33.7995974,"pb":-84.39265499999999},"steps":[{"distance":{"text":"125 ft","value":38},"duration":{"text":"1 min","value":4},"end_location":{"e":33.7998405,"pb":-84.39236319999998},"polyline":{"points":"onhmE`}abO]c@QU"},"start_location":{"e":33.7995974,"pb":-84.39265499999999},"travel_mode":"DRIVING","encoded_lat_lngs":"onhmE`}abO]c@QU","path":[{"e":33.799600000000005,"pb":-84.39265},{"e":33.79975,"pb":-84.39247},{"e":33.79984,"pb":-84.39236000000001}],"lat_lngs":[{"e":33.799600000000005,"pb":-84.39265},{"e":33.79975,"pb":-84.39247},{"e":33.79984,"pb":-84.39236000000001}],"instructions":"Head <b>northeast</b> on <b>Deering Rd NW</b> toward <b>Peachtree St NW</b>","maneuver":"","start_point":{"e":33.7995974,"pb":-84.39265499999999},"end_point":{"e":33.7998405,"pb":-84.39236319999998}},{"distance":{"text":"0.2 mi","value":385},"duration":{"text":"1 min","value":57},"end_location":{"e":33.7974166,"pb":-84.38948390000002},"polyline":{"points":"_phmEf{abORIVMb@W@ABAJG@Af@]@AXUBCNOTULQ\\k@\\g@b@q@DK\\i@X_@LWn@iAFK@E@CFOBIBEJ["},"start_location":{"e":33.7998405,"pb":-84.39236319999998},"travel_mode":"DRIVING","encoded_lat_lngs":"_phmEf{abORIVMb@W@ABAJG@Af@]@AXUBCNOTULQ\\k@\\g@b@q@DK\\i@X_@LWn@iAFK@E@CFOBIBEJ[","path":[{"e":33.79984,"pb":-84.39236000000001},{"e":33.79974,"pb":-84.39231000000001},{"e":33.799620000000004,"pb":-84.39224},{"e":33.799440000000004,"pb":-84.39212},{"e":33.79943,"pb":-84.39211},{"e":33.79941,"pb":-84.39210000000001},{"e":33.799350000000004,"pb":-84.39206},{"e":33.79934,"pb":-84.39205000000001},{"e":33.79914,"pb":-84.3919},{"e":33.799130000000005,"pb":-84.39189},{"e":33.799,"pb":-84.39178000000001},{"e":33.79898,"pb":-84.39176},{"e":33.7989,"pb":-84.39168000000001},{"e":33.798790000000004,"pb":-84.39157},{"e":33.79872,"pb":-84.39148},{"e":33.798570000000005,"pb":-84.39126},{"e":33.79842,"pb":-84.39106000000001},{"e":33.79824,"pb":-84.39081},{"e":33.798210000000005,"pb":-84.39075000000001},{"e":33.79806,"pb":-84.39054},{"e":33.79793,"pb":-84.39038000000001},{"e":33.79786,"pb":-84.39026000000001},{"e":33.79762,"pb":-84.38989000000001},{"e":33.79758,"pb":-84.38983},{"e":33.79757,"pb":-84.38980000000001},{"e":33.797560000000004,"pb":-84.38978},{"e":33.797520000000006,"pb":-84.3897},{"e":33.7975,"pb":-84.38965},{"e":33.79748,"pb":-84.38962000000001},{"e":33.79742,"pb":-84.38948}],"lat_lngs":[{"e":33.79984,"pb":-84.39236000000001},{"e":33.79974,"pb":-84.39231000000001},{"e":33.799620000000004,"pb":-84.39224},{"e":33.799440000000004,"pb":-84.39212},{"e":33.79943,"pb":-84.39211},{"e":33.79941,"pb":-84.39210000000001},{"e":33.799350000000004,"pb":-84.39206},{"e":33.79934,"pb":-84.39205000000001},{"e":33.79914,"pb":-84.3919},{"e":33.799130000000005,"pb":-84.39189},{"e":33.799,"pb":-84.39178000000001},{"e":33.79898,"pb":-84.39176},{"e":33.7989,"pb":-84.39168000000001},{"e":33.798790000000004,"pb":-84.39157},{"e":33.79872,"pb":-84.39148},{"e":33.798570000000005,"pb":-84.39126},{"e":33.79842,"pb":-84.39106000000001},{"e":33.79824,"pb":-84.39081},{"e":33.798210000000005,"pb":-84.39075000000001},{"e":33.79806,"pb":-84.39054},{"e":33.79793,"pb":-84.39038000000001},{"e":33.79786,"pb":-84.39026000000001},{"e":33.79762,"pb":-84.38989000000001},{"e":33.79758,"pb":-84.38983},{"e":33.79757,"pb":-84.38980000000001},{"e":33.797560000000004,"pb":-84.38978},{"e":33.797520000000006,"pb":-84.3897},{"e":33.7975,"pb":-84.38965},{"e":33.79748,"pb":-84.38962000000001},{"e":33.79742,"pb":-84.38948}],"instructions":"Take the 1st <b>right</b> onto <b>Peachtree St NW</b>","maneuver":"","start_point":{"e":33.7998405,"pb":-84.39236319999998},"end_point":{"e":33.7974166,"pb":-84.38948390000002}},{"distance":{"text":"0.2 mi","value":272},"duration":{"text":"1 min","value":75},"end_location":{"e":33.79577829999999,"pb":-84.38773630000003},"maneuver":"turn-slight-left","polyline":{"points":"{`hmEfiabOJ_@DOBKBIVgAXeADOFM@EDGHQJKHIHGHIHCHELEHCPERAVCZAD?XAJ@"},"start_location":{"e":33.7974166,"pb":-84.38948390000002},"travel_mode":"DRIVING","encoded_lat_lngs":"{`hmEfiabOJ_@DOBKBIVgAXeADOFM@EDGHQJKHIHGHIHCHELEHCPERAVCZAD?XAJ@","path":[{"e":33.79742,"pb":-84.38948},{"e":33.797360000000005,"pb":-84.38932000000001},{"e":33.79733,"pb":-84.38924},{"e":33.79731,"pb":-84.38918000000001},{"e":33.797290000000004,"pb":-84.38913000000001},{"e":33.79717,"pb":-84.38877000000001},{"e":33.79704,"pb":-84.38842000000001},{"e":33.79701,"pb":-84.38834000000001},{"e":33.79697,"pb":-84.38827},{"e":33.796960000000006,"pb":-84.38824000000001},{"e":33.79693,"pb":-84.38820000000001},{"e":33.79688,"pb":-84.38811000000001},{"e":33.796820000000004,"pb":-84.38805},{"e":33.79677,"pb":-84.388},{"e":33.79672,"pb":-84.38796},{"e":33.796670000000006,"pb":-84.38791},{"e":33.796620000000004,"pb":-84.38789000000001},{"e":33.79657,"pb":-84.38786},{"e":33.7965,"pb":-84.38783000000001},{"e":33.79645,"pb":-84.38781},{"e":33.79636,"pb":-84.38778},{"e":33.796260000000004,"pb":-84.38777},{"e":33.79614,"pb":-84.38775000000001},{"e":33.796,"pb":-84.38774000000001},{"e":33.795970000000004,"pb":-84.38774000000001},{"e":33.795840000000005,"pb":-84.38773},{"e":33.79578,"pb":-84.38774000000001}],"lat_lngs":[{"e":33.79742,"pb":-84.38948},{"e":33.797360000000005,"pb":-84.38932000000001},{"e":33.79733,"pb":-84.38924},{"e":33.79731,"pb":-84.38918000000001},{"e":33.797290000000004,"pb":-84.38913000000001},{"e":33.79717,"pb":-84.38877000000001},{"e":33.79704,"pb":-84.38842000000001},{"e":33.79701,"pb":-84.38834000000001},{"e":33.79697,"pb":-84.38827},{"e":33.796960000000006,"pb":-84.38824000000001},{"e":33.79693,"pb":-84.38820000000001},{"e":33.79688,"pb":-84.38811000000001},{"e":33.796820000000004,"pb":-84.38805},{"e":33.79677,"pb":-84.388},{"e":33.79672,"pb":-84.38796},{"e":33.796670000000006,"pb":-84.38791},{"e":33.796620000000004,"pb":-84.38789000000001},{"e":33.79657,"pb":-84.38786},{"e":33.7965,"pb":-84.38783000000001},{"e":33.79645,"pb":-84.38781},{"e":33.79636,"pb":-84.38778},{"e":33.796260000000004,"pb":-84.38777},{"e":33.79614,"pb":-84.38775000000001},{"e":33.796,"pb":-84.38774000000001},{"e":33.795970000000004,"pb":-84.38774000000001},{"e":33.795840000000005,"pb":-84.38773},{"e":33.79578,"pb":-84.38774000000001}],"instructions":"Slight <b>left</b> onto <b>Peachtree St NE</b>","start_point":{"e":33.7974166,"pb":-84.38948390000002},"end_point":{"e":33.79577829999999,"pb":-84.38773630000003}},{"distance":{"text":"0.2 mi","value":330},"duration":{"text":"1 min","value":73},"end_location":{"e":33.7947154,"pb":-84.3845723},"maneuver":"turn-left","polyline":{"points":"svgmEj~`bO@m@@m@@]?C?U@K?I@QBW?Q@a@VoBPo@JW`@y@n@_ALOFKd@c@"},"start_location":{"e":33.79577829999999,"pb":-84.38773630000003},"travel_mode":"DRIVING","encoded_lat_lngs":"svgmEj~`bO@m@@m@@]?C?U@K?I@QBW?Q@a@VoBPo@JW`@y@n@_ALOFKd@c@","path":[{"e":33.79578,"pb":-84.38774000000001},{"e":33.795770000000005,"pb":-84.38751},{"e":33.79576,"pb":-84.38728},{"e":33.795750000000005,"pb":-84.38713000000001},{"e":33.795750000000005,"pb":-84.38711},{"e":33.795750000000005,"pb":-84.387},{"e":33.79574,"pb":-84.38694000000001},{"e":33.79574,"pb":-84.38689000000001},{"e":33.795730000000006,"pb":-84.38680000000001},{"e":33.79571,"pb":-84.38668000000001},{"e":33.79571,"pb":-84.38659000000001},{"e":33.795700000000004,"pb":-84.38642},{"e":33.79558,"pb":-84.38586000000001},{"e":33.79549,"pb":-84.38562},{"e":33.79543,"pb":-84.38550000000001},{"e":33.795260000000006,"pb":-84.38521},{"e":33.79502,"pb":-84.38489000000001},{"e":33.79495,"pb":-84.38481},{"e":33.79491,"pb":-84.38475000000001},{"e":33.794720000000005,"pb":-84.38457000000001}],"lat_lngs":[{"e":33.79578,"pb":-84.38774000000001},{"e":33.795770000000005,"pb":-84.38751},{"e":33.79576,"pb":-84.38728},{"e":33.795750000000005,"pb":-84.38713000000001},{"e":33.795750000000005,"pb":-84.38711},{"e":33.795750000000005,"pb":-84.387},{"e":33.79574,"pb":-84.38694000000001},{"e":33.79574,"pb":-84.38689000000001},{"e":33.795730000000006,"pb":-84.38680000000001},{"e":33.79571,"pb":-84.38668000000001},{"e":33.79571,"pb":-84.38659000000001},{"e":33.795700000000004,"pb":-84.38642},{"e":33.79558,"pb":-84.38586000000001},{"e":33.79549,"pb":-84.38562},{"e":33.79543,"pb":-84.38550000000001},{"e":33.795260000000006,"pb":-84.38521},{"e":33.79502,"pb":-84.38489000000001},{"e":33.79495,"pb":-84.38481},{"e":33.79491,"pb":-84.38475000000001},{"e":33.794720000000005,"pb":-84.38457000000001}],"instructions":"Turn <b>left</b> onto <b>Peachtree Cir NE</b>","start_point":{"e":33.79577829999999,"pb":-84.38773630000003},"end_point":{"e":33.7947154,"pb":-84.3845723}},{"distance":{"text":"0.6 mi","value":1001},"duration":{"text":"2 mins","value":127},"end_location":{"e":33.791499,"pb":-84.37669540000002},"maneuver":"turn-left","polyline":{"points":"_pgmEpj`bOy@oAe@s@S[O]GUEY?g@Bw@Du@Jw@ZaC?GFmC@c@Fg@Hi@LcA`@_CZc@Xc@`@]ZWFEJGNENENCP?L?RDJGHAX?f@?VBJ?d@I\\K^S^UP[JSLUH]BQLs@Zm@Tc@p@_A"},"start_location":{"e":33.7947154,"pb":-84.3845723},"travel_mode":"DRIVING","encoded_lat_lngs":"_pgmEpj`bOy@oAe@s@S[O]GUEY?g@Bw@Du@Jw@ZaC?GFmC@c@Fg@Hi@LcA`@_CZc@Xc@`@]ZWFEJGNENENCP?L?RDJGHAX?f@?VBJ?d@I\\K^S^UP[JSLUH]BQLs@Zm@Tc@p@_A","path":[{"e":33.794720000000005,"pb":-84.38457000000001},{"e":33.795010000000005,"pb":-84.38417000000001},{"e":33.7952,"pb":-84.38391},{"e":33.795300000000005,"pb":-84.38377000000001},{"e":33.79538,"pb":-84.38362000000001},{"e":33.79542,"pb":-84.38351},{"e":33.79545,"pb":-84.38338},{"e":33.79545,"pb":-84.38318000000001},{"e":33.79543,"pb":-84.3829},{"e":33.7954,"pb":-84.38263},{"e":33.79534,"pb":-84.38235},{"e":33.7952,"pb":-84.38170000000001},{"e":33.7952,"pb":-84.38166000000001},{"e":33.79516,"pb":-84.38095000000001},{"e":33.79515,"pb":-84.38077000000001},{"e":33.79511,"pb":-84.38057},{"e":33.79506,"pb":-84.38036000000001},{"e":33.794990000000006,"pb":-84.38002},{"e":33.79482,"pb":-84.37938000000001},{"e":33.79468,"pb":-84.37920000000001},{"e":33.79455,"pb":-84.37902000000001},{"e":33.794380000000004,"pb":-84.37887},{"e":33.79424,"pb":-84.37875000000001},{"e":33.794200000000004,"pb":-84.37872},{"e":33.794140000000006,"pb":-84.37868},{"e":33.79406,"pb":-84.37865000000001},{"e":33.793980000000005,"pb":-84.37862000000001},{"e":33.7939,"pb":-84.3786},{"e":33.79381,"pb":-84.3786},{"e":33.79374,"pb":-84.3786},{"e":33.79364,"pb":-84.37863},{"e":33.793580000000006,"pb":-84.37859},{"e":33.793530000000004,"pb":-84.37858000000001},{"e":33.793400000000005,"pb":-84.37858000000001},{"e":33.793200000000006,"pb":-84.37858000000001},{"e":33.79308,"pb":-84.3786},{"e":33.793020000000006,"pb":-84.3786},{"e":33.79283,"pb":-84.37855},{"e":33.792680000000004,"pb":-84.37849000000001},{"e":33.79252,"pb":-84.37839000000001},{"e":33.79236,"pb":-84.37828},{"e":33.79227,"pb":-84.37814},{"e":33.792210000000004,"pb":-84.37804000000001},{"e":33.79214,"pb":-84.37793},{"e":33.79209,"pb":-84.37778},{"e":33.79207,"pb":-84.37769},{"e":33.792,"pb":-84.37743},{"e":33.79186,"pb":-84.3772},{"e":33.79175,"pb":-84.37702},{"e":33.791500000000006,"pb":-84.37670000000001}],"lat_lngs":[{"e":33.794720000000005,"pb":-84.38457000000001},{"e":33.795010000000005,"pb":-84.38417000000001},{"e":33.7952,"pb":-84.38391},{"e":33.795300000000005,"pb":-84.38377000000001},{"e":33.79538,"pb":-84.38362000000001},{"e":33.79542,"pb":-84.38351},{"e":33.79545,"pb":-84.38338},{"e":33.79545,"pb":-84.38318000000001},{"e":33.79543,"pb":-84.3829},{"e":33.7954,"pb":-84.38263},{"e":33.79534,"pb":-84.38235},{"e":33.7952,"pb":-84.38170000000001},{"e":33.7952,"pb":-84.38166000000001},{"e":33.79516,"pb":-84.38095000000001},{"e":33.79515,"pb":-84.38077000000001},{"e":33.79511,"pb":-84.38057},{"e":33.79506,"pb":-84.38036000000001},{"e":33.794990000000006,"pb":-84.38002},{"e":33.79482,"pb":-84.37938000000001},{"e":33.79468,"pb":-84.37920000000001},{"e":33.79455,"pb":-84.37902000000001},{"e":33.794380000000004,"pb":-84.37887},{"e":33.79424,"pb":-84.37875000000001},{"e":33.794200000000004,"pb":-84.37872},{"e":33.794140000000006,"pb":-84.37868},{"e":33.79406,"pb":-84.37865000000001},{"e":33.793980000000005,"pb":-84.37862000000001},{"e":33.7939,"pb":-84.3786},{"e":33.79381,"pb":-84.3786},{"e":33.79374,"pb":-84.3786},{"e":33.79364,"pb":-84.37863},{"e":33.793580000000006,"pb":-84.37859},{"e":33.793530000000004,"pb":-84.37858000000001},{"e":33.793400000000005,"pb":-84.37858000000001},{"e":33.793200000000006,"pb":-84.37858000000001},{"e":33.79308,"pb":-84.3786},{"e":33.793020000000006,"pb":-84.3786},{"e":33.79283,"pb":-84.37855},{"e":33.792680000000004,"pb":-84.37849000000001},{"e":33.79252,"pb":-84.37839000000001},{"e":33.79236,"pb":-84.37828},{"e":33.79227,"pb":-84.37814},{"e":33.792210000000004,"pb":-84.37804000000001},{"e":33.79214,"pb":-84.37793},{"e":33.79209,"pb":-84.37778},{"e":33.79207,"pb":-84.37769},{"e":33.792,"pb":-84.37743},{"e":33.79186,"pb":-84.3772},{"e":33.79175,"pb":-84.37702},{"e":33.791500000000006,"pb":-84.37670000000001}],"instructions":"Turn <b>left</b> onto <b>The Prado NE</b>","start_point":{"e":33.7947154,"pb":-84.3845723},"end_point":{"e":33.791499,"pb":-84.37669540000002}},{"distance":{"text":"0.1 mi","value":233},"duration":{"text":"1 min","value":28},"end_location":{"e":33.7915614,"pb":-84.37430360000002},"maneuver":"turn-left","polyline":{"points":"{{fmEjy~aO?I?KBUFQCKMq@QeAM}@Gw@Au@FMBw@@CFOFODG"},"start_location":{"e":33.791499,"pb":-84.37669540000002},"travel_mode":"DRIVING","encoded_lat_lngs":"{{fmEjy~aO?I?KBUFQCKMq@QeAM}@Gw@Au@FMBw@@CFOFODG","path":[{"e":33.791500000000006,"pb":-84.37670000000001},{"e":33.791500000000006,"pb":-84.37665000000001},{"e":33.791500000000006,"pb":-84.37659000000001},{"e":33.79148,"pb":-84.37648},{"e":33.79144,"pb":-84.37639},{"e":33.79146,"pb":-84.37633000000001},{"e":33.79153,"pb":-84.37608},{"e":33.79162,"pb":-84.37573},{"e":33.79169,"pb":-84.37542},{"e":33.79173,"pb":-84.37514},{"e":33.791740000000004,"pb":-84.37487},{"e":33.791700000000006,"pb":-84.37480000000001},{"e":33.79168,"pb":-84.37452},{"e":33.79167,"pb":-84.37450000000001},{"e":33.791630000000005,"pb":-84.37442},{"e":33.79159,"pb":-84.37434},{"e":33.791560000000004,"pb":-84.3743}],"lat_lngs":[{"e":33.791500000000006,"pb":-84.37670000000001},{"e":33.791500000000006,"pb":-84.37665000000001},{"e":33.791500000000006,"pb":-84.37659000000001},{"e":33.79148,"pb":-84.37648},{"e":33.79144,"pb":-84.37639},{"e":33.79146,"pb":-84.37633000000001},{"e":33.79153,"pb":-84.37608},{"e":33.79162,"pb":-84.37573},{"e":33.79169,"pb":-84.37542},{"e":33.79173,"pb":-84.37514},{"e":33.791740000000004,"pb":-84.37487},{"e":33.791700000000006,"pb":-84.37480000000001},{"e":33.79168,"pb":-84.37452},{"e":33.79167,"pb":-84.37450000000001},{"e":33.791630000000005,"pb":-84.37442},{"e":33.79159,"pb":-84.37434},{"e":33.791560000000004,"pb":-84.3743}],"instructions":"Turn <b>left</b> to stay on <b>The Prado NE</b>","start_point":{"e":33.791499,"pb":-84.37669540000002},"end_point":{"e":33.7915614,"pb":-84.37430360000002}},{"distance":{"text":"20 ft","value":6},"duration":{"text":"1 min","value":0},"end_location":{"e":33.7916056,"pb":-84.3742681},"maneuver":"turn-left","polyline":{"points":"g|fmEjj~aOIE"},"start_location":{"e":33.7915614,"pb":-84.37430360000002},"travel_mode":"DRIVING","encoded_lat_lngs":"g|fmEjj~aOIE","path":[{"e":33.791560000000004,"pb":-84.3743},{"e":33.791610000000006,"pb":-84.37427000000001}],"lat_lngs":[{"e":33.791560000000004,"pb":-84.3743},{"e":33.791610000000006,"pb":-84.37427000000001}],"instructions":"Turn <b>left</b> onto <b>Piedmont Ave NE</b><div style=\"font-size:0.9em\">Destination will be on the right</div>","start_point":{"e":33.7915614,"pb":-84.37430360000002},"end_point":{"e":33.7916056,"pb":-84.3742681}}],"via_waypoint":[],"via_waypoints":[]}],"overview_polyline":{"points":"onhmE`}abOo@y@j@Wt@c@j@a@l@i@TUj@}@dBoCf@w@v@uANc@`@qAx@cDTk@T]RQRMVKZIj@EfAAD}BB}@Bi@@a@VoB\\gA`@y@n@_AT[d@c@y@oAy@oAWs@EaAHmBf@yDFuCHkAVmB`@_CZc@Xc@`@]b@]ZM^I^?RDJGb@A~@Bp@I|@_@^UP[Xi@Lo@Ls@Zm@fAcB?UJg@Q}@_@cCGw@Au@FMBw@HSLWIE"},"summary":"Peachtree St NW and The Prado NE","warnings":[],"waypoint_order":[],"overview_path":[{"e":33.799600000000005,"pb":-84.39265},{"e":33.79984,"pb":-84.39236000000001},{"e":33.799620000000004,"pb":-84.39224},{"e":33.799350000000004,"pb":-84.39206},{"e":33.799130000000005,"pb":-84.39189},{"e":33.7989,"pb":-84.39168000000001},{"e":33.798790000000004,"pb":-84.39157},{"e":33.798570000000005,"pb":-84.39126},{"e":33.79806,"pb":-84.39054},{"e":33.79786,"pb":-84.39026000000001},{"e":33.79758,"pb":-84.38983},{"e":33.7975,"pb":-84.38965},{"e":33.79733,"pb":-84.38924},{"e":33.79704,"pb":-84.38842000000001},{"e":33.79693,"pb":-84.38820000000001},{"e":33.796820000000004,"pb":-84.38805},{"e":33.79672,"pb":-84.38796},{"e":33.796620000000004,"pb":-84.38789000000001},{"e":33.7965,"pb":-84.38783000000001},{"e":33.79636,"pb":-84.38778},{"e":33.79614,"pb":-84.38775000000001},{"e":33.79578,"pb":-84.38774000000001},{"e":33.795750000000005,"pb":-84.38711},{"e":33.795730000000006,"pb":-84.38680000000001},{"e":33.79571,"pb":-84.38659000000001},{"e":33.795700000000004,"pb":-84.38642},{"e":33.79558,"pb":-84.38586000000001},{"e":33.79543,"pb":-84.38550000000001},{"e":33.795260000000006,"pb":-84.38521},{"e":33.79502,"pb":-84.38489000000001},{"e":33.79491,"pb":-84.38475000000001},{"e":33.794720000000005,"pb":-84.38457000000001},{"e":33.795010000000005,"pb":-84.38417000000001},{"e":33.795300000000005,"pb":-84.38377000000001},{"e":33.79542,"pb":-84.38351},{"e":33.79545,"pb":-84.38318000000001},{"e":33.7954,"pb":-84.38263},{"e":33.7952,"pb":-84.38170000000001},{"e":33.79516,"pb":-84.38095000000001},{"e":33.79511,"pb":-84.38057},{"e":33.794990000000006,"pb":-84.38002},{"e":33.79482,"pb":-84.37938000000001},{"e":33.79468,"pb":-84.37920000000001},{"e":33.79455,"pb":-84.37902000000001},{"e":33.794380000000004,"pb":-84.37887},{"e":33.794200000000004,"pb":-84.37872},{"e":33.79406,"pb":-84.37865000000001},{"e":33.7939,"pb":-84.3786},{"e":33.79374,"pb":-84.3786},{"e":33.79364,"pb":-84.37863},{"e":33.793580000000006,"pb":-84.37859},{"e":33.793400000000005,"pb":-84.37858000000001},{"e":33.79308,"pb":-84.3786},{"e":33.79283,"pb":-84.37855},{"e":33.79252,"pb":-84.37839000000001},{"e":33.79236,"pb":-84.37828},{"e":33.79227,"pb":-84.37814},{"e":33.79214,"pb":-84.37793},{"e":33.79207,"pb":-84.37769},{"e":33.792,"pb":-84.37743},{"e":33.79186,"pb":-84.3772},{"e":33.791500000000006,"pb":-84.37670000000001},{"e":33.791500000000006,"pb":-84.37659000000001},{"e":33.79144,"pb":-84.37639},{"e":33.79153,"pb":-84.37608},{"e":33.79169,"pb":-84.37542},{"e":33.79173,"pb":-84.37514},{"e":33.791740000000004,"pb":-84.37487},{"e":33.791700000000006,"pb":-84.37480000000001},{"e":33.79168,"pb":-84.37452},{"e":33.791630000000005,"pb":-84.37442},{"e":33.791560000000004,"pb":-84.3743},{"e":33.791610000000006,"pb":-84.37427000000001}]}') {
        $waypoints = $this->parseRoute($json_string);
        $nodeArray = ThreatType::model()->getSparklineData($waypoints);
        echo $nodeArray;
    }

}
