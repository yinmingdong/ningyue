/**
 * @description 气象数据展示
 * @author wuguoqiang
 * @date 2021.02.03
 */

var meteorologicalFun = {
    //time,iEle,altitude,areaCodeList
    add : function(callback){
        var iEle =  $('#accordion .active').attr('name');
        var time = $('.i_drag').attr('t');
        var mapColor = $('#accordion .active').attr('mapColor');
        if(!mapColor){
            mapColor = "#999"
        }

        //若当前为地形图或雷达图,则使透明度为0.7
        let opacityEle = 1;
        if(currentMap == "imagee" || currentMap == "dixing"){
            opacityEle = 0.7;
        }

        $(".leaflet-container").css("background",mapColor);

        //取当前时间往前最近的一个有气象数据的时刻，且若所选时刻超出气象数据覆盖时间范围i时,默认取最大或最小时间
        time = getMeteorologicalTime(time);

        //高亮当前时次
        $(".i_avbl .timeScaleThisTime").css("background","#fff910");
        $(".i_avbl .timeScaleThisTime[time="+time+"]").css("background","#f50101");

        //取消鼠标移动事件
        map.off('mousemove', map.meteoMouseMovefunc);

        if(iEle == "infImgs" || iEle == "visImgs" || iEle == "radarImgs"){
            if(!cloudImgList_top[time]){
                alert("气象数据未覆盖当前时间");
                return;
            }

            var imageBounds =[[cloudImgList_top.bbox.minlat,cloudImgList_top.bbox.minlon],[cloudImgList_top.bbox.maxlat,cloudImgList_top.bbox.maxlon]];

            //雷达通过i_now全局变量接收,以控制其透明度
            if(iEle == "radarImg"){
                i_now = L.imageOverlay(cloudImgList_top.host+cloudImgList_top[time], imageBounds, { opacity :opacityEle}).addTo(proGroup);
            }else{
                L.imageOverlay(cloudImgList_top.host+cloudImgList_top[time], imageBounds, { opacity :1}).addTo(proGroup);
            }
        }else{
            //通过时间和高度获取要加载的产品类型
            let dataTypeByTime = meteorologicalInfo.timeList[time];
            let dataTypeByAltitude = meteorologicalInfo.altitudeList[tem_now];
            let intersection = dataTypeByTime.filter(function (val) { return dataTypeByAltitude.indexOf(val) > -1 })

            //北京时间转世界时间
            time = dateFormat("YYYYmmddHHMMSS",timeZoneFormat( time,-8));

            for(let k = 0;k<intersection.length;k++){
                if(intersection[k] == "u" || intersection[k] == "v" || intersection[k] == "u10" || intersection[k] == "v10"){
                    continue;
                }

                let eleAreaCodeList = meteorologicalInfo.areaCodeList[intersection[k]];
                for(let p = 0;p<eleAreaCodeList.length;p++){
                    //判断文件类型
                    var fileType = meteorologicalInfo.fileType.split(",")[0];//文件类型
                    var fileSuffix = "";
                    if(meteorologicalInfo.fileType.split(",").length>=2){
                        fileSuffix = meteorologicalInfo.fileType.split(",")[1];
                    }

                    let queryPath = meteorologicalHost + "meteorological/queryAreaData?" +
                        "time="+time+"" +
                        "&altitude="+tem_now+"" +
                        "&dataType="+intersection[k]+"" +
                        "&areaCode="+eleAreaCodeList[p]+
                        "&fileType="+fileType+
                        "&suffix="+fileSuffix;

                    if(fileType == "binary"){

                        setTimeout(function(){
                            if(typeof callback === "function"){
                                callback();
                            }
                            loadColorMap(queryPath,iEle,opacityEle);

                        },500*p);
                    }else if(fileType == "image"){
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', queryPath, true);
                        xhr.responseType = "blob";
                        xhr.onload = function() {
                            if (this.status == 200) {
                                var blob = this.response;
                                var imgsrc = window.URL.createObjectURL(blob);

                                var imageBounds =[[meteorologicalInfo.latMin,meteorologicalInfo.lngMin],[meteorologicalInfo.latMax,meteorologicalInfo.lngMax]];

                                var image = new Image();
                                image.src =imgsrc;
                                image.onload = function(){
                                    if(typeof callback === "function"){
                                        callback();
                                    }
                                    //雷达通过i_now全局变量接收,以控制其透明度
                                    if(iEle == "radarImg"){
                                        i_now = L.imageOverlay(imgsrc, imageBounds, { opacity :opacityEle}).addTo(proGroup);
                                    }else{
                                        L.imageOverlay(imgsrc, imageBounds, { opacity :1}).addTo(proGroup);
                                    }
                                }
                            }
                        }
                        xhr.send()
                    }

                    drawWindData_top = [];//清空数据
                    var tooltipWind=L.tooltip({sticky:true,opacity:0.5});
                    if(intersection[k] == "wspd"){
                        let queryPathU = meteorologicalHost + "meteorological/queryAreaData?time="+time+"&altitude="+tem_now+"&dataType=u"+"&areaCode="+eleAreaCodeList[p];
                        let queryPathV = meteorologicalHost + "meteorological/queryAreaData?time="+time+"&altitude="+tem_now+"&dataType=v"+"&areaCode="+eleAreaCodeList[p];

                        //加载风流场
                        //Promise.all([loadParticleAnimator(queryPathU,"u"), loadParticleAnimator(queryPathV,"v")]).then(function(values) {
                        //    L.Layer.canvasLayer(drawParam_top, {density:2,galpha:0.8}).addTo(windGroup)
                        //})

                        Promise.all([loadParticleAnimator(queryPathU,2,2), loadParticleAnimator(queryPathV,3,2)]).then(function(values) {

                            WindJSLeaflet.init({
                                data:drawWindData_top,
                                localMode: true,
                                map: map,
                                //layerControl: layerControl,
                                useNearest: false,
                                timeISO: null,
                                nearestDaysLimit: 7,
                                displayValues: false,
                                displayOptions: {
                                    displayPosition: 'bottomleft',
                                    displayEmptyString: 'No wind data'
                                },
                                overlayName: 'wind',

                                // https://github.com/danwild/wind-js-server
                                //pingUrl: 'http://localhost:7000/alive',
                                //latestUrl: 'http://localhost:7000/latest',
                                //nearestUrl: 'http://localhost:7000/nearest',
                                errorCallback: function(e){
                                    console.log(e);
                                },
                                mouseMoveFunc:function(e){
                                    var pos = WindJSLeaflet._map.containerPointToLatLng(L.point(e.containerPoint.x, e.containerPoint.y));
                                    var gridValue = WindJSLeaflet._windy.interpolatePoint(pos.lng, pos.lat);

                                    if(gridValue){
                                        var vMs = gridValue[1];
                                        vMs = vMs > 0 ? vMs = vMs - vMs * 2 : Math.abs(vMs);

                                        var WindDirection=vectorToDegrees(gridValue[0], vMs);
                                        var WindSpeed= self.vectorToSpeed(gridValue[0], vMs).toFixed(1);

                                        tooltipWind.setLatLng([pos.lat,pos.lng]).setContent("<span><p>风速:"+WindSpeed+"m/s</p> <p>风向:"+WindDirection+"°</p></span>").addTo(windGroup);

                                    }else{
                                        tooltipWind.removeFrom(windGroup);
                                    }

                                }
                            });

                            setTimeout(function(){
                                WindJSLeaflet._canvasLayer.addTo(windGroup);
                                WindJSLeaflet._canvasLayer._onLayerDidMove();
                            },100)
                        })

                    }else if(intersection[k] == "wspd10"){
                        let queryPathU = meteorologicalHost + "meteorological/queryAreaData?time="+time+"&altitude="+tem_now+"&dataType=u10"+"&areaCode="+eleAreaCodeList[p];
                        let queryPathV = meteorologicalHost + "meteorological/queryAreaData?time="+time+"&altitude="+tem_now+"&dataType=v10"+"&areaCode="+eleAreaCodeList[p];

                        //加载风流场
                        //Promise.all([loadParticleAnimator(queryPathU,"u"), loadParticleAnimator(queryPathV,"v")]).then(function(values) {
                        //    L.Layer.canvasLayer(drawParam_top, {density:0.8,galpha:0.8}).addTo(windGroup)
                        //})

                        Promise.all([loadParticleAnimator(queryPathU,2,2), loadParticleAnimator(queryPathV,3,2)]).then(function(values) {
                            WindJSLeaflet.init({
                                data:drawWindData_top,
                                localMode: true,
                                map: map,
                                //layerControl: layerControl,
                                useNearest: false,
                                timeISO: null,
                                nearestDaysLimit: 7,
                                displayValues: false,
                                displayOptions: {
                                    displayPosition: 'bottomleft',
                                    displayEmptyString: 'No wind data'
                                },
                                overlayName: 'wind',

                                // https://github.com/danwild/wind-js-server
                                //pingUrl: 'http://localhost:7000/alive',
                                //latestUrl: 'http://localhost:7000/latest',
                                //nearestUrl: 'http://localhost:7000/nearest',
                                errorCallback: function(e){
                                    console.log(e);
                                },
                                mouseMoveFunc:function(e){
                                    var pos = WindJSLeaflet._map.containerPointToLatLng(L.point(e.containerPoint.x, e.containerPoint.y));
                                    var gridValue = WindJSLeaflet._windy.interpolatePoint(pos.lng, pos.lat);

                                    if(gridValue){
                                        var vMs = gridValue[1];
                                        vMs = vMs > 0 ? vMs = vMs - vMs * 2 : Math.abs(vMs);

                                        var WindDirection=vectorToDegrees(gridValue[0], vMs);
                                        var WindSpeed= self.vectorToSpeed(gridValue[0], vMs).toFixed(1);

                                        tooltipWind.setLatLng([pos.lat,pos.lng]).setContent("<span><p>风速:"+WindSpeed+"m/s</p> <p>风向:"+WindDirection+"°</p></span>").addTo(windGroup);

                                    }else{
                                        tooltipWind.removeFrom(windGroup);
                                    }

                                }
                            })

                            setTimeout(function(){
                                WindJSLeaflet._canvasLayer.addTo(windGroup);
                                WindJSLeaflet._canvasLayer._onLayerDidMove();
                            },100)
                        })
                    }
                }
            }
        }
    },
    del : function(){
        WindJSLeaflet._destroyWind();
        iconGroup.clearLayers();
        windGroup.clearLayers();
        proGroup.clearLayers();
        $(".leaflet-container").css("background","#999");
    },
    update : function(){
        meteorologicalFun.add(meteorologicalFun.del);
    }
}



