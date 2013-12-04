<?php

/**
 * This is the model class for table "tbl_ThreatType".
 *
 * The followings are the available columns in table 'tbl_ThreatType':
 * @property integer $id_type
 * @property string $threat_type
 *
 * The followings are the available model relations:
 * @property TblThreatData[] $tblThreatDatas
 */
class ThreatType extends CActiveRecord
{
	/**
	 * @return string the associated database table name
	 */
	public function tableName()
	{
		return 'tbl_ThreatType';
	}

	/**
	 * @return array validation rules for model attributes.
	 */
	public function rules()
	{
		// NOTE: you should only define rules for those attributes that
		// will receive user inputs.
		return array(
			array('id_type, threat_type', 'required'),
			array('id_type', 'numerical', 'integerOnly'=>true),
			// The following rule is used by search().
			// @todo Please remove those attributes that should not be searched.
			array('id_type, threat_type', 'safe', 'on'=>'search'),
		);
	}
        
        public function constructPolyline($route) {
            $line_string = 'ST_setSRID(ST_MakeLine(ARRAY[';
            foreach ($route['points'] as $pointIndex=>$point) {
                $line_string .= 'ST_MakePoint('.$point['latitude'].",".$point['longitude'].'),';
            }
            $line_string = rtrim($line_string,',');
            $line_string .= ']),4326)';
            return $line_string;
        }

        public function getSparklineData($route) {
            $line_string = $this->constructPolyline($route);
            $sql_day = 'select day, count(*) as overall from "tbl_ThreatData" where ST_DWithin(location, '.$line_string.',.001) group by day order by overall desc';
            $connection=Yii::app()->db;
            $command=$connection->createCommand($sql_day);
            $results_day=$command->queryAll();
            foreach ($results_day as $result) {
                $overall[$result['day']] = $result['overall']/$results_day[0]['overall'];
            }
            $sql_heatmap = 'select day, shift, violentyn, count(*) as count from "tbl_ThreatData" where ST_DWithin(location, '.$line_string.',.001) group by day, shift, violentyn '
                    . 'UNION '
                    . 'select day, shift, NULL, count(*) as count from "tbl_ThreatData" where ST_DWithin(location, '.$line_string.',.001) group by day, shift '
                    . 'UNION '
                    . 'select day, NULL, NULL, count(*) as count from "tbl_ThreatData" where ST_DWithin(location, '.$line_string.',.001) group by day order by count desc, shift desc, violentyn desc';
            $connection=Yii::app()->db;
            $command=$connection->createCommand($sql_heatmap);
            $results_heatmap=$command->queryAll();
            $overall_max = -1;
            $agg_max = -1;
            $output = array();
            //return CJSON::encode($results_heatmap);
            foreach ($results_heatmap as $result) {
                if (is_null($result['shift']) && is_null($result['violentyn'])) {
                    if ($overall_max == -1) {
                        $overall_max = $result['count'];
                    }
                    $output[] = array(
                            'day' => $result['day'],
                            'overall' => $result['count']/$overall_max,
                            'summary' => array()
                            );
                } elseif (is_null($result['violentyn'])) {
                    if ($agg_max == -1) {
                        $agg_max = $result['count'];
                    }
                    foreach ($output as $key=>$dayIndex) {
                        if ($dayIndex['day'] == $result['day']) {
                            $summary = array(
                                'time' => $result['shift'],
                                'agg' => $result['count']/$agg_max
                            );
                            $output[$key]['summary'][] = $summary;
                        }
                    }
                } else {
                    foreach ($output as $key1=>$dayIndex) {
                        if ($dayIndex['day'] == $result['day']) {
                            foreach ($dayIndex['summary'] as $key2=>$summary) {
                                if ($summary['time'] == $result['shift']) {
                                    $output[$key1]['summary'][$key2]['violent'] = ($result['violentyn'] == 1) ? 1 : 0;
                                }
                            }
                        }
                    }
                }
            }
            
            function daySort ($a, $b) {
                $weekdays = array("Monday", "Tuesday","Wednesday","Thursday","Friday", "Saturday", "Sunday");
                return array_search($a['day'], $weekdays) - array_search($b['day'], $weekdays);
            }
            usort($output,"daySort");
            
            function timeSort ($a, $b) {
                $shifts = array("Morning", "Afternoon","Evening","Night");
                return array_search($a['time'], $shifts) - array_search($b['time'], $shifts);
            }
            foreach ($output as $dayID=>$day) {
                usort($output[$dayID]['summary'],"timeSort");
            }
            $sql_sparklines = 'select day, shift, microshift, violentyn, count(*) as count from "tbl_ThreatData" where ST_DWithin(location, '.$line_string.',.001) group by day, shift, microshift, violentyn order by shift,microshift';
            $connection=Yii::app()->db;
            $command=$connection->createCommand($sql_sparklines);
            $results_sparklines=$command->queryAll();

            foreach ($results_sparklines as $row) {
                $sparkline[$row['day']][$row['shift']][$row['microshift']][$row['violentyn']] = $row['count'];
            }
            
            foreach ($output as $dayID=>$day) {
                $shifts = array("Morning", "Afternoon","Evening","Night");
                foreach ($shifts as $shiftID=>$shift) {
                    $micro_violent = array();
                    $micro_nonviolent = array();
                    $micro_total = array();
                    $output[$dayID]['summary'][$shiftID]['row_index'] = $dayID;
                    $output[$dayID]['summary'][$shiftID]['col_index'] = $shiftID;
                    
                    for ($i = 0; $i < 6; $i++) {
                        if(array_key_exists($i,$sparkline[$day['day']][$shift])) {
                            if(array_key_exists('N',$sparkline[$day['day']][$shift][$i])) {
                                $micro_nonviolent[] = $sparkline[$day['day']][$shift][$i]['N'];
                            } else {
                                $micro_nonviolent[] = 0;
                            }
                            if(array_key_exists('Y',$sparkline[$day['day']][$shift][$i])) {
                                $micro_violent[] = $sparkline[$day['day']][$shift][$i]['Y'];
                            } else {
                                $micro_violent[] = 0;
                            }
                        }
                        else {
                            $micro_violent[] = $micro_nonviolent[] = 0;
                        }
                        $micro_total = array_map(function () {
                            return array_sum(func_get_args());
                        }, $micro_violent, $micro_nonviolent);
                    }
                    $output[$dayID]['detailed'][] = array(
                        'day' => $day['day'],
                        'time' => $shift,
                        'total' => $micro_total,
                        'non_violent' => $micro_violent,
                        'row_index' => $dayID,
                        'col_index' => $shiftID
                    );
                    $output[$dayID]['index'] = $dayID;
                }
            }
            
            return CJSON::encode($output);
        }
        
