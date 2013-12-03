<?php
$this->layout = "empty";

$base_url = Yii::app()->request->baseUrl;
$cs = Yii::app()->clientScript;
$cs->registerCssFile($base_url . '/bootstrap/css/bootstrap.min.css');
$cs->registerCssFile($base_url . '/css/nvd3/nv.d3.css');
$cs->registerScriptFile($base_url . '/lib/d3.v3.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/lib/nv.d3.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/lib/nvd3/interactiveLayer.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/lib/nvd3/stackedAreaChart.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/lib/nvd3/legend.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/lib/nvd3/scatter.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/lib/nvd3/stackedArea.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/lib/nvd3/tooltip.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/lib/nvd3/utils.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/lib/nvd3/axis.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/js/googleDirections.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/js/stackChart.js', CClientScript::POS_BEGIN);
?>
<script type="text/javascript">
    $(function() {
        $.googleDirections({
            onDataLoaded: function(data) {
                $.stackChart({
                    svgSelector: '#nodeLink > svg',
                    directions: data
                });

                $.stackChart.showStackedChart(0);
            }
        });
    });

    function googleMapsInitialized() {
        //function called once the google maps has been initialized..
        $.googleDirections.getDirections();
    }
</script>
<div id="nodeLink">
    <svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>
</div>