/**
 * 查询并添加时间轴，根据时间轴向gis地图添加气象要素
 */
let cloudImgList_top = {};//卫星云图列表
let meteorologicalInfo = {};
let meteoInfoRequestUrl_top = null;
function add_time(){

    //判断查询起止时间
    //let queryTimeFrom = "v1";
    let queryTimeFrom = "d-10";
    let queryTimeTo = "";
    if(linePointsDistanceArr_top.length>0){
        //取航班时间节点全局变量,计算气象产品查询起止时间条件
        queryTimeFrom = "d"+(linePointsDistanceArr_top[0].timestamp - new Date().getTime() - 4*60*60*1000)/1000/60/60/24;
        queryTimeTo = (linePointsDistanceArr_top[linePointsDistanceArr_top.length-1].timestamp - new Date().getTime() +  4*60*60*1000)/1000/60/60/24;
    }


    hov_arr = [];
    drag_arr = [];
    trans_arr = [];
    state_arr = [];
//	var iEle = $('#qx_add .y_switch.active').attr('name');
    var iEle = $('#accordion .active').attr('name');
    var str = '';

    if(iEle == "visImgs" || iEle == "infImgs"){//卫星云图
        queryTimeFrom = "d-0.125";
        let gaofenQueryUrl = meteorologicalHost+"meteorological/getGaofenData?type="+iEle.replace("Img","");
        meteorologicalInfo.iEle = iEle.replace("Img","");
        meteorologicalInfo.timeSpan = 5;
        //查询时次、高度以及区域编号等
        $.ajax({
            type:"get",
            url:gaofenQueryUrl,
            async:true,
            success:function(data){
                data = JSON.parse(data.data)

                //清空
                meteorologicalFun.del();
                meteorologicalInfo.timeList = {};

                cloudImgList_top = {};
                cloudImgList_top.host = data.result.host;
                cloudImgList_top.bbox = data.result.bbox;

                for(let b = 0;b<data.result.series.length;b++){
                    //保证时间格式yyyyMMddHHmmss
                    if(data.result.series[b].time.length == 12){
                        data.result.series[b].time = data.result.series[b].time+"00";
                    }

                    if(!meteorologicalInfo.timeList.hasOwnProperty(data.result.series[b].time)){
                        meteorologicalInfo.timeList[data.result.series[b].time] = [meteorologicalInfo.iEle];
                    }else{
                        meteorologicalInfo.timeList[data.result.series[b].time].push(meteorologicalInfo.iEle);
                    }

                    cloudImgList_top[data.result.series[b].time] = data.result.series[b].img;
                }

                //若当前航班信息存在,则需要显示和航班时间融合的时间轴
                if(linePointsDistanceArr_top.length>0){
                    //预报和实况时间数组与航班时间数组合并
                    meteorologicalInfo.airTimeList = [];
                    linePointsDistanceArr_top.forEach(function(item,index){
                        //航班时间加入时间轴创建数组
                        let airTimeStr = dateFormat("YYYYmmddHHMM",new Date(item.timestamp));
                        meteorologicalInfo.airTimeList[airTimeStr] = [meteorologicalInfo.iEle];
                    })
                }

                //转数字并排序
                setTimeControll("ED8");

                //默认地面
                $('.i_fcst_tem').hide();

                //气象产品渲染
                meteorologicalFun.add();
            },
            error:function(){
                zeroModal.error({
                    content:"数据获取失败,请重试",
                    height:"200px"
                });
            }
        });
    }else if(iEle == "radarImgs"){//雷达图片
        queryTimeFrom = "d-0.125";
        let gaofenQueryUrl = meteorologicalHost+"meteorological/getGaofenData?type=radar";
        meteorologicalInfo.iEle = "dbz";
        meteorologicalInfo.timeSpan = 5;
        //查询时次、高度以及区域编号等
        $.ajax({
            type:"get",
            url:gaofenQueryUrl,
            async:true,
            success:function(data){
                data = JSON.parse(data.data)

                //清空
                meteorologicalFun.del();
                meteorologicalInfo.timeList = {};

                cloudImgList_top = {};
                cloudImgList_top.host = data.result.host;
                cloudImgList_top.bbox = {
                    "minlon":73,
                    "maxlon":135.5,
                    "minlat":12.15,
                    "maxlat":54.2
                }


                //预报时间
                let fcTimeList = [];
                for(let b = 0;b<data.result.fcImgSeries.imgs.length;b++){
                    //保证时间格式yyyyMMddHHmmss
                    if(data.result.fcImgSeries.times[b].length == 12){
                        data.result.fcImgSeries.times[b] = data.result.fcImgSeries.times[b]+"00";
                    }

                    if(!meteorologicalInfo.timeList.hasOwnProperty(data.result.fcImgSeries.times[b])){
                        meteorologicalInfo.timeList[data.result.fcImgSeries.times[b]] = [meteorologicalInfo.iEle];
                    }else{
                        meteorologicalInfo.timeList[data.result.fcImgSeries.times[b]].push(meteorologicalInfo.iEle);
                    }

                    fcTimeList.push(data.result.fcImgSeries.times[b]);
                    cloudImgList_top[data.result.fcImgSeries.times[b]] = data.result.fcImgSeries.imgs[b];
                }

                //若当前航班信息存在,则需要显示和航班时间融合的时间轴
                //if(linePointsDistanceArr_top.length>0){
                let rtTimeList=[];

                //取出实况时间,并将实况数据加入变量
                for(let b = 0;b<data.result.rtImgSeries.imgs.length;b++){
                    //保证时间格式yyyyMMddHHmmss
                    if(data.result.rtImgSeries.times[b].length == 12){
                        data.result.rtImgSeries.times[b] = data.result.rtImgSeries.times[b]+"00";
                    }

                    if(!meteorologicalInfo.timeList.hasOwnProperty(data.result.rtImgSeries.times[b])){
                        meteorologicalInfo.timeList[data.result.rtImgSeries.times[b]] = [meteorologicalInfo.iEle];
                    }else{
                        meteorologicalInfo.timeList[data.result.rtImgSeries.times[b]].push(meteorologicalInfo.iEle);
                    }

                    rtTimeList.push(data.result.rtImgSeries.times[b]);
                    cloudImgList_top[data.result.rtImgSeries.times[b]] = data.result.rtImgSeries.imgs[b];
                }

                //预报和实况时间数组合并
                let rtAndfcTimeList = rtTimeList.concat(fcTimeList);

                //将时间转化为时间戳
                rtAndfcTimeList.forEach(function(time,index){
                    rtAndfcTimeList[index] = (airTimeFormat(time,null,"ED8").getTime());
                });

                //预报和实况时间数组与航班时间数组合并
                meteorologicalInfo.airTimeList = [];
                linePointsDistanceArr_top.forEach(function(item,index){
                    //航班时间加入时间轴创建数组
                    let airTimeStr = dateFormat("YYYYmmddHHMM",new Date(item.timestamp));
                    meteorologicalInfo.airTimeList[airTimeStr] = [meteorologicalInfo.iEle];
                })
                //}

                setTimeControll("ED8");

                //默认地面
                $('.i_fcst_tem').hide();

                //气象产品渲染
                meteorologicalFun.add();
            },
            error:function(){
                zeroModal.error({
                    content:"数据获取失败,请重试",
                    height:"200px"
                });
            }
        });
    }else{
        if(iEle == "DCC" || iEle == "DSI" || iEle == "IRT" || iEle == "FOG" || iEle == "visImg" || iEle == "infImg" || iEle == "radarImg"){
            queryTimeFrom = "d-0.125";
        }

        meteoInfoRequestUrl_top = meteorologicalHost + 'meteorological/queryMeteorologicalInfo?dayBefore='+queryTimeFrom+'&dayAfter='+queryTimeTo+'&dataType='+iEle;

        //查询时次、高度以及区域编号等
        $.ajax({
            type:"get",
            url:meteoInfoRequestUrl_top,
            async:true,
            success:function(data){
                loadMeteoAfterMeteoInfo(iEle,data);

                //自动开启气象数据更新检测
                openMeteoTimeUpdate();
            },
            error:function(){
                zeroModal.error({
                    content:"数据获取失败,请重试",
                    height:"200px"
                });
            }
        });
    }

    $("#meteoLegendName").html($('#accordion .active').text()+"：");
    $("#meteoLegendTable").show();
    renderLegend(iEle);
}

