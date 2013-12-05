<?php
$this->layout = "infovis";

$base_url = Yii::app()->request->baseUrl;
$cs = Yii::app()->clientScript;
$cs->registerCssFile($base_url . '/css/nvd3/nv.d3.css');

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
$cs->registerScriptFile($base_url . '/lib/caged.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/js/stackChart.js', CClientScript::POS_BEGIN);

$cs->registerScriptFile($base_url . '/js/temporalOverview.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/js/temporalDetailed.js', CClientScript::POS_BEGIN);
?>

<script type="text/javascript">
    $(function() {
        $(document).on('click', '#use-case-route > li', function() {
            $('.modal').show();
            var data = $(this).data('route');
            var wayPoints = data.route;
            var from = wayPoints.splice(0, 1)[0],
                    to = wayPoints.pop();
            $.googleDirections.getDirections(from, to, wayPoints, data.mode);
        });
    });
</script>
<style type="text/css">
    .bottom-div{
        position:absolute; 
        bottom:0px;
        top:280px;
        width: 100%;
    }

    .absolute-div{
        position: absolute;
    }

    .area-chart{
        position: relative;
        left: 120px;
    }

    .content{
        clear: left;
        left: 10%;
    }


    .d3-tip {
        line-height: 1;
        font-weight: bold;
        padding: 8px;
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        border-radius: 2px;
    }

    /* Creates a small triangle extender for the tooltip */
    .d3-tip:after {
        box-sizing: border-box;
        display: inline;
        font-size: 8px;
        width: 100%;
        line-height: 1;
        color: rgba(0, 0, 0, 0.8);
        content: "\25BC";
        position: absolute;
        text-align: center;
    }

    /* Style northward tooltips differently */
    .d3-tip.n:after {
        margin: -1px 0 0 0;
        top: 100%;
        left: 0;
    }

</style>
<div id="right-bar" style="position: absolute; right:10%;">
    <ul id="use-case-route" style="list-style: none;">
        <li data-route='{"route":["1482 Monroe Dr NE, Atlanta, GA 30324", "Eastside Trail, Atlanta, GA 30312"], "mode": "walk"}'>Jogger's Route</li>
        <li data-route='{"route":["404 Dollar Mill Rd SW, Atlanta, GA 30331", "Adamsville Elementary School, 286 Wilson Mill Rd SW, Atlanta, GA 30331"], "mode": "walk"}'>School Route 1</li>
        <li data-route='{"route":["Ontario Park, Atlanta, GA 30310", "2257 Bollingbrook Dr SW, Atlanta, GA 30311"], "mode": "walk"}'>School Route 2</li>
        <li data-route='{"route":["Tech Green, Atlanta, GA 30332", "672 11th St NW, Atlanta, GA 30318"], "mode": "walk"}'>School Route 3</li>
        <li data-route='{"route":["1130 Juniper St NE, Atlanta, GA 30309", "239 Bobby Dodd Way NW, Atlanta, GA 30313"], "mode": "walk"}'>Bar Trip 1</li>
        <li data-route='{"route":["427 Edgewood Avenue Southeast, Atlanta, GA, United States", "231 Bobby Dodd Way Northwest, Atlanta, GA, United States"], "mode": "walk"}'>Bar Trip 2</li>
        <li data-route='{"route":["832 Neal St NW, Atlanta, GA 30318", "85 Maple St NW, Atlanta, GA 30318"], "mode": "walk"}'>Marta Commuter</li>
        <li data-route='{"route":["Greensward Path, Atlanta, GA, United States", "Westminster Drive Northeast, Atlanta, GA, United States", "Rose Garden Trail, Atlanta, GA, United States", "582 10th Street Northeast, Atlanta, GA, United States"], "mode": "drive"}'></li>
    </ul>
</div>
<div id="page1" style="margin-top: 20px;">
    <div class="btn-group" style="margin-top: 20px;">
        <button type="button" id="actual" class="btn btn-default js-btn">Actual Representation</button>
        <button type="button" id="simplified" class="btn btn-default js-btn">Simplified Representation</button>
    </div>
    <div id="nodeLink" style="margin-left: 30%;">
        <svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>
    </div>
</div>
<div id="page2" style="margin-top: 20px; display: none;">
    <div id="stackedAreaChart" class="absolute-div">
        <svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="area-chart"></svg>
    </div>
    <div id="bottom-div" class="bottom-div">
        <div class="btn-group">
            <button type="button" data-href="#overview" id="overview-tab" class="btn btn-default btn-xs js-tab-btn">Temporal Overview</button>
            <button type="button" data-href="#detailed" id="detailed-tab" class="btn btn-default btn-xs js-tab-btn">Temporal Detailed</button>

            <div id="tabs" class="itabs">
                <div id="overview" class="content js-active-tab">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <defs>
                            <marker xmlns="http://www.w3.org/2000/svg" id="mkArrow20-16" viewBox="-15 -5 20 20" refX="0" refY="0" markerUnits="strokeWidth" markerWidth="20" markerHeight="16" orient="auto">
                                <path d="M -15 -5 L 0 0 L -15 5 z" fill="black"/>
                            </marker>
                        </defs>
                    </svg>
                </div>
                <div id="detailed" class="content" style="display: none;">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">

                    </svg>
                </div>
            </div>
        </div>
    </div>
</div>
