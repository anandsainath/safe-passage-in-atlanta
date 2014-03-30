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

$cs->registerScriptFile($base_url . '/js/temporalOverview.js', CClientScript::POS_BEGIN);
$cs->registerScriptFile($base_url . '/js/temporalDetailed.js', CClientScript::POS_BEGIN);
?>
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
        top: 50px;
        left: 120px;
    }

    .content{
        clear: left;
        left: 10%;
    }

</style>
<script type="text/javascript">
    $(function() {
        $.googleDirections({
            onDataLoaded: function(data) {
                $.stackChart({
                    svgSelector: '#stackedAreaChart > svg',
                    directions: data
                });

                $.stackChart.showStackedChart(0);
            }
        });

//        $.getJSON("http://dev.infovis.com/temporal-view-data", function(data) {
//            console.log("WRONG WRONG WRONG!!");
//            $.temporalOverview({
//                svgSelector: '#overview > svg',
//                data: data,
//                onEventOccured: function(eventType, isSelected, eventArgs) {
//                    console.log(eventType, isSelected, eventArgs);
//                }
//            });
//
//            $.temporalDetailed({
//                svgSelector: '#detailed > svg',
//                data: data,
//                onEventOccured: function(eventType, isSelected, eventArgs) {
//                    console.log(eventType, isSelected, eventArgs);
//                }
//            });
//        });

        $('.js-tab-btn').click(function() {
            var targetID = $(this).data('href');
            $('.js-active-tab').fadeOut('slow', function() {
                $(this).removeClass('js-active-tab').hide();
                $(targetID).fadeIn('slow', function() {
                    $(this).addClass('js-active-tab').show();
                });
            });
        });
    });

    function googleMapsInitialized() {
        //function called once the google maps has been initialized..
        $.googleDirections.getDirections();
    }
</script>


<div id="stackedAreaChart" class="absolute-div">
    <svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="area-chart"></svg>
</div>
<div id="bottom-div" class="bottom-div">
    <div class="btn-group" style="margin-top: 5px; left: 40%;">
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