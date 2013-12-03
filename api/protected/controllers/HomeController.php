<?php

/**
 * The base controller of the project
 *
 * @author anandsainath
 */
class HomeController extends Controller {

    public function actionIndex() {
        $this->render('index');
    }

    public function actionStackedAreaChart() {
        $this->render('stacked_area_chart');
    }

    public function actionGetTemporalData() {
        $temporal = array();
        $crime_overall = range(0, 1, 0.01);
        $crime_per_time = range(0, 5);
        $violent = array(0, 0, 0, 0, 0, 1);

        $days_of_week = array("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday");
        $time_of_day = array("Early Morning", "Mid-Day", "Afternoon & Early Evening", "Late Evening");

        foreach ($days_of_week as $day) {
            $day_crime_stats = array(
                "day" => $day,
                "overall" => $crime_overall[array_rand($crime_overall)]
            );
            foreach ($time_of_day as $time) {
                $day_crime_stats["summary"][] = array(
                    "time" => $time,
                    "agg" => $crime_overall[array_rand($crime_overall)],
                    "violent" => $violent[array_rand($violent)]
                );
            }

            foreach ($time_of_day as $time) {
                $violent = array();
                $non_violent = array();
                for ($i = 0; $i < 12; $i++) {
                    $violent[] = $crime_per_time[array_rand($crime_per_time)];
                    $non_violent[] = $crime_per_time[array_rand($crime_per_time)];
                }
                $day_crime_stats["detailed"][] = array(
                    "time" => $time,
                    "violent" => $violent,
                    "non_violent" => $non_violent
                );
            }
            $temporal[] = $day_crime_stats;
        }
        echo CJSON::encode($temporal);
    }

    public function actionTemporalView() {
        $this->render('temporal');
    }

}