/**
 *
 */
function loadMeteoAfterMeteoInfo(iEle,data){
    //清空
    meteorologicalFun.del();

    meteorologicalInfo = data.data;
    meteorologicalInfo.iEle = iEle;
    let SFC = "";

    //解析数据结果,获取高度集合及时间集合
    let altitudeList = new Array();
    for(let altitudeObjKey in data.data.altitudeList){
        if(altitudeObjKey == "SFC"){
            SFC = "SFC";
        }else{
            altitudeList.push(altitudeObjKey);
        }

    }

    //若只为地面，则不加载高度切换控件
    if(altitudeList.length >= 1){
        //高度列表数组转数字并排序
        altitudeList = altitudeList.map(Number);
        altitudeList.sort(function(a, b){return a-b});

        //加入地面高度
        if(SFC == "SFC"){
            altitudeList.splice(altitudeList.length,0,"SFC")
        }

        //若当前航班高度信息有值，则默认是在航班视角下显示气象要素，默认取航班飞行高度
        let initAltitude = altitudeList[altitudeList.length-1];
        if(airAltitude_top!=null){
            initAltitude = altitude2Hpa(airAltitude_top);//米转海拔高度
        }
        setAltitudeControll(altitudeList,initAltitude);
    }else{
        tem_now = "SFC";
        $('.i_fcst_tem').hide();
    }

    //时间转换为北京时间
    let ed8TimeList = {};
    for(let utcTime in meteorologicalInfo.timeList){
        ed8TimeList[airTimeFormat(utcTime,"YYYYmmddHHMMSS")]  = meteorologicalInfo.timeList[utcTime];
    }
    meteorologicalInfo.timeList = ed8TimeList;
    setTimeControll("ED8");

    //气象产品渲染
    meteorologicalFun.add();
}

