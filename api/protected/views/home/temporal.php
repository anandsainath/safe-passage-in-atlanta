<?php
$this->layout = "empty";

$base_url = Yii::app()->request->baseUrl;
$cs = Yii::app()->clientScript;
$cs->registerCssFile($base_url . '/bootstrap/css/bootstrap.min.css');
$cs->registerScriptFile($base_url . '/lib/d3.v3.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/js/temporalOverview.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/js/temporalDetailed.js', CClientScript::POS_BEGIN);
?>

<script type="text/javascript">
    $(function() {
        $.getJSON("http://dev.infovis.com/temporal-view-data", function(data) {
            $.temporalOverview({
                svgSelector: '#viz > svg',
                data: data
            });

            $.temporalDetailed({
                svgSelector: '#detail > svg',
                data: data
            });
        });
    });
</script>

<div id="viz">
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
            <marker xmlns="http://www.w3.org/2000/svg" id="mkArrow20-16" viewBox="-15 -5 20 20" refX="0" refY="0" markerUnits="strokeWidth" markerWidth="20" markerHeight="16" orient="auto">
                <path d="M -15 -5 L 0 0 L -15 5 z" fill="black"/>
            </marker>
        </defs>
    </svg>
</div>
<div id="detail" style="position: absolute; top:0px; left: 500px;">
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">

    </svg>
</div>
