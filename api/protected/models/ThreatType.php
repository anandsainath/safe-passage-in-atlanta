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

        public function getCount() 
           {
               $sql = 'select count(*) as count from "tbl_ThreatData"';   

               $connection=Yii::app()->db;
               $command=$connection->createCommand($sql);
               $results=$command->queryAll();

               return empty($results[0]['count']) ? 0 : $results[0]['count'];
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