/**
 *设置并打开高度控制控件
 */
function setAltitudeControll(altitudeArr,altitudeNow){
    let unit = "hpa"
    let altitudeUnit = "米";
    h_arr = altitudeArr;
    tem_now = altitudeNow;
    t_arr = [];

    for(let s = 0;s<h_arr.length;s++){
        if(h_arr[s] == "SFC"){
            t_arr[s]= "地面";
        }else{
            t_arr[s]="<p>"+h_arr[s]+unit+"</p><p>"+hpa2Altitude(h_arr[s])+altitudeUnit+"</p>";
        }
    }

    $('.t_drag').css({'top':250});
    $('.t_drag').html(t_arr[t_arr.length - 1]);


    if(h_arr.length > 0){
        for(var i = 0;i<h_arr.length;i++){
            if(altitudeNow!="SFC" && altitudeNow <= h_arr[i]){

                var iH = parseInt($('.t_line').css('height'));
                var iL = h_arr.length;

                var iT = i * (iH/iL) - 10;

                $('.t_drag').css({'top':iT});
                $('.t_drag').html(t_arr[i]);
                tem_now = h_arr[i];

                i = h_arr.length;

                break;
            }
        }
    }

    $('.i_fcst_tem').show();
}

/**
 * 设置并显示时间控件
 */