        public function constructTempTable($routes) {
                $connection=Yii::app()->db;
                $command=$connection->createCommand();
                $command->truncateTable('temp_waypoints');
                $shiftType = array('Morning','Afternoon','Evening','Night');
                $dayType = array('Monday','Tuesday','Wednesday','Thursday','Friday');
                $sql = 'insert into waypoints2 (point,majoryn,crimetype,day,shift) values ';
                foreach ($routes as $route) {
                    foreach ($route['points'] as $pointIndex=>$point) {
                        for ($threatType = 1; $threatType < 8; $threatType++) {
                            foreach ($dayType as $day) {
                                foreach ($shiftType as $shift)
                                    $sql .= "(ST_SetSRID(ST_MakePoint(".$point['latitude'].",".$point['longitude']."),4326),".$point['major'].",".$threatType.",'".$day."','".$shift."'),";
                            }
                        }
                    }
                }
                $line_string = $this->constructPolyline($routes[0]);
                $sql = rtrim($sql,',');
                $connection=Yii::app()->db;
                $command=$connection->createCommand($sql);
                $results=$command->queryAll();
                $sql = 'WITH route_crime as ('
                        . 'select * '
                        . 'from "tbl_ThreatData" '
                        . 'where ST_Distance_Sphere(location, '.$line_string.') < 100'
                        . ')'
                        . 'select location, count(route_crime.point) '
                        . 'from waypoints2,route_crime '
                        . 'where ST_DWithin(location,point,0.001)) '
                        . 'group by location';
                return $sql;
//                $sql="delete from temp_waypoints where point in (select point from waypoints)";
//                $connection=Yii::app()->db;
//                $command=$connection->createCommand($sql);
//                $results=$command->queryAll();
//                $sql="insert into waypoints select distinct * from temp_waypoints";
//                $connection=Yii::app()->db;
//                $command=$connection->createCommand($sql);
//                $results=$command->queryAll();
//                $sql = 'update temp_points set count = (select count(*) as count from "tbl_ThreatData" t where id_threattype = crimetype and temp_points.day = t.day and temp_points.shift = t.shift and ST_Distance_Sphere(location,point) < 100) where count is null';
//                $connection=Yii::app()->db;
//                $command=$connection->createCommand($sql);
//                $results=$command->queryAll();
        }
        
