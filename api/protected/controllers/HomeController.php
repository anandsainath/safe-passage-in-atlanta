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

}