var timeSpanAll_top = 0; //时间轴时间跨度
var timeLineTimeList_top = new Array(); //时间轴所有时刻
var meteoTimeList_top = new Array(); //所有气象产品时刻
function setTimeControll(timeZone){
    if(!meteorologicalInfo.timeList){
        return;
    }

    //判断是否需要加载航班时间
    if($('#meteoSection').css("display") == "none"){
        $(".timer_box1").css("width","70%");
        $(".timer_box1").css("left","9%");
        $(".timer_box1").css("z-index","20");
        $(".timer_box1").css("bottom","4px");
        $(".timer_box1").css("bottom","4px");
        // if($(".v_atmos").css("display") == "block"){
        //     $(".timer_box1").css("bottom",$(".v_atmos").height()*0.9);
        // }else{
        //     $(".timer_box1").css("bottom","4px");
        // }

    }else{
        $(".timer_box1").css("width","96%");
        $(".timer_box1").css("bottom","320px");
        $(".timer_box1").css("left","2%");
        $(".timer_box1").css("z-index","21");
    }

    //时间轴距离容器左边距
    var timelineMarginLeft = parseInt($(".i_line").css("marginLeft").replace("px",""));

    //转数字并排序
    timeLineTimeList_top = new Array();
    meteoTimeList_top = new Array();
    for(let timeObjKey in meteorologicalInfo.timeList){
        meteoTimeList_top.push(timeObjKey);

        //取到小时
        let timeToHour = timeObjKey.substring(0,10);

        if(timeLineTimeList_top.indexOf(timeToHour) == -1){
            timeLineTimeList_top.push(timeToHour);
        }
    }

    //排序
    meteoTimeList_top = meteoTimeList_top.map(Number);
    meteoTimeList_top.sort(function(a, b){return a-b});

    if( meteorologicalInfo.airTimeList){
        for(let timeObjKey in meteorologicalInfo.airTimeList){
            //取到小时
            let timeToHour = timeObjKey.substring(0,10);

            if(timeLineTimeList_top.indexOf(timeToHour) == -1){
                timeLineTimeList_top.push(timeToHour);
            }
        }
    }

    timeLineTimeList_top = timeLineTimeList_top.map(Number);
    timeLineTimeList_top.sort(function(a, b){return a-b});

    //获取两个时间间隔之间连续的小时数
    let timestampSpan = airTimeFormat(timeLineTimeList_top[timeLineTimeList_top.length-1],null,timeZone).getTime() - airTimeFormat(timeLineTimeList_top[0],null,timeZone).getTime();
    let timeListPerHour = [];
    for(let s = 0;s<timestampSpan/(1000*60*60)+2;s++){
        timeListPerHour[s] = dateFormat("YYYYmmddHHMMSS",new Date(airTimeFormat(timeLineTimeList_top[0],null,timeZone).getTime()+s*1000*60*60));
    }

    timeLineTimeList_top = timeListPerHour;
    if(timeLineTimeList_top.length > 0){
        let timeInterval = parseInt((timeLineTimeList_top.length)/8) ==0?1: parseInt(timeLineTimeList_top.length/8);
        let stop = false;
        let str = "";

        let widthPeSpan = (100/(timeLineTimeList_top.length-1))*timeInterval

        for(var i = 0;i<timeLineTimeList_top.length;i++){
           if((i+1)*timeInterval<timeLineTimeList_top.length){
               let date = dateFormat("dd-HH:MM",airTimeFormat(timeLineTimeList_top[i*timeInterval]+"",null,timeZone));
               str += '<span style="text-align:left;width: '+widthPeSpan+'%" name="'+timeLineTimeList_top[timeLineTimeList_top.length-1]+'">' +date.split("-")[0]+"日"+date.split("-")[1]+'</span>';

           }

            let date2 = dateFormat("YYYY-mm-dd HH:MM:SS",airTimeFormat(timeLineTimeList_top[i]+"",null,timeZone));
            hov_arr.push(date2);
            drag_arr.push(date2);
            trans_arr.push(timeLineTimeList_top[i]);

        }

        let date1 = dateFormat("dd-HH:MM",airTimeFormat(timeLineTimeList_top[timeLineTimeList_top.length-1]+"",null,timeZone));
        str += '<span style="text-align:right;width:100px;position: absolute;right: -66px;" name="'+timeLineTimeList_top[timeLineTimeList_top.length-1]+'">' +date1.split("-")[0]+"日"+date1.split("-")[1]+'</span>';


        //若此时有航班数据展示,则在时间轴上添加航班起飞落地区间
        $("#airTimeSpanControlDIV").remove();
        $(".timeScaleThisTime").remove();

        //时间轴时间跨度
        timeSpanAll_top = airTimeFormat(timeLineTimeList_top[timeLineTimeList_top.length-1],null,timeZone).getTime() - airTimeFormat(timeLineTimeList_top[0],null,timeZone).getTime();
        //获取控件长度
        $(".timer_box1").css("opacity",0);
        $(".timer_box1").show();


        let timeControlLength = $(".i_line").width();
        $(".timer_box1").hide();
        $(".timer_box1").css("opacity",1);
        if(linePointsDistanceArr_top.length>0){

            //航班起飞时间与时间轴起始时间跨度
            let timeSpanETD = linePointsDistanceArr_top[0].timestamp - airTimeFormat(timeLineTimeList_top[0],null,timeZone).getTime();

            //航班落地时间与时间轴起始时间时间跨度
            let timeSpanETA = linePointsDistanceArr_top[linePointsDistanceArr_top.length-1].timestamp - airTimeFormat(timeLineTimeList_top[0],null,timeZone).getTime();

            //控件左侧距离时间轴最左侧距离百分比
            let marginLeftPer = timeSpanETD/timeSpanAll_top*100;

            //控件右侧距离时间轴最左侧距离百分比
            let marginRightPer = timeSpanETA/timeSpanAll_top*100;

            //控件长度百分比
            let lengthPer = marginRightPer - marginLeftPer;

            let timeSpanControlLength = timeControlLength*lengthPer/100;
            //创建航班起飞落地时间区间展示控件
            let timeSpanHtml = "<div id='airTimeSpanControlDIV' style=" +
                "'" +
                "height: 9px;" +
                "width:"+timeSpanControlLength+"px;" +
                "border-radius: 5px;" +
                "opacity: 1;" +
                "background: #86ef0d;" +
                "position: relative;" +
                "left:"+marginLeftPer+"%;" +
                "z-index: -1" +
                "'" +
                "></div>";
            $("#timerControlDiv").append(timeSpanHtml);

            //创建航班起飞时间展示控件
            let airETDTimeSpanHtml = "<div id='airETDTimeSpan' style='position: absolute;" +
                "top: -31px;" +
                "left:-60px;"+
                "background: #86ef0d;" +
                "font-size: 12px;" +
                "line-height: 25px;" +
                "width: 80px;" +
                "text-align: center;" +
                "color: #fff;" +
                "border-radius: 8px;" +
                "cursor: pointer;'>"+dateFormat("HH:MM",new Date(linePointsDistanceArr_top[0].timestamp))+"</div>";
            $("#airTimeSpanControlDIV").append(airETDTimeSpanHtml);

            //航班落地时间展示控件
            let airETATimeSpanHtml = "<div id='airETATimeSpan' style='position: absolute;" +
                "top: -31px;" +
                "left:"+(timeSpanControlLength-20)+"px;"+
                "background: #86ef0d;" +
                "font-size: 12px;" +
                "line-height: 25px;" +
                "width: 80px;" +
                "text-align: center;" +
                "color: #fff;" +
                "border-radius: 8px;" +
                "cursor: pointer;'>"+dateFormat("HH:MM",new Date(linePointsDistanceArr_top[linePointsDistanceArr_top.length-1].timestamp))+"</div>";
            $("#airTimeSpanControlDIV").append(airETATimeSpanHtml);
        }

        //气象产品时间在时间轴上的位置标识
        for(let time in meteorologicalInfo.timeList){
            //将时间字符串转换为北京时间时间戳以计算刻度距离最左边的百分比
            let timeSpanThisTime = airTimeFormat(time,null,timeZone).getTime() - airTimeFormat(timeLineTimeList_top[0],null,timeZone).getTime();
            let marginLeft = (timeSpanThisTime/timeSpanAll_top)*timeControlLength+timelineMarginLeft;

            let timeScaleHtml = "<div onmouse class='timeScaleThisTime' time='"+time+"' style='position: absolute;" +
                "left: "+marginLeft+"px;" +
                "height:9px;" +
                "width: 3px;" +
                "top:12px;" +
                "background: #fff910;" +
                "border-radius:4px;" +
                "display: inline-block;" +
                "'></div>"

            $(".i_avbl").append(timeScaleHtml);
        }
        $(".timer_box1").show();
        $('.i_tline').html(str);
        $('.i_drag').attr('st',meteoTimeList_top);

        //获取当前时间,若时间轴时间包含当前时间,则将时间轴定位到当前时间
        var nowDateFormated = dateFormat("YYYYmmddHHMMSS",new Date());

        //若当前时间轴已经设置了事件属性,则取其原有时间进行显示
        if($(".timer_box1 .i_drag").attr("t")){
            nowDateFormated = $(".timer_box1 .i_drag").attr("t");
        }
        re_drag(nowDateFormated);
        set_click();
    }
}