        public function getCountAndType($routes) 
           {
                $connection=Yii::app()->db;
                $command=$connection->createCommand();
                $command->truncateTable('temp_points');
                $sql = 'insert into temp_points (point) values ';
                foreach ($routes as $route) {
                    foreach ($route['points'] as $point) {
                        if ($point['majoryn'] == 'true') {
                            $sql .= "(ST_MakePoint(".$point['latitude'].",".$point['longitude'].")),";
                        }
                    }
                }
                $sql = rtrim($sql,',');
                $connection=Yii::app()->db;
                $command=$connection->createCommand($sql);
                $results=$command->queryAll();
              //return $sql;
                $sql = 'update temp_points set count = (select count(location) as count from "tbl_ThreatData" where ST_Distance_Sphere(location,point) < 100)';
                $connection=Yii::app()->db;
                $command=$connection->createCommand($sql);
                $results=$command->queryAll();
                $sql = 'update temp_points set type = (select count(id_threattype) as count from "tbl_ThreatData" where ST_Distance_Sphere(location,point) < 100 group by id_threattype order by count)';
                $connection=Yii::app()->db;
                $command=$connection->createCommand($sql);
                $results=$command->queryAll();
                return "Success";
                //$command->truncateTable('temp_points');
                  
//                $sql = 'select "tbl_ThreatType".threat_type as threatid, count("tbl_ThreatData".location) as count from "tbl_ThreatData","tbl_ThreatType" where "tbl_ThreatType".id_type = "tbl_ThreatData".id_threattype and ST_Distance_Sphere(location,ST_MakePoint(:lat, :lng)) < 100 group by "tbl_ThreatType".threat_type
//                         UNION
//                         select NULL,count("tbl_ThreatData".location) as count from "tbl_ThreatData" where ST_Distance_Sphere(location,ST_MakePoint(:lat, :lng)) < 100
//                         order by count desc';
//                $connection=Yii::app()->db;
//                $command=$connection->createCommand($sql);
//                $command->bindParam(":lat",$lat);
//                $command->bindParam(":lng",$lng);
//                $results=$command->queryAll();
//                return array('count'=>$results[0]['count'], 'maxcrimetype'=>$results[1]['threatid']);
           }
	/**
	 * @return array relational rules.
	 */
	public function relations()
	{
		// NOTE: you may need to adjust the relation name and the related
		// class name for the relations automatically generated below.
		return array(
			'tblThreatDatas' => array(self::HAS_MANY, 'TblThreatData', 'id_threattype'),
		);
	}

	/**
	 * @return array customized attribute labels (name=>label)
	 */
	public function attributeLabels()
	{
		return array(
			'id_type' => 'Id Type',
			'threat_type' => 'Threat Type',
		);
	}

	/**
	 * Retrieves a list of models based on the current search/filter conditions.
	 *
	 * Typical usecase:
	 * - Initialize the model fields with values from filter form.
	 * - Execute this method to get CActiveDataProvider instance which will filter
	 * models according to data in model fields.
	 * - Pass data provider to CGridView, CListView or any similar widget.
	 *
	 * @return CActiveDataProvider the data provider that can return the models
	 * based on the search/filter conditions.
	 */
	public function search()
	{
		// @todo Please modify the following code to remove attributes that should not be searched.

		$criteria=new CDbCriteria;

		$criteria->compare('id_type',$this->id_type);
		$criteria->compare('threat_type',$this->threat_type,true);

		return new CActiveDataProvider($this, array(
			'criteria'=>$criteria,
		));
	}

	/**
	 * Returns the static model of the specified AR class.
	 * Please note that you should have this exact method in all your CActiveRecord descendants!
	 * @param string $className active record class name.
	 * @return ThreatType the static model class
	 */
	public static function model($className=__CLASS__)
	{
		return parent::model($className);
	}
}