/**
 * 请求指定url并返回promise对象
 * @param url
 * @returns {Promise<unknown>}

function loadParticleAnimator(url,type) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function() {
            var binaryString = pako.ungzip(this.response, {
                to: 'string'
            });

            let objArray = binaryString.split(":::::");

            //数据请求结果
            let resultData = JSON.parse(objArray[0]);

            drawParam_top.interval_lat = resultData.resolution_lat; //空间分辨率
            drawParam_top.interval_lng = resultData.resolution_lng; //空间分辨率
            drawParam_top.interval = resultData.resolution_lat; //空间分辨率
            drawParam_top.latmax = resultData.latMax; //最大纬度
            drawParam_top.latmin = resultData.latMin; //最小纬度
            drawParam_top.lonmax = resultData.lngMax; //最大经度
            drawParam_top.lonmin = resultData.lngMin;  //最小经度
            drawParam_top.nlat= (resultData.latMax - resultData.latMin)/resultData.resolution_lat;
            drawParam_top.nlon= (resultData.lngMax - resultData.lngMin)/resultData.resolution_lng;

            drawParam_top[type] = JSON.parse(objArray[1]);
            resolve("success");
        }
        xhr.send();
    })
}
 */
/**
 * 发送请求,获取数据,气象数据渲染
 */
let drawParam_top = {};//色斑图渲染参数
function loadColorMap(PATH,ELE,opacityEle){
    if(!opacityEle){
        opacityEle = 1;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', PATH, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
        //二进制数据解压
        var binaryString = pako.ungzip(this.response, {
            to: 'string'
        });

        let objArray = binaryString.split(":::::");

        //数据请求结果
        let resultData = JSON.parse(objArray[0]);

        drawParam_top.interval_lat = resultData.resolution_lat; //空间分辨率
        drawParam_top.interval_lng = resultData.resolution_lng; //空间分辨率
        drawParam_top.latmax = resultData.latMax; //最大纬度
        drawParam_top.latmin = resultData.latMin; //最小纬度
        drawParam_top.lonmax = resultData.lngMax; //最大经度
        drawParam_top.lonmin = resultData.lngMin;  //最小经度
        drawParam_top.nlat= (resultData.latMax - resultData.latMin)/resultData.resolution_lat;
        drawParam_top.nlon= (resultData.lngMax - resultData.lngMin)/resultData.resolution_lng;
        objArray[1] = objArray[1].replace(/nan/g, "0")

        if(ELE =="DBZSWC"){
            //objArray[1] = objArray[1].replace(/0.0/g, "-1")
            //objArray[1] = objArray[1].replace(/-1.0/g, "0.1")
        }

        let o = JSON.parse(objArray[1]);//数值

        for(var i = 0; i < o.length; i++) {
            for(var j = 0; j < o[i].length; j++) {
                if(ELE == 'dew2'){
                    o[i][j] = o[i][j] -273.15;
                }
            }
        }

        drawParam_top.ele = ELE;
        drawParam_top.data = o;

        var rgba = colors[ELE];

        setTimeout(function(){
            if(proGroup.hasLayer(i_pre)){
                proGroup.removeLayer(i_pre);
            }
        },90);

        i_pre = i_now;
        i_now = L.tileLayer.drawImg(drawParam_top, {
            color: rgba, //阈值，必传参数
            tile_size: 129, //设置渲染分辨率，越大越清晰
            gradient: 0.25, //设置渐变度，越小渐变越小,最大0.5,0.25是完全渐变
            opacity: opacityEle,
            pane:'radar',
            noWrap:true
        }).addTo(proGroup);
    }

    xhr.send();
}

var drawWindData_top = [];
function loadParticleAnimator(url,number,category) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function() {
            var binaryString = pako.ungzip(this.response, {
                to: 'string'
            });

            let objArray = binaryString.split(":::::");

            //数据请求结果
            let resultData = JSON.parse(objArray[0]);

            let drawParam = {};
            var header={};

            header.dy = resultData.resolution_lat; //空间分辨率
            header.dx = resultData.resolution_lng; //空间分辨率
            header.la1 = resultData.latMax; //最大纬度
            header.la2 = resultData.latMin; //最小纬度
            header.lo2 = resultData.lngMax; //最大经度
            header.lo1 = resultData.lngMin;  //最小经度
            header.ny= (header.la1 -  header.la2)/resultData.resolution_lat+1;
            header.nx= (header.lo2 - header.lo1)/resultData.resolution_lng+1;
            header.parameterCategory = category;
            header.parameterNumber = number;
            header.numberPoints= header.nx*header.ny;

            var dateStr = objArray[1];
            var newDataStr = dateStr.replace(/\[|]/g,'');
            drawParam.data = newDataStr.split(",");
            drawParam.header = header;
            drawWindData_top.push(drawParam);
            resolve("success");
        }
        xhr.send();
    })
}

/**
 *根据任意时间获取离其最近的气象产品时次
 */
function getMeteorologicalTime (time){
    var currentTimeStr = "";
    if(time<=meteoTimeList_top[0]){
        currentTimeStr = meteoTimeList_top[0];
    }else if(time>=meteoTimeList_top[meteoTimeList_top.length-1]){
        currentTimeStr = meteoTimeList_top[meteoTimeList_top.length-1];
    }else{
        for(let k = 0;k<meteoTimeList_top.length;k++){
            if(time - meteoTimeList_top[k]<0){
                currentTimeStr = meteoTimeList_top[k - 1];
                break;
            }else if(time - meteoTimeList_top[k] == 0){
                currentTimeStr = meteoTimeList_top[k];
                break;
            }
        }
    }

    return currentTimeStr;
}

/**
 * 积冰数值格式化
 */
function icDataFormat(ic){
    if(ic<50){
        return "轻度";
    }else if(ic>=50 && ic<80){
        return "中度";
    }else if(ic>=80){
        return "严重";
    }
}

/**
 * 颠簸数值格式化
 */
function duttonDataFormat(dutton){
    if(dutton<25){
        return "无";
    }else if(dutton>=25 && dutton<30){
        return "轻度";
    }else if(dutton>=30 && dutton<35){
        return "中度";
    }else if(dutton>=35 && dutton<40){
        return "重度";
    }else if(dutton>=40){
        return "严重";
    }
}

/**
 * 打开气象产品时间同步
 */
var meteoTimeUpdateInterval_top = null;
function openMeteoTimeUpdate(){
    if(meteoTimeUpdateInterval_top!=null){
        clearInterval(meteoTimeUpdateInterval_top);
    }

    //每分钟做一次气象产品更新检查
    meteoTimeUpdateInterval_top = setInterval(function(){
        //查询时次、高度以及区域编号等
        $.ajax({
            type:"get",
            url:meteoInfoRequestUrl_top,
            async:true,
            success:function(data){
                var meteorologicalInfoNewDate = data.data;
                //比较产品时次是否有新增,有则更新页面时间轴
                for(var timeKey in meteorologicalInfoNewDate.timeList){
                    var keyJudge = timeKey+"";

                    //若当次请求的数据时次有原数据以外的时次，则判定数据有更新
                    if(!meteorologicalInfo.timeList.hasOwnProperty(airTimeFormat(keyJudge,"YYYYmmddHHMMSS"))){
                        $(".i_drag").attr("t",dateFormat("YYYYmmddHHMMSS",new Date()))
                        loadMeteoAfterMeteoInfo(meteorologicalInfo.iEle,data);
                        return;
                    }
                }
            }
        })
    },1*60*1000);
}