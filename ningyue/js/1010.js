console.log("fun")
var tem_now = 1000;
//强对流监测暂时隐藏
var toggle = false;
var interTime,t_out,i_pre,i_now,proInter,windEvents,iLe;
var point_arr = [];
var point_arr_raofei=[];
var angle_arr = [];
var hov_arr = [];
var drag_arr = [];
var trans_arr = [];
var state_arr = [];
var flightGroup = new L.layerGroup().addTo(map);//航班
var flightsGroup = new L.layerGroup().addTo(map);//机场
var eleGroup = new L.layerGroup().addTo(map);//实时雷达
var airGroup = new L.layerGroup().addTo(map);//飞机
var mkerGroup = new L.layerGroup().addTo(map);//飞机
var proGroup = new L.layerGroup().addTo(map);
var windGroup = new L.layerGroup().addTo(map);
var iconGroup = new L.layerGroup().addTo(map);
var ls_marker=new L.layerGroup().addTo(flightsGroup);//机场--点
var i_ar = ['flight_threat','vis','wind','temper','pre','crosswind'];
var i_co = ['ts_risk_level','vis_risk_level','wind_risk_level','temp_risk_level','pre_risk_level','crosswind_risk_level'];
var i_da = ['ts_risk','vis_risk','wind_risk','temp_risk','pre_risk','crosswind_risk'];
var i_cha = ['ts_dbz','vis','win_s','temperature','precipitation','crosswin_s'];
var h_arr = [200,500,700,850,925,975,1000];
var t_arr = ['200hpa</br>11.7km FL390','500hpa</br>5500m FL180','700hpa</br>3000m FL100','850hpa</br>1500m 5000ft','925hpa</br>750m 2500ft','975hpa</br>300m 984ft','地面'];
var runwayInfo ={};
var messTimer;
var thDate = {};
//飛機圖標
var airPortIcon_top =L.icon({
    iconUrl: 'img/320_up.png',
    iconSize: [30, 30],
    iconAnchor: [20, 25]
});

var bigIcon = L.icon({
    iconUrl: 'img/320_up.png',
    iconSize: [20, 20],
    iconAnchor: [13, 20]
});
var midIcon = L.icon({
    iconUrl: 'img/320_up.png',
    iconSize: [25, 25],
    iconAnchor: [15, 25]
});
var smlIcon = L.icon({
    iconUrl: 'img/320_up.png',
    iconSize: [30, 30],
    iconAnchor: [40, 25]
});



function setMyIcon(){
    var zoom = map.getZoom();
    if(zoom<=6){
        var myIcon = bigIcon;
    }else if(zoom>=7&&zoom<=8){
        var myIcon = midIcon;
    }else if(zoom>8){
        var myIcon = smlIcon;
    }
    return myIcon;
}

var iIcon = function(HTML){
    return L.divIcon({
        className:"b",
        iconAnchor:[-17,70],
        html:HTML
    })
}
var nameIcon = function(html) {
    return L.divIcon({
        className: "b",
        iconAnchor: [-3, 10],
        html: '<div class="y_name">' + html + '</div>'
    })
}

var planeDetailIcon = function(html) {
    return L.divIcon({
        className: "b",
        iconAnchor: [-3, 10],
        html: '<div class="plane_detail_div"><svg onclick="closePlaneDetailTooltip()" style="position: absolute;top: 7px;right: 5px" t="1617173749420" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8765" width="16" height="16"><path d="M5.12 5.12v1013.76h1013.76V5.12H5.12z m874.5984 867.9424c-4.7104 11.264-15.6672 18.6368-27.8528 18.6368-7.9872 0-15.7696-3.1744-21.4016-8.9088L487.3216 540.16 144.1792 882.7904c-5.632 5.632-13.4144 8.9088-21.4016 8.9088-12.288 0-23.3472-7.2704-28.0576-18.6368-4.7104-11.264-2.048-24.3712 6.656-32.9728l343.1424-342.6304L101.376 154.7264c-11.776-11.776-11.776-30.9248 0-42.7008 11.8784-11.776 31.0272-11.776 42.8032 0L487.3216 454.656 830.464 112.0256c11.9808-10.8544 30.4128-10.4448 41.7792 1.024a30.1568 30.1568 0 0 1 0.9216 41.7792l-343.04 342.528 343.2448 342.7328c8.4992 8.704 11.0592 21.7088 6.3488 32.9728z" fill="white" p-id="8766"></path></svg>' + html + '</div>'
    })
}


function get_r(){
    var i,j;
    i = map.getZoom();
    if(i > 6){
        j = 6;
    }else{
        j = 3;
    }
    return j;
}
function get_w(){
    var i,j;
    i = map.getZoom();
    if(i > 6){
        j = 2;
    }else{
        j = 1;
    }
    return j;
}

function clear_inter(){
    if($('#to_play').attr('src') == 'img/stop.png'){
        $('#to_play').trigger('click');
    }
    if($('#to_play_meteo').attr('src') == 'img/stop.png'){
        $('#to_play_meteo').trigger('click');
    }
}

//机场
//初始显示航班，不显示点
//点击机场地图显示机场位置
function showPort(arr){
    if(map.getZoom() < 7){
        map.flyTo(arr,7);
    }else{
        map.flyTo(arr,map.getZoom());
    }
}
function showPort1(arr){
    map.setView(arr);
}

//机场点对象
var allAirports_top = {};
function load_allports(){
    var allPots = 'ALL';
    var allPotsTH = authManage.airportPer_TH;
    $.ajax({
        type:"get",
        url:IP8081_1+"file/getPrewarn",
        data:{
            air:allPots,
            airTH:allPotsTH,
            type:"warn"
        },
        success:function(data){
            var arr = data.data;
            arr.forEach(function(e){
                //地图位置
                let y_marker = L.userMarker([e.LAT,e.LON],
                    {smallIcon:true,twinkling: true}).addTo(flightsGroup);

                //支线机场或干线机场,设置图标大小
                if(e.is_mainline != 1){//支线机场
                    $(y_marker._icon).find(".leaflet-usermarker-iconSvg").attr("width","15");
                    $(y_marker._icon).find(".leaflet-usermarker-iconSvg").attr("height","15");
                }

                //添加机场三字码
                y_marker.threeCode = e.ID_three;
                $(y_marker._icon).append("<span class='airport_icon_three_code'>"+e.ID_three+"</span>");

                y_marker.level = -1;//预警等级默认为-1\
                y_marker.msg = e;
                y_marker.is_mainline = e.is_mainline;
                $(y_marker._icon).attr("level",1);

                allAirports_top[e.ID_four] = y_marker;

                var ID_four = e.ID_four;
                var LAT=e.LAT;
                var LON=e.LON;
                y_marker.on("mouseover", function() {
                    n_marker = L.marker([e.LAT, e.LON], {
                        icon: nameIcon(e.Name_zh + " / " + e.ID_four),
                        pane: "flightName"
                    }).addTo(flightsGroup);
                })
                y_marker.on("mouseout", function() {
                    flightsGroup.removeLayer(n_marker);
                })
                if(authManage.airportPer_TH!=null) { //通航账户特殊处理======/authManage.airportPer == "TH"
                    y_marker.on('click', function(e) {
                        L.DomEvent.stopPropagation(e);
                        /*===========加载时序图弹窗=============*/
                        loadDiagramPop(LAT, LON);
                    })
                } else {
                    y_marker.on('click', function(e) {
                        L.DomEvent.stopPropagation(e);
                        $(".flights>li>span[four='"+ID_four+"']").click();
                        //showBottom(e.latlng.lat,e.latlng.lng,ID_four);
                    })
                }
            })
        }
    });
}
function add_airports(){
    if(authManage.depart == 3){
        var allPots = 'ALL';
    }else{
        var allPots = authManage.airportPer;
    }
    var allPotsTH = authManage.airportPer_TH;
    $.ajax({
        type:"get",
        url:IP8081_1+"file/getPrewarn",
        data:{
            air:allPots,
            airTH:allPotsTH
        },
        async:true,
        success:function(data){
            var ok_str = '';
            var no_str = '';
            var ok = 0;
            var no = 0;
            var arr = data.data;
            var itemArr=new Array();
            var item_str="";
//	        var ju0 = 0;
            arr.forEach(function(e){
                //预警显示
              //  var color = sel_color1(e.other,e.ld);
                var color = e.color;
                if(color == 'green'){
                    if(e.ID_four==null){
                        ok_str += '<li class="'+e.ID_four+'"><img src="../images/green.png"><span lon="'+e.LON+'" lat="'+e.LAT+'" four="'+e.ID_four+'" three="'+e.ID_three+'" class="'+color+'" title="'+e.Name_zh+'">'+e.Name_zh+'</span></li>';
                    }else{
                        ok_str += '<li class="'+e.ID_four+'"><img src="../images/green.png"><span lon="'+e.LON+'" lat="'+e.LAT+'" four="'+e.ID_four+'" three="'+e.ID_three+'" class="'+color+'" title="'+e.Name_zh+'/'+e.ID_four+'">'+e.Name_zh+'/'+e.ID_four+'</span></li>';
                    }
                    ok += 1;
                }else{
                   /* if(e.ID_four==null){
                        var nostr='<li><span lon="'+e.LON+'" lat="'+e.LAT+'" four="'+e.ID_four+'" three="'+e.ID_three+'" class="'+color+'" title="'+e.Name_zh+'">'+e.Name_zh+'</span></li>';
                    }else{
                        var nostr='<li><span lon="'+e.LON+'" lat="'+e.LAT+'" four="'+e.ID_four+'" three="'+e.ID_three+'" class="'+color+'" title="'+e.Name_zh+'/'+e.ID_four+'">'+e.Name_zh+'/'+e.ID_four+'</span></li>';
                    }*/
                    if(color == 'red'){
                        var nostr='<li class="'+e.ID_four+'"><img src="../images/red.png"><span lon="'+e.LON+'" lat="'+e.LAT+'" four="'+e.ID_four+'" three="'+e.ID_three+'" class="'+color+'" title="'+e.Name_zh+'/'+e.ID_four+'">'+e.Name_zh+'/'+e.ID_four+'</span></li>';
                        itemArr.unshift(nostr);
                    }else if(color == 'yellow'){
                        var nostr='<li class="'+e.ID_four+'"><img src="../images/yellow.png"><span lon="'+e.LON+'" lat="'+e.LAT+'" four="'+e.ID_four+'" three="'+e.ID_three+'" class="'+color+'" title="'+e.Name_zh+'/'+e.ID_four+'">'+e.Name_zh+'/'+e.ID_four+'</span></li>';
                        itemArr.push(nostr);
                    }
                }
            })
            itemArr.forEach(function(e){
                item_str+=e;
            })
            $('.airport .ok_air .flights').html(ok_str);
            $('.airport .ok_air .title span:last-child').html('共'+ok+'条');
            $('.airport .no_air .flights').html(item_str);
            $('.airport .no_air .title span:last-child').html('共'+itemArr.length+'条');

            $('body').on("click",".airport .flights>li span",function(){
                $('.airport .flights li span').css("color","white")
                $(this).css("color","#96AFEE")
                flightsGroup.removeLayer(ls_marker);
                var sArr = [$(this).attr('lat'),$(this).attr('lon')];
                var str = $(this).html();
                ls_marker = L.marker(sArr, {
                    icon: nameIcon(str),
                    pane: "flightName"
                }).addTo(flightsGroup);

                setTimeout(function(){
                    flightsGroup.removeLayer(ls_marker);
                },3000);

                if($(this).attr("class")=="green"){
                    $(".syn_warn .no_situ_warn").show();
                    $(".syn_warn>.oBox").hide()
                    $('.port>li:first').click()
                }else {
                    queryWarning(this);
                }
                if(authManage.airportPer_TH!=null){
                    /*=============加载时序图弹窗=============*/
                    loadDiagramPop($(this).attr('lat'),$(this).attr('lon'));
                }else{
                    add_mess($(this).attr('four'));
                    add_awos($(this).attr('four'));
                    addAirportWarn($(this).attr('four'),$(this).text().substring(0,2));
                    //addAirportRadarimg($(this).attr('four'));
                    getRadarStationByCode($(this).attr('four'));
                    var i_mes = $(this).html() + '/' + $(this).attr('three');
                    $('.air_port>h1').html(i_mes);
                    airportInfo($(this).attr('four'));
                    showPort(sArr);
                    if($(this).attr("isFlight") !== "true"){
                        showBottom($(this).attr('lat'),$(this).attr('lon'),$(this).attr('four'));
                    }
                }

            })
        }
    });
}

/**
 * 查询机场报警数据
 * @param e
 */
function queryWarning(e){
    var code = $(e).attr("four");
    var storage=JSON.parse(window.localStorage.getItem("userInfo"));
    //添加数据
    $.ajax({
        type: "get",
        url: meteorologicalHost + "airport/queryWarning",
        data: {
            code:code,
            userId:storage.id
        },
        async: true,
        success: function (data) {
            if(data.code==0 && data.data && data.data.length>0 ){
                var info = data.data;
                var raw = "";
                if(info[0].metar){
                    raw +="<p>"+info[0].metar+"</p>";
                }
                if(info[0].taf){
                    raw +="<p>"+info[0].taf+"</p>";
                }
                var html ="<h3 style='color: #9BB4E1'>报文</h3>"+raw+"<h3 style='color: #9BB4E1'>关联航班</h3><div class='warnContent'>"
                for (let i = 0; i < info.length; i++) {
                    var depCss = "airportWarn_white";
                    var arrCss = "airportWarn_white";
                    var css = "airportWarn_white";
                    if(info[i].depLevel){
                        if(info[i].depLevel==2){
                            depCss = "airportWarn_yellow";
                        }else if(info[i].depLevel==3){
                            depCss = "airportWarn_red";
                        }
                    }
                    if(info[i].arrLevel){
                        if(info[i].arrLevel==2){
                            arrCss = "airportWarn_yellow";
                        }else if(info[i].arrLevel==3){
                            arrCss = "airportWarn_red";
                        }
                    }

                    if(depCss == "airportWarn_yellow" && arrCss == "airportWarn_yellow"){
                        css = "airportWarn_yellow";
                    }else if(depCss == "airportWarn_red" && arrCss == "airportWarn_red"){
                        css = "airportWarn_red";
                    }
                    html += "<div class='flight_content'><p fltid='"+info[i].fltid+"' class='flight_warn "+css+"'>"+info[i].fltno+"/<span class='"+depCss+"'>"+info[i].depCode+"</span>-<span class='"+arrCss+"'>"+info[i].arrCode+"</span></p>"
                    if(info[i].depValue){
                        html += "<p style='margin-top: 5px;'>"+info[i].depCode+"："+info[i].depValue+"</p>"
                    }
                    if(info[i].arrValue){
                        html += "<p style='margin-top: 5px;'>"+info[i].arrCode+"："+info[i].arrValue+"</p>"
                    }
                    html += "</div>";
                }
                html+="</div>";
                $(".syn_warn .oBox").html(html).show();
                //绑定点击事件
                $(".oBox .flight_warn").unbind("click");
                $(".oBox .flight_warn").on("click",function (e){
                    $(".air_port img").click();
                    $(".flight .ing .flights span").removeClass("active");
                    var fltid = $(this).attr("fltid");
                    $(".flight span[fltid='"+fltid+"']").attr("flight",1);
                    $(".flight span[fltid='"+fltid+"']").click();
                })
                $(".syn_warn .no_situ_warn").hide();
                $('.port>li:eq(4)').click()
            }else{
                $(".syn_warn .no_situ_warn").show();
                $(".syn_warn .oBox").hide();
            }
        }
    })
}


function loadDiagramPop(LAT,LON){
    mkerGroup.clearLayers();
    $('#sel_time').val(parseFloat(LAT).toFixed(2) + ',' + parseFloat(LON).toFixed(2));
    //添加数据
    $.ajax({
        type: "get",
        url: IP8081_1+"file/getNcsData",
        data: {
            lat: LAT,
            lon: LON
        },
        async: true,
        success: function(data) {
            if(data.code == 0 && data.data.length > 0) {
                var strTime = '';
                var strThun = '';
                var strVis = '';
                var strTem = '';
                var strSpd = '';
                var strDir = '';
                var strPre = '';
                var strSand = '';
                var str3km = '';
                var str6km = '';
                var colThun = ['#1F437B00'];
                var colVis = ['#1F437B00'];
                var colTem = ['#1F437B00'];
                var colSpd = ['#1F437B00'];
                var colDir = ['#1F437B00'];
                var colPre = ['#1F437B00'];
                var colSand = ['#1F437B00'];
                var col3km = ['#1F437B00'];
                var col6km = ['#1F437B00'];
                var jsLen = 0; //计算总长度
                for(var i = 0; i < data.data.length; i++) {
                    strTime += '<td>' + (data.data[i].time).substring(8) + '</td>';
                    strThun += '<td>' + judgeNull(data.data[i].thunder) + '</td>';
                    strVis += '<td>' + judgeNull(data.data[i].vis,"vis") + '</td>';
                    strTem += '<td>' + judgeNull(data.data[i].t2) + '</td>';
                    strSpd += '<td>' + judgeNull(data.data[i].win10_spd) + '</td>';
                    strDir += '<td>' + judgeWindd(data.data[i].win10_dir) + '</td>';
                    strPre += '<td>' + judgeNull(data.data[i].pre) + '</td>';
                    strSand += '<td>' + judgeNull(data.data[i].DUCMASS) + '</td>';
                    colThun.push(getCol('thun', data.data[i].thunder));
                    colVis.push(getCol('vis', data.data[i].vis));
                    colTem.push(getCol('tem', data.data[i].t2));
                    colSpd.push(getCol('spd', data.data[i].win10_spd));
                    //colDir.push(getCol(data.data[i].win10_dir));
                    colPre.push(getCol(data.data[i].pre));
                    colSand.push(data.data[i].color);
                    jsLen += 1;
                }
                var coThun = colThun.join(',');
                var coVis = colVis.join(',');
                var coTem = colTem.join(',');
                var coSpd = colSpd.join(',');
                //var coDir = colDir.join(',');
                var coPre = colPre.join(',');
                var coSand = colSand.join(',');
                if(authManage.airportPer_TH!=null){//通航账户特殊处理
                    var strTbody = '<tr>' + strTime + '</tr>' +'<tr style="background:linear-gradient(to right,'+coThun+');">' + strThun + '</tr>' + '<tr style="background:linear-gradient(to right,'+coVis+');">' + strVis + '</tr>' +'<tr style="background:linear-gradient(to right,'+coTem+');">' + strTem + '<tr>' + strDir + '</tr>' + '</tr>' +'<tr style="background:linear-gradient(to right,'+coSpd+');">' + strSpd + '</tr>' +'<tr style="background:linear-gradient(to right,'+coPre+');">' + strPre + '</tr>' +'<tr style="background:linear-gradient(to right,'+coSand+');">' + strSand + '</tr>' +'<tr style="background:linear-gradient(to right,'+co3km+');">' + str3km + '</tr>' +'<tr style="background:linear-gradient(to right,'+col6km+');">' + str6km + '</tr>';
                }else{
                    var strTbody = '<tr>' + strTime + '</tr>' +'<tr style="background:linear-gradient(to right,'+coThun+');">' + strThun + '</tr>' + '<tr style="background:linear-gradient(to right,'+coVis+');">' + strVis + '</tr>' +'<tr style="background:linear-gradient(to right,'+coTem+');">' + strTem + '<tr>' + strDir + '</tr>' + '</tr>' +'<tr style="background:linear-gradient(to right,'+coSpd+');">' + strSpd + '</tr>' +'<tr>' + strPre + '</tr>' +'<tr style="background:linear-gradient(to right,'+coSand+');">' + strSand + '</tr>' +'<tr style="background:linear-gradient(to right,'+co3km+');">' + str3km + '</tr>' +'<tr style="background:linear-gradient(to right,'+col6km+');">' + str6km + '</tr>';
                }
                //var strTbody = '<tr>' + strTime + '</tr>' + '<tr style="background:linear-gradient(to right,' + coThun + ');">' + strThun + '</tr>' + '<tr style="background:linear-gradient(to right,' + coVis + ');">' + strVis + '</tr>' + '<tr style="background:linear-gradient(to right,' + coTem + ');">' + strTem + '<tr>' + strDir + '</tr>' + '</tr>' + '<tr style="background:linear-gradient(to right,' + coSpd + ');">' + strSpd + '</tr>' + '<tr>' + strPre + '</tr>' + '<tr style="background:linear-gradient(to right,' + coSand + ');">' + strSand + '</tr>' + '<tr style="background:linear-gradient(to right,' + co3km + ');">' + str3km + '</tr>' + '<tr style="background:linear-gradient(to right,' + col6km + ');">' + str6km + '</tr>';
                $('#ysTable>table>tbody').html(strTbody);
                //根据返回的时间判断thead内容   根据返回的时间以及数据的长度判断
                var airTime1 = data.data[0].time;
                //第一天
                var num = 24 - Number(airTime1.substring(8));
                if(num >= jsLen) {
                    var strThead = '<tr><th colspan="' + jsLen + '">' + transAirTime(airTime1) + '</th>';
                } else {
                    var strThead = '<tr><th colspan="' + num + '">' + transAirTime(airTime1) + '</th>';
                    //							$('.v_atmos>div>table>tbody>tr>td').eq(num).css();
                    var nu = Math.ceil((jsLen - num) / 24);
                    'border-right:1px solid #ccc'
                    for(var i = 1; i < nu + 1; i++) {
                        //console.log((i * 24 + num));
                        if((i * 24 + num) <= jsLen) {
                            var airTime = data.data[(i - 1) * 24 + num].time;
                            //									$('.v_atmos>div>table>tbody>tr>td').eq(i*24+num).css('border-right:1px solid #ccc');
                            strThead += '<th colspan="24">' + transAirTime(airTime) + '</th>';
                            //									$('.v_atmos>div>table>tbody>tr>td').eq((i-1)*24+num).css('border-right:1px solid #ccc');
                        } else {
                            var airTime = data.data[(i - 1) * 24 + num].time;
                            var colspan = (jsLen - num) % 24;
                            strThead += '<th colspan="' + colspan + '">' + transAirTime(airTime) + '</th>';
                            //									$('.v_atmos>div>table>tbody>tr>td').eq((i-1)*24+num).css('border-right:1px solid #ccc');
                        }
                    }
                }
                strThead += '</tr>';
                $('#ysTable>table>thead').html(strThead);
                $('.v_atmos').show();
                /*$('.im1').click(function(e) {
					L.DomEvent.stopPropagation(e);
					$('.v_atmos').show();
				})
				$('.im2').click(function(e) {
					L.DomEvent.stopPropagation(e);
					$('.v_atmos').hide();
					mkerGroup.clearLayers();
				})*/
            }
        }
    });
}
function get_pre30(TIME){
    return moment(TIME, "YYYYMMDDHHmm").subtract(30,'minutes').format("YYYYMMDDHHmm");
}
function get_last30(TIME){
    return moment(TIME, "YYYYMMDDHHmm").add(30,'minutes').format("YYYYMMDDHHmm");
}
var winD = {'wind':'win_d','crosswind':'crosswin_d'};
var isShowAirPlanel = false;

/**
 * 获取机场信息
 * @param airport4Code
 */
function airportInfo(airport4Code){
    $.ajax({
        type:"get",
        url:meteorologicalHost+"airport/info",
        async:true,
        data:{
            airport4Code:airport4Code
        },
        success:function(data){
            if(data.code==0 && data.data){
                var info = data.data;
                var airname = $(".air_port>h1").text().split("/")[0]
                $("#airname").text(airname).attr("title",airname);
                $("#city").text(info.province).attr("title",info.province);
                $("#3code").text(info.airport3code).attr("title",info.airport3code);
                $("#4code").text(info.airport4code).attr("title",info.airport4code);
                $("#location").text(info.aN+" "+info.ae).attr("title",info.aN+" "+info.ae);
                $("#airWeather").text(info.weatherProperty);
                $("#sun").text(info.sun);
                var html = '<span class="title">跑道信息：</span>';
                var runwayData = {};
                var code =info.airport3code
                for(var i=0;i<info.runway.length;i++){
                    var r1 = info.runway[i][0].RUNWAY_NAME;
                    var r2 = info.runway[i][1].RUNWAY_NAME;
                    html+='<div class="pd"><span code="'+code+'">'+r1+'</span><img src="images/跑道.png"/><span code="'+code+'">'+r2+'</span></div>'
                    runwayData[code+r1] = info.runway[i][0];
                    runwayData[code+r2] = info.runway[i][1];
                }
                runwayInfo =runwayData;
                $(".middle").html(html);
                $(".pd>span").bind("click",function(){
                    var code = $(this).attr("code");
                    var text = $(this).text();
                    var rInfo = runwayInfo[code+text];
                    $("#runwayNum").text(rInfo.RUNWAY_NAME+"号跑道");
                    $("#width").text(rInfo.WIDTH+"(m)").attr("title",rInfo.WIDTH+"(m)");
                    $("#long").text(rInfo.LENGTH+"(m)").attr("title",rInfo.LENGTH+"(m)");
                    $("#speed").text(rInfo.DIRECTION).attr("title",rInfo.DIRECTION);
                    $("#pcn").text(rInfo.PCN).attr("title",rInfo.PCN);
                    $("#lamplight").text(rInfo.LIGHTS).attr("title",rInfo.LIGHTS);
                    $("#altitude").text(rInfo.ELEVATION).attr("title",rInfo.ELEVATION);
                    $(".runwayInfo").show()
                });
                $(".situation .no_situ_warn").hide();
                $(".info").show();
            }else{
                $(".info").hide();
                $(".situation .no_situ_warn").show();
            }
        }
    })
    if(!isShowAirPlanel){
        $('.air_port').animate({left:182},400);
        isShowAirPlanel = true;
    }
    var dragging = false;
    var iX, iY;
    $(".air_port_title").mousedown(function(e) {
        e.stopPropagation();
        var p =  $(".air_port")[0];
        dragging = true;
        iX = e.clientX - p.offsetLeft;
        iY = e.clientY - p.offsetTop;
        p.setCapture &&  p.setCapture();
    });

    document.onmousemove = function(e) {
        e.stopPropagation();
        if (dragging) {
            var e = e || window.event;
            var oX = e.clientX - iX;
            var oY = e.clientY - iY;
            $(".air_port").css({
                "left": oX + "px",
                "top": oY + "px"
            });
        }
    };

    $(".air_port").mouseup(function(e) {
        e.stopPropagation();
        dragging = false;
        $(".air_port")[0].releaseCapture && $(".air_port")[0].releaseCapture();
        e.cancelBubble = true;
    })
}



function f_lcolor(AIR,TIME,ETIME){
    $('.air_port').animate({left:182},400);
    //当前时间之后的两个小时用实时数据，当前时间之后2-4小时用预报数据
    //?time=2020091717
    var skTime = moment().format("YYYYMMDDHH");
    var ti = moment().add(2, "hours").format("YYYYMMDDHH00");
    //关联机场点击时展示相关时间的数据
    var ttt = get_0hour();
    //雷暴指数用预报的4h
    $.ajax({
        type:"get",
        url:IP8081_1+"file/getJsonsData",
        async:true,
        data:{
            air:AIR,
            time:ttt,
            etime:ETIME
        },
        success:function(data){
            if(data.code == 0 && data.data.length > 0){
                $('.situation .no_situ_warn').hide();
                var now_s = data.data;
                //------------------长度等------------------
                var len = now_s.length;
                //------------------长度等------------------
                var ele = i_ar[0];//元素名
                var co = i_co[0];//颜色名
                var da = i_da[0];//风险值
                var ch = i_cha[0];//数值
                var x_arr = [];//x轴
                var data_arr = [];//风险值
                var chart_arr = [];//折线图数值及格式
                var stops = [];//折线图线条的颜色渐变
                var i_arr = [];//折线图线条的颜色渐变
                var t_str = '';//时序图时间轴
                var now_s = data.data;
                for(var i = 0;i<len;i++){
                    var stop = [];
                    //雷达数据全部使用预报数据
                    var tData = now_s[i];
                    var t = moment(tData.time, "YYYYMMDDHHmm").add(8,'hours').format("HH:mm");
                    stop.push(((i+20)+0.5)/len);
                    t_str += '<li>'+ t +'</li>';
                    //判断有没有这个元素，没有元素颜色用灰色，数值用null
                    //-----
                    if(tData[co]){
                        i_arr.push(tData[co]);
                    }else{
                        i_arr.push('#ccc');
                    }
                    stops.push(stop);
                    var obj1 = {};
                    if(ele == 'vis'){
                        //-----
                        if(tData[ch]){
                            if((Number(tData[ch]))/1000==-1){
                                obj1.y = null;
                            }else{
                                obj1.y = Number(((Number(tData[ch]))/1000).toFixed(2));
                            }

                        }else{
                            obj1.y = null;
                        }
                    }else{
                        if(tData[ch]){
                            obj1.y = Number(Number(tData[ch]).toFixed(1));
                        }else{
                            obj1.y = null;
                        }
                    }
                    obj1.marker = {
                        enabled:false,
                        states: {
                            hover: {
                                enabled: false
                            }
                        }
                    }
                    var obj = {};
                    if(tData[da]){
                        obj.y = tData[da];
                    }else{
                        obj.y = null;
                    }
                    data_arr.push(obj);
                    chart_arr.push(obj1);
                    x_arr.push(t);
                }
                var c_arr = i_arr.join(',');
                var i_i = 0;
                for(var i = 0;i<i_arr.length;i++){
                    if(i_arr[0]  == i_arr[i]){
                        i_i += 1;
                    }
                }
                if(i_i == i_arr.length){
                    var stops_arr = i_arr[0];
                }else{
                    var stops_arr = {
                        linearGradient: { x1: 0, x2: 1, y1: 0, y2: 0 },
                        stops: stops
                    };
                }
                //时间轴
                $('.cute_time').html(t_str);
                //雷暴条
                $('.details>li>div[name="'+ele+'"]').css({'background':'linear-gradient(to right,'+c_arr+')'});
                var x = -15;
                var y = -28;
//						console.log(data_arr);
                $('.details>li>div[name="'+ele+'"]').off('mouseover').mouseover(function(e) { //当鼠标指针从元素上移入时
                    var now = data_arr[Math.floor((e.offsetX)/60)];
                    var noe = now.y;
//							console.log(noe);
                    var tooltip = "<div id='tooltip'>"+noe+"</div>";
                    $("body").append(tooltip);
                    $("#tooltip").css({"top": (e.pageY + y) + "px","left": (e.pageX + x) + "px"}).show("fast");
                }).off('mouseout').mouseout(function() { //当鼠标指针从元素上移开时
                    $("#tooltip").remove();
                }).off('mousemove').mousemove(function(e) { //当鼠标指针从元素上移动时
                    var now = data_arr[Math.floor((e.offsetX)/60)];
                    var noe = now.y;
                    $("#tooltip").html(noe);
                    $("#tooltip").css({"top": (e.pageY + y) + "px","left": (e.pageX + x) + "px"});
                });
                //时序图
                if($('.y_set>li>img').is('.img_click') == true){
                    $('.img_click').trigger('click');
                }
                $('.y_set>li>img[name="'+ele+'"]').off('click').click(function(){
                    if($(this).is('.img_click') == false){
                        $('#d_chart').show();
                        /*console.log(chart_arr);
						console.log(stops_arr);*/
                        index_chart('d_chart',x_arr,chart_arr,stops_arr,ele);
                        $('.y_set>li>img').removeClass('img_click');
                        $('.y_set>li>img').attr('src','img/c2.png');
                        $(this).addClass('img_click');
                        $(this).attr('src','img/c1.jpg');
                    }else{
                        $(this).removeClass('img_click');
                        $('#d_chart').hide();
                        $(this).attr('src','img/c2.png');
                    }
                })
            }else{
                $('.situation .no_situ_warn').show();
            }
        }
    });
    $.ajax({
        type:"get",
        url:IP8081_1+"file/getJsonData2h",
        data:{
//			time:'2020091811'
            time:skTime
        },
        async:true,
        success:function(data){
            //遍历所有数组获取当前机场
            var json = JSON.parse(data);
            var theNu = 0;//判断返回数据是否有该条数据
            for(var i = 0;i<json.length;i++){
                for(var key in json[i]){
                    if(key == AIR){
                        theNu += 1;
                        var skDatas = json[i][key];
                    }
                }
            }
            if(theNu == 0){
                var skDatas = {
                    ID_four: null,
                    ID_three: null,
                    LAT: null,
                    LON: null,
                    Name_zh: null,
                    crosswin_d: null,
                    crosswin_s: null,
                    crosswind_risk: null,
                    crosswind_risk_level: null,
                    pre_risk: null,
                    pre_risk_level: null,
                    precipitation: null,
                    prewarn_level:null,
                    prewarn_risk: null,
                    temp_risk: null,
                    temp_risk_level: null,
                    temperature: null,
                    vis: null,
                    vis_risk: null,
                    vis_risk_level: null,
                    wea_affecting: null,
                    win_d: null,
                    win_s: null,
                    wind_risk: null,
                    wind_risk_level: null,
                }
            }
//			if(key == AIR || theNu == 0){
            $.ajax({
                type:"get",
                url:IP8081_1+"file/getJsonsData",
                async:true,
                data:{
                    air:AIR,
                    time:TIME,
                    etime:ETIME
                },
                success:function(data){
                    if(data.code == 0 && data.data.length > 0){
                        $('.situation .no_situ_warn').hide();
                        var now_sh = data.data;
                        //------------------长度等------------------
                        var len = now_sh.length + 20;
                        var i_len = len * 60 + 'px';
                        $('.details>li>div').css({'width':i_len});
                        $('.time_two>div').css({'width':i_len});
                        $('.cute_time').css({'width':i_len});
                        $('.air_port>.situation>.sit_scroll').scrollLeft();
                        //------------------长度等------------------
                        //除去雷暴指数
                        for(var i = 1;i<i_ar.length;i++){
                            (function(i){
                                var ele = i_ar[i];//元素名
                                var co = i_co[i];//颜色名
                                var da = i_da[i];//风险值
                                var ch = i_cha[i];//数值
                                var x_arr = [];//x轴
                                var data_arr = [];//风险值
                                var chart_arr = [];//折线图数值及格式
                                var stops = [];//折线图线条的颜色渐变
                                var i_arr = [];//折线图线条的颜色渐变
                                var t_str = '';//时序图时间轴
                                for(var i = -20;i<len-20;i++){
                                    var stop = [];
                                    if(i<0){
                                        //i<0为实况数据-临时数据-skData,只展示预报数据将-20改为0
                                        //实况数据只有一条，时间用skTime向前推
                                        var tData = skDatas;
                                        var t = moment(ti,"YYYYMMDDHHmm").subtract((Math.abs(i))*6,'minutes').format("HH:mm");
                                    }else{
                                        //i>=0为预报数据-不变
                                        var tData = now_sh[i];
                                        var t = moment(tData.time, "YYYYMMDDHHmm").add(8,'hours').format("HH:mm");
                                    }
                                    stop.push(((i+20)+0.5)/len);
                                    t_str += '<li>'+ t +'</li>';
                                    //判断有没有这个元素，没有元素颜色用灰色，数值用null
                                    //-----
                                    if(tData[co]){
                                        i_arr.push(tData[co]);
                                    }else{
                                        i_arr.push('#ccc');
                                    }

                                    if(ele == 'wind' || ele == 'crosswind'){
                                        //-----
                                        if(tData[co]){
                                            stop.push(tData[co]);
                                        }else{
                                            stop.push('#ccc');
                                        }
                                        stops.push(stop);
                                        var obj1 = {};
                                        var w_d = winD[ele];
                                        //-----
                                        if(tData[ch]){
                                            obj1.y = Number(Number(tData[ch]).toFixed(1));
                                        }else{
                                            obj1.y = null;
                                        }
                                        //-----
                                        if(tData[w_d]){
                                            obj1.dir = Number(Number(tData[w_d]).toFixed(0));
                                        }else{
                                            obj1.dir = null;
                                        }
                                        //-----
                                        if(tData[w_d]){
                                            var iUrl = "url(img/city/" + wind_dir_16(Number(tData[w_d])) + ".png)";
                                        }else{
                                            var iUrl = "url(img/city/S.png)"
                                        }
                                        obj1.marker = {
                                            /*enabled:true,*/
                                            symbol: iUrl,
                                            states: {
                                                hover: {
                                                    enabled: true
                                                }
                                            }
                                        };
                                        var obj = {};
                                        if(tData[da]){
                                            obj.y = tData[da];
                                        }else{
                                            obj.y = null;
                                        }
                                        data_arr.push(obj);
                                        //								data_arr.push(obj1);
                                        //								if(i%2 == 0){
                                        chart_arr.push(obj1);
                                        x_arr.push(t);
                                        //								}
                                    }else{
                                        //-----
                                        if(tData[co]){
                                            stop.push(tData[co]);
                                        }else{
                                            stop.push('#ccc');
                                        }
                                        stops.push(stop);
                                        var obj1 = {};
                                        if(ele == 'vis'){
                                            //-----
                                            if(tData[ch]){
                                                if((Number(tData[ch]))==-1){
                                                    obj1.y = null;
                                                }else{
                                                    obj1.y = Number(((Number(tData[ch]))/1000).toFixed(2));
                                                }
                                            }else{
                                                obj1.y = null;
                                            }
                                        }else{
                                            if(tData[ch]){
                                                obj1.y = Number(Number(tData[ch]).toFixed(1));
                                            }else{
                                                obj1.y = null;
                                            }
                                        }
                                        obj1.marker = {
                                            enabled:false,
                                            states: {
                                                hover: {
                                                    enabled: false
                                                }
                                            }
                                        }
                                        var obj = {};
                                        if(tData[da]){
                                            obj.y = tData[da];
                                        }else{
                                            obj.y = null;
                                        }
                                        data_arr.push(obj);
                                        //								data_arr.push(obj1);
                                        chart_arr.push(obj1);
                                        x_arr.push(t);
                                    }
                                }
                                var c_arr = i_arr.join(',');
                                var i_i = 0;
                                for(var i = 0;i<i_arr.length;i++){
                                    if(i_arr[0]  == i_arr[i]){
                                        i_i += 1;
                                    }
                                }
                                if(i_i == i_arr.length){
                                    var stops_arr = i_arr[0];
                                }else{
                                    var stops_arr = {
                                        linearGradient: { x1: 0, x2: 1, y1: 0, y2: 0 },
                                        stops: stops
                                    };
                                }
                                //时间轴
                                $('.cute_time').html(t_str);
                                //雷暴条
                                $('.details>li>div[name="'+ele+'"]').css({'background':'linear-gradient(to right,'+c_arr+')'});
                                var x = -15;
                                var y = -28;
                                //						console.log(data_arr);
                                $('.details>li>div[name="'+ele+'"]').off('mouseover').mouseover(function(e) { //当鼠标指针从元素上移入时
                                    var now = data_arr[Math.floor((e.offsetX)/60)];
                                    var noe = now.y;
                                    //							console.log(noe);
                                    var tooltip = "<div id='tooltip'>"+noe+"</div>";
                                    $("body").append(tooltip);
                                    $("#tooltip").css({"top": (e.pageY + y) + "px","left": (e.pageX + x) + "px"}).show("fast");
                                }).off('mouseout').mouseout(function() { //当鼠标指针从元素上移开时
                                    $("#tooltip").remove();
                                }).off('mousemove').mousemove(function(e) { //当鼠标指针从元素上移动时
                                    var now = data_arr[Math.floor((e.offsetX)/60)];
                                    var noe = now.y;
                                    $("#tooltip").html(noe);
                                    $("#tooltip").css({"top": (e.pageY + y) + "px","left": (e.pageX + x) + "px"});
                                });
                                //时序图
                                if($('.y_set>li>img').is('.img_click') == true){
                                    $('.img_click').trigger('click');
                                }
                                $('.y_set>li>img[name="'+ele+'"]').off('click').click(function(){
                                    if($(this).is('.img_click') == false){
                                        $('#d_chart').show();
                                        /*console.log(chart_arr);
										console.log(stops_arr);*/
                                        index_chart('d_chart',x_arr,chart_arr,stops_arr,ele);
                                        $('.y_set>li>img').removeClass('img_click');
                                        $('.y_set>li>img').attr('src','img/c2.png');
                                        $(this).addClass('img_click');
                                        $(this).attr('src','img/c1.jpg');
                                    }else{
                                        $(this).removeClass('img_click');
                                        $('#d_chart').hide();
                                        $(this).attr('src','img/c2.png');
                                    }
                                })
                            })(i)
                        }
                    }else{
                        $('.situation .no_situ_warn').show();
                    }
                }
            });
            //实况数据嵌套预报数据
//			}
        }
    });
}
function f_llcolor(AIR,TIME,ETIME){
    $('.air_port').animate({left:182},400);
    //关联机场点击时展示相关时间的数据
    $.ajax({
        type:"get",
        url:IP8081_1+"file/getJsonsData",
        async:true,
        data:{
            air:AIR,
            time:TIME,
            etime:ETIME
        },
        success:function(data){
            if(data.code == 0 && data.data.length > 0){
                $('.situation .no_situ_warn').hide();
                var now_sh = data.data;
                //------------------长度等------------------
                var len = now_sh.length;
                var i_len = len * 60 + 'px';
                $('.details>li>div').css({'width':i_len});
                $('.time_two>div').css({'width':i_len});
                $('.cute_time').css({'width':i_len});
                $('.air_port>.situation>.sit_scroll').scrollLeft();
                //------------------长度等------------------
                //除去雷暴指数
                for(var i = 0;i<i_ar.length;i++){
                    (function(i){
                        var ele = i_ar[i];//元素名
                        var co = i_co[i];//颜色名
                        var da = i_da[i];//风险值
                        var ch = i_cha[i];//数值
                        var x_arr = [];//x轴
                        var data_arr = [];//风险值
                        var chart_arr = [];//折线图数值及格式
                        var stops = [];//折线图线条的颜色渐变
                        var i_arr = [];//折线图线条的颜色渐变
                        var t_str = '';//时序图时间轴
                        for(var i = 0;i<len;i++){
                            var stop = [];
                            var tData = now_sh[i];
                            var t = moment(tData.time, "YYYYMMDDHHmm").add(8,'hours').format("HH:mm");
                            stop.push(((i+20)+0.5)/len);
                            t_str += '<li>'+ t +'</li>';
                            //判断有没有这个元素，没有元素颜色用灰色，数值用null
                            //-----
                            if(tData[co]){
                                i_arr.push(tData[co]);
                            }else{
                                i_arr.push('#ccc');
                            }

                            if(ele == 'wind' || ele == 'crosswind'){
                                //-----
                                if(tData[co]){
                                    stop.push(tData[co]);
                                }else{
                                    stop.push('#ccc');
                                }
                                stops.push(stop);
                                var obj1 = {};
                                var w_d = winD[ele];
                                //-----
                                if(tData[ch]){
                                    obj1.y = Number(Number(tData[ch]).toFixed(1));
                                }else{
                                    obj1.y = null;
                                }
                                //-----
                                if(tData[w_d]){
                                    obj1.dir = Number(Number(tData[w_d]).toFixed(0));
                                }else{
                                    obj1.dir = null;
                                }
                                //-----
                                if(tData[w_d]){
                                    var iUrl = "url(img/city/" + wind_dir_16(Number(tData[w_d])) + ".png)";
                                }else{
                                    var iUrl = "url(img/city/S.png)"
                                }
                                obj1.marker = {
                                    symbol: iUrl,
                                    states: {
                                        hover: {
                                            enabled: false
                                        }
                                    }
                                };
                                var obj = {};
                                if(tData[da]){
                                    obj.y = tData[da];
                                }else{
                                    obj.y = null;
                                }
                                data_arr.push(obj);
//								data_arr.push(obj1);
//								if(i%2 == 0){
                                chart_arr.push(obj1);
                                x_arr.push(t);
//								}
                            }else{
                                //-----
                                if(tData[co]){
                                    stop.push(tData[co]);
                                }else{
                                    stop.push('#ccc');
                                }
                                stops.push(stop);
                                var obj1 = {};
                                if(ele == 'vis'){
                                    //-----
                                    if(tData[ch]){
                                        obj1.y = Number(((Number(tData[ch]))/1000).toFixed(2));
                                    }else{
                                        obj1.y = null;
                                    }
                                }else{
                                    if(tData[ch]){
                                        obj1.y = Number(Number(tData[ch]).toFixed(1));
                                    }else{
                                        obj1.y = null;
                                    }
                                }
                                obj1.marker = {
                                    enabled:false,
                                    states: {
                                        hover: {
                                            enabled: false
                                        }
                                    }
                                }
                                var obj = {};
                                if(tData[da]){
                                    obj.y = tData[da];
                                }else{
                                    obj.y = null;
                                }
                                data_arr.push(obj);
//								data_arr.push(obj1);
                                chart_arr.push(obj1);
                                x_arr.push(t);
                            }
                        }
                        var c_arr = i_arr.join(',');
                        var i_i = 0;
                        for(var i = 0;i<i_arr.length;i++){
                            if(i_arr[0]  == i_arr[i]){
                                i_i += 1;
                            }
                        }
                        if(i_i == i_arr.length){
                            var stops_arr = i_arr[0];
                        }else{
                            var stops_arr = {
                                linearGradient: { x1: 0, x2: 1, y1: 0, y2: 0 },
                                stops: stops
                            };
                        }
                        //时间轴
                        $('.cute_time').html(t_str);
                        //雷暴条
                        $('.details>li>div[name="'+ele+'"]').css({'background':'linear-gradient(to right,'+c_arr+')'});
                        var x = -15;
                        var y = -28;
//						console.log(data_arr);
                        $('.details>li>div[name="'+ele+'"]').off('mouseover').mouseover(function(e) { //当鼠标指针从元素上移入时
                            var now = data_arr[Math.floor((e.offsetX)/60)];
                            var noe = now.y;
//							console.log(noe);
                            var tooltip = "<div id='tooltip'>"+noe+"</div>";
                            $("body").append(tooltip);
                            $("#tooltip").css({"top": (e.pageY + y) + "px","left": (e.pageX + x) + "px"}).show("fast");
                        }).off('mouseout').mouseout(function() { //当鼠标指针从元素上移开时
                            $("#tooltip").remove();
                        }).off('mousemove').mousemove(function(e) { //当鼠标指针从元素上移动时
                            var now = data_arr[Math.floor((e.offsetX)/60)];
                            var noe = now.y;
                            $("#tooltip").html(noe);
                            $("#tooltip").css({"top": (e.pageY + y) + "px","left": (e.pageX + x) + "px"});
                        });
                        //时序图
                        if($('.y_set>li>img').is('.img_click') == true){
                            $('.img_click').trigger('click');
                        }
                        $('.y_set>li>img[name="'+ele+'"]').off('click').click(function(){
                            if($(this).is('.img_click') == false){
                                $('#d_chart').show();
                                //console.log(chart_arr);
                                index_chart('d_chart',x_arr,chart_arr,stops_arr,ele);
                                $('.y_set>li>img').removeClass('img_click');
                                $('.y_set>li>img').attr('src','img/c2.png');
                                $(this).addClass('img_click');
                                $(this).attr('src','img/c1.jpg');
                            }else{
                                $(this).removeClass('img_click');
                                $('#d_chart').hide();
                                $(this).attr('src','img/c2.png');
                            }
                        })
                    })(i)
                }
            }else{
                $('.situation .no_situ_warn').show();
            }
        }
    });
}
//获取当前时间的最近的6min
function get_6min(){
    var t = moment().subtract(8, "hours").format("YYYYMMDDHHmm");
    var t1 = parseInt(t.substring(10));
    if(t1%6 == 0){
        var r_t = t;
    }else if(t1%6 < 3){
        var r_t = moment(t, "YYYYMMDDHHmm").subtract(t1%6, "minutes").format("YYYYMMDDHHmm");
    }else{
        var r_t = moment(t, "YYYYMMDDHHmm").add((6-t1%6), "minutes").format("YYYYMMDDHHmm");
    }
    return r_t;
}
//航班
//add_flights();
//function add_flights(){
//	flights.forEach(function(e){
//		var mk = get_r();
//		var y_marker = L.circleMarker([e.lon, e.lat], {
//			stroke: true,
//			color: '#000',
//			weight: 1,
//			opacity: 1,
//			fillColor: '#000',
//			fillOpacity: 1,
//			radius: mk,
//			pane:'flight'
//		}).addTo(flightsGroup);
//		re_radius(y_marker);
//		y_marker.on('click',function(){
//			add_mess(e.f);
//			add_awos(e.f);
//			var i_mes = e.name + '/' + e.f + '/' + e.t;
//			$('.air_port>h1').html(i_mes);
//			for(var i = 0;i<i_ar.length;i++){
//				(function(i){
//					f_color(e.id,i_ar[i]);
//				})(i)
//			}
//		})
//	})
//}
//function f_color(ID,ELE){
//	$('.air_port').animate({left:18},400);
//	var i_arr = [];
//	var t_str = '';
//	var time = $('.y_time>li').eq(0).attr('name').substring(9);
//	$.ajax({
//		type:"get",
//		url:IP8081_1 + "SqlServer/getAirport",
//		async:true,
//		data:{
//			time:time,
//			ele:ELE
//		},
//		success:function(data){
//			if(data.code == 0){
//				if($('.y_time>li').length < data.data.length){
//					var len = $('.y_time>li').length;
//				}else{
//					var len = data.data.length;
//				}
//				var i_len = len * 60 + 'px';
//				$('.details>li>div').css({'width':i_len});
//				$('.time_two>div').css({'width':i_len});
//				$('.cute_time').css({'width':i_len});
//				var x_arr = [];
//				var data_arr = [];
//				var stops = [];
//				for(var i = 0;i<len;i++){
//					(function(i){
//						for(var key in data.data[i]){
//							var stop = [];
//							stop.push((i+0.5)/len);
//							var t = moment(key, "YYYYMMDDHHmm").add(8,'hours').format("HH:mm");
//							x_arr.push(t);
//							t_str += '<li>'+ t +'</li>';
//							var str = data.data[i][key];
//							var str1 = str.split(' ')[0];
//							var str2 = str.split(' ')[1];
//							var arr1 = str1.split(',');
//							var arr2 = str2.split(',');
//							i_arr.push(arr1[ID]);
//							stop.push(arr1[ID]);
//							stops.push(stop);
//							if(ELE == 'wind' || ELE == 'crosswind'){
//								var str3 = str.split(' ')[2];
//								var arr3 = str3.split(',');
//								var obj = {};
//								obj.y = Number(arr2[ID]);
//								obj.marker = {
//									symbol: "url(img/city/" + wind_dir_16(Number(arr3[ID])) + ".png)",
//									states: {
//										hover: {
//											enabled: false
//										}
//									}
//								};
//								obj.dir = arr3[ID];
//								data_arr.push(obj);
//							}else{
//								var obj = {};
//								obj.y = Number(arr2[ID]);
//								obj.marker = {
//									enabled:false,
//									states: {
//										hover: {
//											enabled: false
//										}
//									}
//								}
//								data_arr.push(obj)
//							}
//						}
//					})(i)
//				}
//				var c_arr = i_arr.join(',');
//				var i_i = 0;
//				for(var i = 0;i<i_arr.length;i++){
//					if(i_arr[0]  == i_arr[i]){
//						i_i += 1;
//					}
//				}
//				if(i_i == i_arr.length){
//					var stops_arr = i_arr[0];
//				}else{
//					var stops_arr = {
//						linearGradient: { x1: 0, x2: 1, y1: 0, y2: 0 },
//						stops: stops
//					};
//				}
//				//时间轴
//				$('.cute_time').html(t_str);
//				//雷暴条
//				$('.details>li>div[name="'+ELE+'"]').css({'background':'linear-gradient(to right,'+c_arr+')'});
//				var x = -15;
//				var y = -28;
//				$('.details>li>div[name="'+ELE+'"]').off('mouseover').mouseover(function(e) { //当鼠标指针从元素上移入时
//					var now = data_arr[Math.floor((e.offsetX)/60)];
//					var noe = now.y;
//					var tooltip = "<div id='tooltip'>"+noe+"</div>";
//					$("body").append(tooltip);
//					$("#tooltip").css({"top": (e.pageY + y) + "px","left": (e.pageX + x) + "px"}).show("fast");
//				}).off('mouseout').mouseout(function() { //当鼠标指针从元素上移开时
//					$("#tooltip").remove();
//				}).off('mousemove').mousemove(function(e) { //当鼠标指针从元素上移动时
//					var now = data_arr[Math.floor((e.offsetX)/60)];
//					var noe = now.y;
//					$("#tooltip").html(noe);
//					$("#tooltip").css({"top": (e.pageY + y) + "px","left": (e.pageX + x) + "px"});
//				});
//				//时序图
//				if($('.y_set>li>img').is('.img_click') == true){
//					$('.img_click').trigger('click');
//				}
//				$('.y_set>li>img[name="'+ELE+'"]').off('click').click(function(){
//					if($(this).is('.img_click') == false){
//						$('#d_chart').show();
//						index_chart('d_chart',x_arr,data_arr,stops_arr,ELE);
//						$('.y_set>li>img').removeClass('img_click');
//						$('.y_set>li>img').attr('src','img/c2.png');
//						$(this).addClass('img_click');
//						$(this).attr('src','img/c1.jpg');
//					}else{
//						$(this).removeClass('img_click');
//						$('#d_chart').hide();
//						$(this).attr('src','img/c2.png');
//					}
//				})
//			}
//		}
//	});
//}
//机场AWOS
//拼接字符串
function makeStr1(a,b,c,d,e,f){
    return '<h5>'+a+'</h5><h5>RVR_1A:'+b+'</h5><h5>CBase:'+c+'</h5><div class="awos1"><div class="o_box"><div class="o_clock"><div class="o_circle"><div class="o_arrow" style="transform: rotate('+f+'deg);"></div><div class="o_line" style="transform: rotate('+e+'deg);"></div><div class="o_centre">'+d+'</div></div></div></div></div>';
}
function makeStr2(a,b,c,d,e,f,g,h,i,j,k,l,m,n){
    return '<h5>RVR_1A:'+a+'</h5><h5>MOR_1A:'+b+'</h5><h5>RVR_10A:'+c+'</h5><h5>MOR_10A:'+d+'</h5><h5>云底高：'+e+'</h5><h5>垂直能见度：'+f+'</h5><h5>QNH：'+g+'</h5><h5>相对湿度：'+h+'</h5><h5>气温：'+i+'</h5><h5>道面温度：'+j+'</h5><h5>天气变化：'+k+'</h5><div class="awos1"><div class="o_box"><div class="o_clock"><div class="o_circle"><div class="o_arrow" style="transform: rotate('+n+'deg);"></div><div class="o_line" style="transform: rotate('+m+'deg);"></div><div class="o_centre">'+l+'</div></div></div></div></div>'
}
//保存awos数据
var awosDatas = {};
function add_awos(ID){
    awosDatas = {}
    $.ajax({
        type:"get",
        url: meteorologicalHost + "airport/queryAwosData",
        data:{
            code:ID
        },
        async:true,
        success:function(data){
            var len = data.data.length;
            var datas = data.data;
            var options = "";
            if(data.code == 0 && len > 0){
                for(var i=0;i<len;i++){
                    options+="<option value='"+datas[i].rno+"' >跑道"+datas[i].tdz+"/ "+datas[i].end+"</option>";
                    awosDatas[datas[i].rno] = datas[i];
                }
                $('.awos_box>.no_situ_warn').hide();

                var airports = $(".air_port>h1").text().split("/");
                $("#awosAName").html(airports[0]);
                $("#awosACode").html(airports[1]+"&nbsp;&nbsp;"+airports[2]);
                //生成跑道下拉框option
                $(".runwaySelect").html(options);
                $(".awos_box .awosData").show();
                $(".runwaySelect").trigger("change");
            }else{
                $(".awos_box .awosData").hide();
                $('.awos_box>.no_situ_warn').show();
            }
        }
    });
}


var awosTimer;
function awosChange(rno){
    awosRenderer(rno)
    restAwosCurve();
    window.clearTimeout(awosTimer);
    var airports = $(".air_port>h1").text().split("/");
    var code = airports[1];
    awosTimer = setInterval(function(){
        if($(".air_port").css("left")=="-740px"){
            window.clearTimeout(awosTimer);
        }
        awosTimerFun(code,rno);
    },3000);
}

function awosTimerFun(code,rno){
    $.ajax({
        type: "get",
        url: meteorologicalHost + "airport/queryAwosDataByRno",
        data: {
            code: code,
            rno:rno
        },
        async: true,
        success: function (data) {
            if(data.code==0 && data.data){
                awosDatas[data.data.rno] = data.data;
                awosRenderer(data.data.rno);
            }
        }
    })
}
function awosRenderer(rno){
    var data = awosDatas[rno];
    //跑道第一方向
    //编号
    $("#tdz").attr("rno",rno).attr("code",data.cccc);
    $("#tdz>span").html(data.tdz);
    $("#tdzRvr1A").text(data.tdzRvr1A===""?"":data.tdzRvr1A);
    $("#tdzRvr10A").text(data.tdzRvr10A===""?"":data.tdzRvr10A);
    $("#tdzCldHl").text(data.tdzCldHl===""?"":(data.tdzCldHl +"米"));
    $("#tdzVv").text(data.tdzVv===""?"":data.tdzVv);
    $("#tdzQnh").text(data.tdzQnh===""?"":data.tdzQnh);
    $("#tdzHumid").text(data.tdzHumid===""?"":(data.tdzHumid +"%"));
    $("#tdzTemp").text(data.tdzTemp===""?"":(data.tdzTemp +"°C"));
    $("#tdzRoadtemp").text(data.tdzRoadtemp===""?"":(data.tdzRoadtemp +"°C"));
    $("#tdzWheterPhno").text(data.tdzWheterPhno);
    $("#tdzWindX").text(data.tdzWindD2===""?"":(data.tdzWindD2 +"°"));
    $("#tdzWindS").text(data.tdzWindF2===""?"":(data.tdzWindF2 +"m/s"));
    //跑道中间端
    //编号
    $("#mid").text(data.mid);
    $("#midRvr1A").text(data.midRvr1A);
    $("#midRvr10A").text(data.midRvr10A);
    $("#midCldHl").text(data.midCldHl===""?"":(data.midCldHl +"米"));
    $("#midVv").text(data.midVv===""?"":data.midVv);
    $("#midQnh").text(data.midQnh===""?"":data.midQnh);
    $("#midHumid").text(data.midHumid===""?"":(data.midHumid +"%"));
    $("#midTemp").text(data.midTemp===""?"":(data.midTemp +"°C"));
    $("#midRoadtemp").text(data.midRoadtemp===""?"":(data.midRoadtemp +"°C"));
    $("#midWheterPhno").text(data.midWheterPhno);
    $("#midWindX").text(data.midWindD2===""?"":(data.midWindD2 +"°"));
    $("#midWindS").text(data.midWindF2===""?"":(data.midWindF2 +"m/s"));
    //跑道第二方向
    //编号
    $("#end>span").text(data.end);
    $("#endRvr1A").text(data.endRvr1A);
    $("#endRvr10A").text(data.endRvr10A);
    $("#endCldHl").text(data.endCldHl===""?"":(data.endCldHl +"米"));
    $("#endVv").text(data.endVv===""?"":data.endVv);
    $("#endQnh").text(data.endQnh===""?"":data.endQnh);
    $("#endHumid").text(data.endHumid===""?"":(data.endHumid +"%"));
    $("#endTemp").text(data.endTemp===""?"":(data.endTemp +"°C"));
    $("#endRoadtemp").text(data.endRoadtemp===""?"":(data.endRoadtemp +"°C"));
    $("#endWheterPhno").text(data.endWheterPhno);
    $("#endWindX").text(data.endWindD2===""?"":(data.endWindD2 +"°"));
    $("#endWindS").text(data.endWindF2===""?"":(data.endWindF2 +"m/s"));
    $("#awosATime").html(data.reftime);
    // 第一方向平均风向
    var tdzWindD2 = data.tdzWindD2===""?0:data.tdzWindD2;
    $(".bp_left>.zz").css("transform","rotate("+tdzWindD2+"deg)")
    //跑道方向
    var tdzRunwayDir = (data["tdz"].length>2?data["tdz"].substring(0,2):data["tdz"]) * 10
    $(".bp_left>.pd").css("transform","rotate("+tdzRunwayDir+"deg)")
    // 第二方向平均风向
    var endWindD2 = data.endWindD2===""?0:data.endWindD2;
    $(".bp_right>.zz").css("transform","rotate("+endWindD2+"deg)")
    //跑道方向
    var endRunwayDir = (data["end"].length>2?data["end"].substring(0,2):data["end"]) * 10
    $(".bp_right>.pd").css("transform","rotate("+endRunwayDir+"deg)")

    // 计算各跑道顺风、逆风及侧风
    // 顺逆风= 风速值 × COS(风向-10×跑道号)
    // 结果为正：逆风
    // 结果为负：顺风
    // 侧风= 风速值 × SIN(风向-10×跑道号)
    // 结果为正：风从跑道右侧来
    // 结果为负：风从跑道左侧来
    var PI = Math.PI;
    if(data.tdzWindF2  &&  tdzWindD2){
        $(".bp_left>.wind").show();
        var tdzWindF2 = data.tdzWindF2;
        //顺逆风
        var tailorDeadWind =  (tdzWindF2 * Math.cos( (tdzWindD2-tdzRunwayDir) * (PI/180) )).toFixed(1);
        //侧风
        var crosswind = (tdzWindF2 * Math.sin( (tdzWindD2-tdzRunwayDir) * (PI/180) )).toFixed(1);
        //顺逆风方向
        var tailorDeadWindDir = tdzRunwayDir;
        if(tailorDeadWind>0){
            tailorDeadWind = "+" + tailorDeadWind;
            tailorDeadWindDir = tdzRunwayDir + 180;
        }
        $(".bp_left>.dead").css("transform","rotate("+tailorDeadWindDir+"deg)");
        var dir1 = 180;
        tailorDeadWindDir = Math.abs(tailorDeadWindDir);
        if((tailorDeadWindDir<90 && tailorDeadWindDir>=0) || (tailorDeadWindDir>=270 && tailorDeadWindDir<450)){
            dir1 = 0;
        }
        $(".bp_left>.dead>span").text(tailorDeadWind).css("transform","rotate("+dir1+"deg)");

        //侧风方向
        var crossWindDir;

        if(crosswind>0){
            crosswind += "R";
            crossWindDir = tdzRunwayDir-90;
        }else{
            crosswind += "L";
            crossWindDir = tdzRunwayDir+90;
        }
        crosswind = crosswind.replace(/-/," ");
        $(".bp_left>.cross").css("transform","rotate("+crossWindDir+"deg)");
        var dir2 = 180;
        crossWindDir = Math.abs(crossWindDir);
        if((crossWindDir<90 && crossWindDir>=0) || (crossWindDir>=270 && crossWindDir<450)){
            dir2= 0;
        }
        $(".bp_left>.cross>span").text(crosswind).css("transform","rotate("+dir2+"deg)");
    }else{
        $(".bp_left>.wind").hide()
    }

    if(data.endWindF2  &&  endWindD2){
        $(".bp_right>.wind").show();
        var endWindF2 = data.endWindF2;
        //顺逆风
        var tailorDeadWind =  (endWindF2 * Math.cos( (endWindD2-endRunwayDir) * (PI/180) )).toFixed(1);
        //侧风
        var crosswind = (endWindF2 * Math.sin( (endWindD2-endRunwayDir) * (PI/180) )).toFixed(1);
        //顺逆风方向
        var tailorDeadWindDir = endRunwayDir;
        if(tailorDeadWind>0){
            tailorDeadWind = "+" + tailorDeadWind;
            tailorDeadWindDir = endRunwayDir + 180;
        }
        $(".bp_right>.dead").css("transform","rotate("+tailorDeadWindDir+"deg)");
        var dir1 = 180;
        tailorDeadWindDir = Math.abs(tailorDeadWindDir);
        if((tailorDeadWindDir<90 && tailorDeadWindDir>=0) || (tailorDeadWindDir>=270 && tailorDeadWindDir<450)){
            dir1 = 0;
        }
        $(".bp_right>.dead>span").text(tailorDeadWind).css("transform","rotate("+dir1+"deg)");

        //侧风方向
        var crossWindDir;

        if(crosswind>0){
            crosswind += "R";
            crossWindDir = endRunwayDir-90;
        }else{
            crosswind += "L";
            crossWindDir = endRunwayDir+90;
        }
        crosswind = crosswind.replace(/-/," ");
        $(".bp_right>.cross").css("transform","rotate("+crossWindDir+"deg)");
        var dir2 = 180;
        crossWindDir = Math.abs(crossWindDir);
        if((crossWindDir<90 && crossWindDir>=0) || (crossWindDir>=270 && crossWindDir<450) ){
            dir2 = 0;
        }
        $(".bp_right>.cross>span").text(crosswind).css("transform","rotate("+dir2+"deg)");

    }else{
        $(".bp_right>.wind").hide()
    }

    $(".selectAwos").unbind("click");
    $(".selectAwos").on("click",function(e){
        selectAwos(this);
    })

}

function restAwosCurve(){
    $(".awos_more").css("top","0px");
    $("#awos_curve").css("top","0px");
    $(".awos1_box h5").css("color","white");
    $(".awos3_box h5").css("color","white");
    $(".awos1_box img").attr("src","../images/curve.png").attr("active","false");
    $(".awos3_box img").attr("src","../images/curve.png").attr("active","false");
}

var meteogram ;
function selectAwos(e){
    var color = $(e).css("color")
    if(color=="#6C9CD8" || color == "rgb(108, 156, 216)"){
        $(e).parent().css("color","white")
    }else{
        $(e).parent().css("color","#6C9CD8")
    }
    $(e).next().click();
}

function showCurve(e){
    if($("#awos_more_t").text() == "展开"){
        $("#awos_more_d").click()
    }
    var active = $(e).attr("active")
    var ortherActive = "";
    var type = $(e).attr("type")
    var title = "";
    if(type=="tdz"){
        ortherActive = $("img[type='end']");
        title = $("#tdz").text()+"号跑道一小时历史数据统计";
        $(".tdzFactor").css("color","#6C9CD8")
        $(".endFactor").css("color","white")
        $("input[name='checkbox1']").each(function(){
            this.checked = true;
        })
        $("input[name='checkbox2']").each(function(){
            this.checked = false;
        })
    }else{
        $(".endFactor").css("color","#6C9CD8");
        $(".tdzFactor").css("color","white");
        ortherActive = $("img[type='tdz']");
        $("input[name='checkbox2']").each(function(){
            this.checked = true;
        })
        $("input[name='checkbox1']").each(function(){
            this.checked = false;
        })
        title = $("#end").text()+"号跑道一小时历史数据统计";
    }
    ortherActive.attr("src","../images/curve.png");
    ortherActive.parent().css("color","white")
    if(active && active === "true" ){
        $(e).attr("active","false")

        if(type=="tdz"){
            $(".awos1_box h5").css("color","white")
        }else{
            $(".awos3_box h5").css("color","white")
        }
        $(e).attr("src","../images/curve.png");
        if(ortherActive.attr("active") && ortherActive.attr("active") !== "false"){
            console.log(1)
        }else {
            $(".awos_more").animate({top:"0px"},1000);
            $("#awos_curve").animate({top:"0px"},1000);
        }
    }else{
        $(e).attr("src","../images/curve_blue.png");
        $(e).parent().css("color","#6C9CD8")
        $(e).attr("active","true")
        ortherActive.attr("active","false")
        $(".awos_more").animate({top:"-238px"},1000);
        $("#awos_curve").animate({top:"-238px"},1000);
    }
    var rno = $("#tdz").attr("rno");
    var code = $("#tdz").attr("code");

    $.ajax({
        type: "get",
        url: meteorologicalHost + "airport/awosRvrStatics",
        data: {
            airport4Code: code,
            rno:rno,
            type:type
        },
        async: true,
        success: function (data) {
            if(data.code===0 && data.data){
                meteogram = new Meteogram(data.data, 'awos_curve');
                meteogram.chart.setTitle({text:title});
                meteogram.type = type
               /* if($("#"+type+"rvr").is(":checked")){
                    meteogram.chart.series[0].show()
                }else{
                    meteogram.chart.series[0].hide()
                }

                if($("#"+type+"rvr1").is(":checked")){
                    meteogram.chart.series[2].show()
                }else{
                    meteogram.chart.series[2].hide()
                }

                if($("#"+type+"wind").is(":checked")){
                    meteogram.chart.series[1].show()
                }else{
                    meteogram.chart.series[1].hide()
                }*/
            }else{
                $("#awos_curve").html("查询错误")
            }
        }
    })
}
function changeAwosCurve(e){
    if(meteogram){
        var id = $(e).attr("id")
        var type = meteogram.type;
        var serie = null;
        if(id.indexOf(type)!==-1){
            if(id.indexOf("10rvr")!==-1){
                serie =  meteogram.chart.series[0];
            }else if(id.indexOf("wind")!==-1){
                serie =  meteogram.chart.series[1];
            }else if(id.indexOf("1rvr")!==-1){
                serie =  meteogram.chart.series[2];
            }
            if(e.checked){
                serie.show();
            }else{
                serie.hide();
            }
        }else{
            $(e).parent().css("color","white")
             e.checked = false;
        }

    }

}



function synTime(TIME){
    return t = TIME.substring(0,10) + ' ' + TIME.substring(11,19);
}
function synFname(FNAME){
    return FNAME.substring(0,FNAME.indexOf("."));
}
function add_syn(ID){
    if(ID === "ZBAA") { //北京首都国际机场
        $('.syn_warn .no_situ_warn').hide();
        var str = '';
        str += '<tr><td>2020-12-31 01:34:37</td><td>31日01时</td><td>PWUJJPP01311</td><td>北京首都机场气象台警报发布序号：02；发布时间：2020-12-31 09:00（北京时）受冷空气影响，目前本场天空不可辩，垂直能见度60米，主导能见度300米。预计北京时间2020-12-31 10:30，垂直能见度60米左右，主导能见度和RVR在400-600米之间波动。10:30-11:00波动上升至4-6个云量，云顶高60米左右，主导能见度和RVR在600-800米之间波动；11:00-12:00主导能见度和RVR在1000-1500米之间波动。</td></tr>';
        $('.syn_warn>.oBox>table>tbody').html(str);
        $('.syn_warn .oBox').show();
        return;
    }
    if(ID === "ZBTJ") {//天津滨海
        $('.syn_warn .no_situ_warn').hide();
        var str = '';
        str += '<tr><td>2020-12-31 01:34:37</td><td>31日01时</td><td>PWUJJPP01311</td><td>天津滨海机场气象台警报发布序号：02；发布时间：2020-12-31 09:00（北京时）受冷空气影响，目前本场天空不可辩，垂直能见度60米，主导能见度300米。预计北京时间2020-12-31 10:30，垂直能见度60米左右，主导能见度和RVR在400-600米之间波动。10:30-11:00波动上升至4-6个云量，云顶高60米左右，主导能见度和RVR在600-800米之间波动；11:00-12:00主导能见度和RVR在1000-1500米之间波动。</td></tr>';
        $('.syn_warn>.oBox>table>tbody').html(str);
        $('.syn_warn .oBox').show();
        return;
    }
    $.ajax({
        type:"get",
        url:"http://211.154.196.242:8091/soap/GetAllAirportWarn1",
        data:{
//			code:'ZBLA',
            code:ID,
        },
        async:true,
        success:function(data){
            if(data.code == 0 && data.data.length > 0){
                $('.syn_warn .no_situ_warn').hide();
                var str = '';
                data.data.forEach(function(e){
                    str += '<tr><td>' + synTime(e.datetime) + '</td><td>' + e.VDate + '</td><td>' + synFname(e.FName) + '</td><td>' + e.image + '</td></tr>';
                })
                $('.syn_warn>.oBox>table>tbody').html(str);
                $(".syn_warn .oBox").show();
            }else{
                $(".syn_warn .oBox").hide();
                $('.syn_warn .no_situ_warn').text("该机场无警报").show();
            }
        },
        error:function(errorText){
            $('.syn_warn .oBox').hide();
            $('.syn_warn .no_situ_warn').text("未获取到数据").show();
        }
    });
}

/**
 * 添加机场警报
 * @param code
 */
function addAirportWarn(code,city){
    $.ajax({
        type:"get",
        url:meteorologicalHost+"airport/airportWarn",
        data:{
            airport4Code:code,
            city:city
        },
        success:function(data){
            if(data.code==0){
                var airportWarn = data.data.airportWarn;
                var terminalWarn = data.data.terminalWarn;
                if(airportWarn && airportWarn.length>0){
                    var str1 = "";
                    for(var i=0;i<airportWarn.length;i++){
                        var pubdate =airportWarn[i].pubdate.replace(/-/g,"").replace(/:/g,"").replace(" ","");
                        str1 +="<div><p>"+airTimeFormat(pubdate,'YYYY-mm-dd HH:MM:SS')+"</p><p>"+airportWarn[i].content+"</p></div>"
                    }
                    $(".airportWarn>.warn_box>.airport_warn").html(str1);
                }else{
                    $(".airportWarn>.warn_box>.airport_warn").html("过去24小时未发布警报");
                }

                if(terminalWarn && terminalWarn.length>0){
                    var str2 = "";
                    for(var i=0;i<terminalWarn.length;i++){
                        var pubdate =terminalWarn[i].pubdate.replace(/-/g,"").replace(/:/g,"").replace(" ","");
                        str2 +="<div><p>"+airTimeFormat(pubdate,'YYYY-mm-dd HH:MM:SS')+"</p><p>"+terminalWarn[i].content+"</p></div>"
                    }
                    $(".airportWarn>.warn_box>.terminal_warn").html(str2);
                }else{
                    $(".airportWarn>.warn_box>.terminal_warn").html("过去24小时未发布警报");
                }
                $(".airportWarn>.warn_box>").show()
                $(".airportWarn>.no_situ_warn").hide()
            }else{
                $(".airportWarn>.warn_box>").hide()
                $(".airportWarn>.no_situ_warn").show()
            }
        }
    });
}

/**
 * 根据机场代码查询雷达观测站
 */
function getRadarStationByCode(code){
    $("#radarSelect").html("<option  value='无' selected>无</option>").attr("code",code);
    $.ajax({
        type:"get",
        url:meteorologicalHost+"airport/radarStation",
        data:{
            airport4Code:code
        },
        success:function(data){
            if(data.code==0 && data.data.length>0){
                var info = data.data;
                var option = "";
                for (let i = 0; i < info.length; i++) {
                    if(i==0){
                        option += "<option  value='"+info[i]+"' selected>"+info[i]+"</option>";
                    }else{
                        option += "<option  value='"+info[i]+"'>"+info[i]+"</option>";
                    }
                }
                $("#radarSelect").html(option).attr("code",code);
                addAirportRadarimg(code);
            }else{
                $("#no_radar").show();
                $("#radarDiv").hide();
            }
        }
    });
}
//创建图像
var pd = document.createElement("img");
pd.src = "../images/pd2.png"
var newRadarTimer = null;
/**
 * 添加机场雷达图
 * @param code 机场代码
 */
function addAirportRadarimg(code){
    var station =$('#radarSelect option:selected').val();
    $('#radarSelect').attr("code",code);
    $("#progressBar").css("width","0px");
    $("#timeDiv").html();
    $(".flex-center img").attr("state","pause").attr("src","../images/player.png");
    window.clearInterval(radar_play_Timer);
    $.ajax({
        type:"get",
        url:meteorologicalHost+"airport/airportRadarimg",
        data:{
            airport4Code:code,
            station:station
        },
        success:function(data){
            if(data.code==0 && data.radarImgs.length>0){
                var info = data.radarImgs
                var li ="";
                var imgs = "";
                for(var i=0	;i<info.length;i++){
                    var time =  new Date(info[i].img_time_utc);
                    var ms = time.getTime();
                    time = dateFormat("HH:MM",time);
                    imgs += "<img id='radarImg"+ms+"' src='"+info[i].imgUrl+"'  />"
                    li += "<li src='"+info[i].imgUrl+"' ms='"+ms+"'>"+time+"</li>"
                }
                $("#timeDiv").html(li);
                $("#radarImgDiv").html(imgs);
                setTimeout(function (){
                    $("#timeDiv li:first").click();
                },500)
                $("#no_radar").hide();
                $("#radarDiv").show();


                var width = $(".container").css("width").replace(/px/,"");
                //计算播放进度条一格的长度
                var length =width/(info.length-1)
                $("#progressBar").css("width",width+"px");
                $("#timeDiv").scrollTop(1);
                $("#timeDiv li").unbind("click");
                $("#timeDiv li").on("click",function(){
                    slelectLi(this,data);
                })

                $(".arrow-left").unbind("click");
                $(".arrow-left").on("click",function(){
                    if($("#timeDiv .active").next().length==0){
                        $("#timeDiv li:first").click();
                    }else{
                        $("#timeDiv .active").next().click()
                    }
                })

                $(".arrow-right").unbind("click");
                $(".arrow-right").on("click",function(){
                    if($("#timeDiv .active").prev().length==0){
                        $("#timeDiv li:last").click();
                    }else{
                        $("#timeDiv .active").prev().click()
                    }
                })

                $("#img").unbind("click");
                $("#img").on("click",function(){
                    drawCanvas("magnifyImg",pd,$("#"+$(this).attr("link")),data.runwayDirection,data.airXY);
                    $("#zz").show();
                    $(".topDiv").show();
                })
                if(newRadarTimer){
                    window.clearInterval(newRadarTimer);
                }
                newRadarTimer =   setInterval(function(){
                    queryNewRadar(code,station,data);
                },120*1000)
            }else{
                $("#no_radar").show();
                $("#radarDiv").hide();
            }
        }
    });
}

/**
 * 雷达图时间li选择事件
 * @param e
 * @param data
 */
function slelectLi(e,data){
    $("#timeDiv li").removeClass("active");
    $(e).addClass("active")
    var image = $("#radarImg"+$(e).attr("ms"))
    window.clearInterval(imageTimer);
    imageTimer =  setInterval(function (){
        drawCanvas("img",pd,image,data.runwayDirection,data.airXY,570,435);
        drawCanvas("magnifyImg",pd,image,data.runwayDirection,data.airXY);
    },50)

    //当前元素索引
    var index = $("#timeDiv li").index(e)
    var width = $(".container").css("width").replace(/px/,"");
    var length =width/($("#timeDiv li").length-1)
    //设置进度条
    width1 = width - length*index;
    $("#progressBar").css("width",width1+"px");
    //设置滚动条位置
    var liHeight = $(e).css("height").replace(/px/,"");
    var height = liHeight*index
    $("#timeDiv").scrollTop(height-380);
}

/**
 * 添加最新的雷达图
 * @param code
 * @param station
 */
function queryNewRadar(code,station,datas){
    //获取最新雷达图时间
    var time = $("#timeDiv>li:first").attr("ms")
    $.ajax({
        type: "get",
        url: meteorologicalHost + "airport/newRadarStation",
        data: {
            airport4Code: code,
            station: station,
            time: time
        },
        success: function (data) {
            if(data.code==0 && data.data.length>0){
                var info = data.data;
                var li = "";
                var imgs = "";
                for(var i=0	;i<info.length;i++){
                    var time =  new Date(info[i].img_time_utc);
                    var ms = time.getTime();
                    time = dateFormat("HH:MM",time);
                    imgs += "<img id='radarImg"+ms+"' src='"+info[i].imgUrl+"'  />"
                    li += "<li src='"+info[i].imgUrl+"' ms='"+ms+"'>"+time+"</li>"
                }
                $("#timeDiv").prepend(li);
                $("#radarImgDiv").prepend(imgs);

                var width = $(".container").css("width").replace(/px/,"");
                //计算播放进度条一格的长度
                var length =width/( $("#timeDiv li").length-1)
                //当前元素索引
                var index = $("#timeDiv li").index($("#timeDiv .active")[0])
                //设置进度条
                width1 = width - length*index;
                $("#progressBar").css("width",width1+"px");
                $("#timeDiv li").unbind("click");
                $("#timeDiv li").on("click",function(){
                    slelectLi(this,datas);
                })
            }
        }
    })
}


var imageTimer = null;
/**
 * 开始绘制雷达图
 * @param id
 * @param pd
 * @param image
 * @param runwayDirection
 * @param airXY
 * @param width
 * @param height
 */
var loadingNum = 0;
function drawCanvas(id,pd,image,runwayDirection,airXY,width,height){
    if(!image[0].complete){
        loading(id,image);
        return;
    }
    loadingNum = 0;
    window.clearInterval(imageTimer);
   // window.clearTimeout(imageTimer);
    //绘制图片
    //创建canvas对象
    var canvas = document.getElementById(id);
    canvas.setAttribute("link",image.attr("id"));
    //创建画布
    var ctx = canvas.getContext('2d');

    var w = image.css("width").replace(/px/,"")
    var h = image.css("height").replace(/px/,"")
    canvas.width = width ? width : w;
    canvas.height = height ? height : h;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var params = {color:"red","w":w,"h":h};
    drawRadar(ctx,pd,image[0],params,canvas,runwayDirection,airXY)
}

/**
 * 点击播放条改变雷达图
 * @param e
 */
function changeRadarImge(e){
    //播放条总长度
    var width = $(".container").css("width").replace(/px/,"");
    //图片总数
    var li = $("#timeDiv>li");
    var num = $("#timeDiv>li").length;
    //图片在播放条上一格的长度
    var length = width/num;
    //获取缩放比例
    var zoom = $(".scaleItem").css("zoom")
    var x = e.offsetX/zoom
    var liIndex = Math.round(x/length)>num ? num :Math.round(x/length);
    $(li[num-liIndex]).click();
}

/**
 * 图片加载中
 * @param id
 * @param image
 */
function loading(id,image) {
    if(loadingNum>0){
        return
    }
    loadingNum++;
    var deg1 = 0;
    var index = 1;
    var opa = 1;
    var flag = true;
    var canvas = document.getElementById(id);
    canvas.setAttribute("link",image.attr("id"));
    var ctx = canvas.getContext('2d');
    canvas.height = 435;
    canvas.width = 570;
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var PI = Math.PI;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(48,128,236,1)';
    ctx.lineWidth = 5;
    // 过渡
    ctx.arc(centerX, centerY, 100, PI * 3 / 2, deg1 * PI / 180 + PI * 3 / 2);
    if (deg1 < 360) {
        if (deg1 < 180) {
            index *= 1.08;
        } else {
            index /= 1.08;
        }
        deg1 += index;
    }
    if (deg1 >= 360) {
        deg1 = 0;
    }
    ctx.stroke();
    ctx.beginPath();
    if (flag) {
        opa -= 0.02;
        if (opa < 0.2) {
            flag = false;
        }
    } else {
        opa += 0.02;
        if (opa > 1) {
            flag = true;
        }
    }
    ctx.font = "Bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(48,128,236," + opa + ")";
    ctx.fillText("图片加载中...", centerX, centerY + 5);
}

/**
 * 绘制雷达图
 * @param ctx
 * @param pd
 * @param img
 * @param params
 * @param canvas
 * @param runwayDirection
 * @param airXY
 */
function drawRadar(ctx,pd,img,params,canvas,runwayDirection,airXY){
    //保存当前画布 以便使用clearRect()
    ctx.save();
    //绘制图像
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    if(airXY && runwayDirection.length>0){
        var x = airXY.x;
        var y = airXY.y;
        for (let i = 0; i < runwayDirection.length; i++) {
            var direction = runwayDirection[i].split(",")[0];
            ctx.save();
            //重新定定原点
            ctx.translate(x*(canvas.width /params.w),y*(canvas.height/params.h));
            //旋转画布弧度
            ctx.rotate(direction*Math.PI/180);
            ctx.drawImage(pd,-4,-13);
            //恢复画布原来的状态
            ctx.restore();
        }

        //绘制圆点
        ctx.beginPath();
        ctx.arc(x*(canvas.width /params.w),y*(canvas.height/params.h),2,0,360);
        ctx.strokeStyle = params.color;
        ctx.fillStyle=params.color;
        //填充
        ctx.fill();
        //绘制
        ctx.stroke();
        //关闭绘图
        ctx.closePath();
    }

}


/**
 * 雷达图选择类型改变事件处理
 * @param e
 */
function selectRadar(e){
    addAirportRadarimg($('#radarSelect').attr("code"));
}


/**
 * 雷达图播放
 * @type {null}
 */
var radar_play_Timer = null;
function playOrPause(e){
    if($("#radarDiv").css("display")!=="none"){
        if($(e).attr("state")=="pause"){
            $(e).attr("src","../images/pause.png")
            $(e).attr("state","play")
            radar_play_Timer = window.setInterval(function(){
                $("#radarDiv .arrow-right").click();
            },1000)
        }else{
            window.clearInterval(radar_play_Timer)
            $(e).attr("src","../images/player.png")
            $(e).attr("state","pause")
        }
    }
}

//机场报文
function add_mess(ID){
    window.clearTimeout(messTimer);
    mess(ID)
     messTimer = setInterval(function(){
         mess(ID)
         if($(".air_port").css("left")=="-740px"){
             window.clearTimeout(messTimer)
         }
    },30000)
}
function mess(ID){
    var sk_str = '';
    var yb_str = '';
    $.ajax({
        type:"get",
        url:meteorologicalHost+"airport/rawReport",
        async:true,
        data:{
            airport4Code:ID
        },
        success:function(data){
            if(data.code==0){
                var html = "";
                var sk =data.data.sk;
                var yb =data.data.yb;
                if(sk.length>0){
                    for(var i=0;i<sk.length;i++){
                        sk_str+="<p>"+sk[i].rptcontent+"</p>";
                    }
                }
                if(yb.length>0){
                    for(var i=0;i<yb.length;i++){
                        yb_str+="<p>"+yb[i].rptcontent+"</p>";
                    }
                }
                $("#sk").html(sk_str);
                $("#yb").html(yb_str);
            }else{
                $('.message').html('<p class="no_air_warn">未获取到报文数据</p>');
            }
        }
    });
}
function get_3time(){
    return moment().subtract(11, "hours").format("YYYYMMDDHHmmss");
}
function get_reftime(t){
    return moment(t, "YYYY-MM-DD HH:mm:ss.0").format("YYYYMMDDHHmmss");
}

function wind_dir_16(c){
    if(c<11.25){
        return "N";
    }else if(c<33.75){
        return "NNE";
    }else if(c<56.25){
        return "NE";
    }else if(c<78.75){
        return "ENE";
    }else if(c<101.25){
        return "E";
    }else if(c<123.75){
        return "ESE";
    }else if(c<146.25){
        return "SE";
    }else if(c<168.25){
        return "SSE";
    }else if(c<191.25){
        return "S";
    }else if(c<213.75){
        return "SSW";
    }else if(c<236.25){
        return "SW";
    }else if(c<258.75){
        return "WSW";
    }else if(c<281.25){
        return "W";
    }else if(c<303.75){
        return "WNW";
    }else if(c<326.25){
        return "NW";
    }else if(c<348.75){
        return "NNW";
    }else{
        return "N";
    }
}
function wind_ch_16(c){
    if(c<11.25){
        return "北";
    }else if(c<33.75){
        return "北东北";
    }else if(c<56.25){
        return "东北";
    }else if(c<78.75){
        return "东东北";
    }else if(c<101.25){
        return "东";
    }else if(c<123.75){
        return "东东南";
    }else if(c<146.25){
        return "东南";
    }else if(c<168.25){
        return "南东南";
    }else if(c<191.25){
        return "南";
    }else if(c<213.75){
        return "南西南";
    }else if(c<236.25){
        return "西南";
    }else if(c<258.75){
        return "西西南";
    }else if(c<281.25){
        return "西";
    }else if(c<303.75){
        return "西西北";
    }else if(c<326.25){
        return "西北";
    }else if(c<348.75){
        return "北西北";
    }else{
        return "北";
    }
}
function PrefixInteger(num, length) {
    return ( "0000000000000000" + num ).substr( -length );
}
function getData(FLIGHT,TIME,STATE){
    var data;
    air_lines.forEach(function(e){
        if(e.flight == FLIGHT && e.time == TIME && e.state == STATE){
            data = e.data;
        }
    })
    return data;
}
function getTow(FLIGHT,TIME,STATE){
    var two;
    air_lines.forEach(function(e){
        if(e.flight == FLIGHT && e.time == TIME && e.state == STATE){
            two = e.two;
        }
    })
    return two;
}
function getDash(FLIGHT,TIME,STATE){
    var data;
    air_lines.forEach(function(e){
        if(e.flight == FLIGHT && e.time == TIME && e.state == STATE){
            data = e.dash;
        }
    })
    return data;
}
function getSug(FLIGHT,TIME,STATE){
    var suggest;
    air_lines.forEach(function(e){
        if(e.flight == FLIGHT && e.time == TIME && e.state == STATE){
            suggest = e.suggest;
        }
    })
    return suggest;
}
function eg_add_line(FLIGHT,TIME,STATE){
    point_arr = [];
    angle_arr = [];
    var str = '';
    var str1 = [];
    var datas = getData(FLIGHT,TIME,STATE);
    var two = getTow(FLIGHT,TIME,STATE);
    datas.forEach(function(e,i){
        var arr = [e.lon,e.lat];
        point_arr.push(arr);
        var color = e.color;
        var ttt = e.time;
        var line_time = transTime(ttt);
        var new_time = transTime1(ttt);
        str += '<li name="'+line_time+'">'+ new_time +'</li>';
        //添加点
        if(i>0 && i<datas.length-1){
            var mk = get_r();
            var marker = L.circleMarker(arr, {
                stroke: true,
                color: color,
                weight: 1,
                opacity: 1,
                fillColor: color,
                fillOpacity: 1,
                radius: mk,
                pane:'flight'
            }).addTo(flightGroup);
            re_radius(marker);
            var add_html = '<div class="hover_div">时间：'+new_time+'</br>经度：'+e.lon+'</br>纬度：'+e.lat+'</br></div>'
            marker.on("mouseover", function() {
                n_marker = L.marker(arr, {
                    icon: iIcon(add_html),
                    pane: "hover"
                }).addTo(flightGroup);
            })
            marker.on("mouseout", function() {
                flightGroup.removeLayer(n_marker);
            })
        }
        //添加线
        if(i<datas.length-1){
            var this_angle = get_angle(datas[i].lon,datas[i].lat,datas[(i+1)].lon,datas[(i+1)].lat);
            angle_arr.push(this_angle);
            var latlng = [];
            var arr1 = [datas[(i+1)].lon,datas[(i+1)].lat];
            latlng.push(arr,arr1);
            var color1 = datas[(i+1)].color;
            var line_color = sel_color1(color,color1);
            str1.push(line_color);
            var c_arr = str1.join(',');
            $('.y_timer').css({'background':'linear-gradient(to right,'+c_arr+')'});
            var wk = get_w();
            var roll = L.polyline(latlng,{
                color:line_color,
                weight: wk,
                pane:'line',
                dashArray:[10,10]
            }).addTo(flightGroup);
            re_weight(roll);
            var iNum = 0;
            var n_e = setInterval(function(){
                iNum -= 1;
                roll.redraw().setStyle({dashOffset:iNum});
            },50)
        }
        //添加绕飞路线
        if(two == 'yes'){
            var dash = getDash(FLIGHT,TIME,STATE);
            if(i<dash.length){
                var dash0 = [dash[i].lon,dash[i].lat];
                var co1 = dash[i].color;
                var mk = get_r();
                var k_marker = L.circleMarker(dash0, {
                    stroke: true,
                    color: co1,
                    weight: 1,
                    opacity: 1,
                    fillColor: co1,
                    fillOpacity: 1,
                    radius: mk,
                    pane:'dash'
                }).addTo(flightGroup);
                re_radius(k_marker);
            }
            if(i<dash.length-1){
                var dash_arr = [];
                var dash1 = [dash[(i+1)].lon,dash[(i+1)].lat];
                dash_arr.push(dash0,dash1);
                var co2 = dash[(i+1)].color;
                var dash_color = sel_color1(co1,co2);
                var wk = get_w();
                var l = L.polyline(dash_arr,{
                    color:dash_color,
                    weight: wk,
                    pane:'line',
                    dashArray:[10,10]
                }).addTo(flightGroup);
                re_weight(l);
            }
        }
    })
    $('.y_time').html(str);
    $('.y_time>li').eq(0).addClass('li_sel');
    $('.s_drag').animate({left:0},400);
    down_all();
    $('.y_time>li').click(function(){
        $('.y_time>li').removeClass('li_sel');
        var index = $(this).index();
        var len = $('.y_time>li').length - 1;
        var left = (index/len).toFixed(2) * 100 + '%';
        $('.s_drag').animate({left:left},400);
        $(this).addClass('li_sel');
        new_click();
    })
}
function sel_color1(C1,C2){
    var color;
    if(C1 == 'red' || C2 == 'red'){
        color = 'red';
    }else if(C1 == 'yellow' || C2 == 'yellow'){
        color = 'yellow';
    }else{
        color = 'green';
    }
    return color;
}
$('#to_play').click(function(){
    if($(this).attr('src') == 'img/start.png'){
        set_play();
    }else{
        $('#to_play').attr('src','img/start.png');
        clearInterval(interTime);

        lineAnimation.motionPause();
    }
})

var lineAnimation = null;//motion对象
var playSpeed = 1000;//播放倍速
let slideDistanceTotla = 0;//单次播放总的移动距离
let playIsCpmplete = true;//播放完成或者未完成(是否暂停)
function set_play(){

    flightGroup.removeLayer(initAirIconMarker_top);//移出初始图标

    if(playIsCpmplete == true){
        slideDistanceTotla = 0;

        lineAnimation.motionOptions.duration = timeSpan/playSpeed;
        lineAnimation.motionStart();
    }else{

        lineAnimation.motionResume();
    }

    initAirIconMarker_top = lineAnimation.getMarker();

    playIsCpmplete = false;
    lineAnimation.off(L.Motion.Event.Ended);
    lineAnimation.on(L.Motion.Event.Ended, function (e) {
        if(lineArr_top.length>0){
            lineAnimation.getMarker().setLatLng(lineArr_top[0]);
            lineAnimation.getMarker().setRotationAngle(getAngle({lat:lineArr_top[0][0],lng:lineArr_top[0][1]},{lat:lineArr_top[1][0],lng:lineArr_top[1][1]}));

        }

        playIsCpmplete = true;
    })

    //时间轴动画

    //计算移动次数(每秒移动一次)与移动时间间隔、每次移动距离等等
    let slideDistance = (100.7/timeSpan)*1000*60; //每分钟钟所代表的时间轴长度（百分比）

    $('#to_play').attr('src','img/stop.png');
    interTime = setInterval(function(){
        slideDistanceTotla += slideDistance;

        if(slideDistanceTotla>= 100.7){
            clearInterval(interTime);
            slideDistanceTotla = 0;

            $('#to_play').attr('src','img/start.png');
            clearInterval(interTime);
        }

        //$('.y_time>li').removeClass('li_sel');
        //$('.y_time>li').eq(i).addClass('li_sel');
        //interFunLine.update();

        $('.s_drag').css({left:slideDistanceTotla+"%"});
        $("#y_timer_in").css("width",slideDistanceTotla+"%");

        $(".s_drag .s_drag_label").html(dateFormat("mm-dd HH:MM:SS",new Date(linePointsDistanceArr_top[0].timestamp+timeSpan*slideDistanceTotla/100)));
        //new_click();
    },(1000*60)/playSpeed);
}

function stop_play(){
    $('#to_play').attr('src','img/start.png');
    clearInterval(interTime);
}
function addPage(num) {
    $("#ypage_sel").attr("num", 1);
    $.jqPaginator('#ypage_sel', {
        totalPages: num,
        visiblePages: 10,
        currentPage: 1,
        first: '<li class="first"><a href="javascript:void(0);">首页</a></li>',
        prev: '<li class="prev"><a href="javascript:void(0);">上一页</a></li>',
        next: '<li class="next"><a href="javascript:void(0);">下一页</a></li>',
        last: '<li class="last"><a href="javascript:void(0);">尾页</a></li>',
        page: '<li class="page"><a href="javascript:void(0);">{{page}}</a></li>',
        onPageChange: function(num, type) {
            $("#ypage_sel").attr("num", num);
            var start = (num - 1) * 5;
            var end = start + 4;
            y_change(start, end);
        }
    });
}
function y_change(start, end) {
    $(".suggest table tbody tr").each(function(i) {
        if(i > end || i < start) {
            $(this).hide();
        } else {
            $(this).show();
        }
    });
}
function get_angle(lng_a,lat_a, lng_b, lat_b){	x = parseFloat(lng_b) - parseFloat(lng_a);
    y = parseFloat(lat_b) - parseFloat(lat_a);
    var hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    //斜边长度
    var cos = x / hypotenuse;
    var radian = Math.acos(cos);
    //求出弧度
    var angle = 180 / (Math.PI / radian);
    //用弧度算出角度
    if(y < 0) {
        angle = -angle;
    } else if((y == 0) && (x < 0)) {
        angle = 180;
    }
    return angle-92.5;
}
function xhr_pro(PATH,DATA,ELE){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', PATH, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
        var binaryString = pako.ungzip(this.response, {
            to: 'string'
        });
        /*console.log(binaryString);*/
        let resultData = JSON.parse(binaryString).data;
        DATA.interval = resultData.resolution_lat;
        DATA.latmax = resultData.latMax;
        DATA.latmin = resultData.latMin;
        DATA.lonmax = resultData.lngMax +90;
        DATA.lonmin = resultData.lngMin + 90;
        DATA.nlat= 281;
        DATA.nlon= 361;
        o = JSON.parse(resultData.data);
        //console.log(o);
        for(var i = 0; i < o.length; i++) {
            for(var j = 0; j < o[i].length; j++) {
                if(ELE == 'dbz'){
                    //实况/10     预报不除
                    if(DATA.state == 'sk'){
                        o[i][j] = o[i][j] / 10
                    }else{
                        o[i][j] = o[i][j] / 10
                    }
                }else if(ELE == 'ice' || ELE == 'yz' || ELE=="qk"){
                    //o[i][j] = o[i][j] * 10
                    o[i][j] = o[i][j]
                }else if(ELE == 'Ic' || ELE == 'Is'){
                    o[i][j] = o[i][j]
                }else if(ELE = "T2"){
                    o[i][j] = o[i][j] - 273.15;
                }else{
                    //o[i][j] = o[i][j]/10;
                    o[i][j] = o[i][j];
                }
            }
        }
        //console.log(o);
        var data = {
            latmin: DATA.latmin,
            latmax: DATA.latmax,
            lonmin: DATA.lonmin,
            lonmax: DATA.lonmax,
            interval: DATA.interval,
            nlat: DATA.nlat,
            nlon: DATA.nlon,
            ele:ELE,
            data: o
        }
        var rgba = colors[ELE];
        setTimeout(function(){
            if(proGroup.hasLayer(i_pre)){
                proGroup.removeLayer(i_pre);
            }
        },90);
        i_pre = i_now;
        i_now = L.tileLayer.drawImg(data, {
            color: rgba, //阈值，必传参数
            tile_size: 128, //设置渲染分辨率，越大越清晰
            gradient: 0.4, //设置渐变度，越小渐变越小,最大0.5,0.25是完全渐变
            opacity: 1,
            pane:'radar'
        }).addTo(proGroup);
    }
    xhr.send();
}
function ice_now(TIME){
    var t1 = parseInt(TIME.substring(8,10));
    if(t1%3 == 0){
        var r_t = TIME;
    }else if(t1%3 == 1){
        var r_t = moment(TIME, "YYYYMMDDHH").subtract(1, "hours").format("YYYYMMDDHH");
    }else if(t1%3 == 2){
        var r_t = moment(TIME, "YYYYMMDDHH").add(1, "hours").format("YYYYMMDDHH");
    }
    return r_t;
}
function vis_now(){
    return moment().format("YYYYMMDDHH");
}
function get_now(){
    return moment().subtract(8, "hours").format("YYYYMMDDHH");
}
function get_0hour(){
    return moment().subtract(8, "hours").format("YYYYMMDDHH00");
}
function get_thishour(){
    return moment().subtract(6, "hours").format("YYYYMMDDHH00");
}
function get_4hour(){
    return moment().subtract(4, "hours").format("YYYYMMDDHH00");
}
function PrefixInteger(num, length) {
    return ( "0000000000000000" + num ).substr( -length );
}
function get_vis_now(){
    var t = moment().subtract(8, "hours").format("YYYYMMDDHH00");
    var t1 = parseInt(t.substring(8,10));
    if(t1%3 == 0){
        var r_t = t;
    }else if(t1%3 == 1){
        var r_t = moment(t, "YYYYMMDDHHmm").subtract(1, "hours").format("YYYYMMDDHHmm");
    }else if(t1%3 == 2){
        var r_t = moment(t, "YYYYMMDDHHmm").add(1, "hours").format("YYYYMMDDHHmm");
    }
    return r_t;
}
function set_zhou(T){
    var zhou = {0:'周日',1:'周一',2:'周二',3:'周三',4:'周四',5:'周五',6:'周六'}
    return zhou[T];
}
function transAirTime(TIME){
    return set_zhou(moment(TIME, "YYYYMMDDHHmm").format("d")) +  moment(TIME, "YYYYMMDDHHmm").format("DD");
}
function transTime00(TIME){
    return moment(TIME, "YYYYMMDDHH").add(8,'hours').format("YYYYMMDDHHmm");
}
function transTime0(TIME){
    return moment(TIME, "YYYYMMDDHHmmss").add(8,'hours').format("YYYY-MM-DD HH:mm");
}
function transTime1(TIME){
    return moment(TIME, "YYYY-MM-DD HH:mm:ss").add(8,'hours').format("HH:mm");
}
function transTime2(TIME,i){
    return moment(TIME, "YYYYMMDDHHmm").subtract(i*6, "minutes").format("YYYYMMDDHHmm");
}
function transTime3(TIME,i){
    return moment(TIME, "YYYYMMDDHHmm").add(8,'hours').subtract(i*6, "minutes").format("HH:mm");
}
function transTime3_drag(TIME,i){
    return set_zhou(moment(TIME, "YYYYMMDDHHmm").add(8,'hours').subtract(i*6, "minutes").format("d")) +  moment(TIME, "YYYYMMDDHHmm").add(8,'hours').subtract(i*6, "minutes").format("DD HH:mm");
}
function transTime4(TIME,i){
    return moment(TIME, "YYYYMMDDHHmm").add(i*6, "minutes").format("YYYYMMDDHHmm");
}
function transTime5(TIME,i){
    return moment(TIME, "YYYYMMDDHHmm").add(8,'hours').add(i*6, "minutes").format("HH:mm");
}
function transTime5_drag(TIME,i){
    return set_zhou(moment(TIME, "YYYYMMDDHHmm").add(8,'hours').add(i*6, "minutes").format("d")) + moment(TIME, "YYYYMMDDHHmm").add(8,'hours').add(i*6, "minutes").format("DD HH:mm");
}
function transTime6(TIME){
    return moment(TIME, "YYYYMMDDHHmm").subtract(6, "minutes").format("YYYYMMDDHHmm");
}
function transTime7(TIME,i){
    return moment(TIME, "YYYYMMDDHHmm").add(i, "days").format("YYYYMMDDHH");
}
function transTime8(TIME,i){
    return set_zhou(moment(TIME, "YYYYMMDDHHmm").add(8,'hours').add(i, "days").format("d"))+moment(TIME, "YYYYMMDDHHmm").add(8,'hours').add(i, "days").format("DD");
}
function transTime8_hov(TIME,i){
    return moment(TIME, "YYYYMMDDHHmm").add(8+i, "hours").format("HH:mm");
}
function transTime8_drag(TIME,i){
    return set_zhou(moment(TIME, "YYYYMMDDHHmm").add(8+i,'hours').format("d"))+moment(TIME, "YYYYMMDDHHmm").add(8+i,'hours').format("DD HH:mm");
}
function transTime8_trans(TIME,i){
    return moment(TIME, "YYYYMMDDHHmm").add(i, "hours").format("YYYYMMDDHH");
}
function transTime9(TIME,i){
    return moment(TIME, "YYYYMMDDHH").add(i, "hours").format("YYYYMMDDHHmm");
}
function transTime10(TIME,i){
    return set_zhou(moment(TIME, "YYYYMMDDHHmm").add(i, "days").format("d"))+moment(TIME, "YYYYMMDDHHmm").add(i, "days").format("DD");
}
function transTime10_hov(TIME,i){
    return moment(TIME, "YYYYMMDDHHmm").add(i, "hours").format("HH:mm");
}
function transTime10_drag(TIME,i){
    return set_zhou(moment(TIME, "YYYYMMDDHHmm").add(i,'hours').format("d"))+moment(TIME, "YYYYMMDDHHmm").add(i,'hours').format("DD HH:mm");
}
function transTime10_trans(TIME,i){
    return moment(TIME, "YYYYMMDDHHmm").add(i, "hours").format("YYYYMMDDHHmm");
}
function transTime11_trans(TIME,i){
    return moment(TIME, "YYYYMMDDHHmm").subtract(8, "hours").add(i, "hours").format("YYYYMMDDHHmm");
}
function transTime12(TIME){
    return moment(TIME, "YYYYMMDDHHmm").add(8,'hours').format("HH:mm");
}
function transTime12_drag(TIME){
    return set_zhou(moment(TIME, "YYYYMMDDHHmm").add(8,'hours').format("d"))+moment(TIME, "YYYYMMDDHHmm").add(8,'hours').format("DD HH:mm");
}
function transTime13_hov(TIME,i){
    return moment(TIME, "YYYYMMDDHHmm").add(8+i*3, "hours").format("HH:mm");
}
function transTime13_drag(TIME,i){
    return set_zhou(moment(TIME, "YYYYMMDDHHmm").add(8+i*3,'hours').format("d"))+moment(TIME, "YYYYMMDDHHmm").add(8+i*3,'hours').format("DD HH:mm");
}
function transTime13_trans(TIME,i){
    return moment(TIME, "YYYYMMDDHHmm").add(i*3, "hours").format("YYYYMMDDHH");
}

/**
 *
 * @param i
 * 设置时间轴当前时间
 */
function re_drag(time){
    var iW = parseFloat($('.i_avbl').css('width'));
    //计算时间轴状态
    let timeParamTime = airTimeFormat(time,null,"ED8");

    //最大最小时间判断修正，不能大于时间轴最大时间，不能小于时间轴最小时间
    let maxTime = airTimeFormat(timeLineTimeList_top[timeLineTimeList_top.length-1],null,"ED8");
    let minTime = airTimeFormat(timeLineTimeList_top[0],null,"ED8");

    if(timeParamTime>maxTime){
        timeParamTime = maxTime;
    }else if(timeParamTime<minTime){
        timeParamTime = minTime;
    }

    let lengthPer =  (timeParamTime.getTime() - airTimeFormat(timeLineTimeList_top[0],null,"ED8").getTime())/timeSpanAll_top;
    let playedLength =lengthPer*iW;

    //设置时间显示文本
    let timeStr = dateFormat("YYYY-mm-dd HH:MM:SS",timeParamTime);
    $('.i_drag').html(timeStr);

    //最大最小时间判断修正后的时间
    let timeModify = dateFormat("YYYYmmddHHMMSS",timeParamTime);
    $('.i_drag').attr('t',timeModify);
    //$('.i_drag').attr('state',state_arr[i]);


    $('.i_drag').css('left',(playedLength-43)+'px');
    $('.i_played').css('width',playedLength+'px');
}

function add_3day(TIME){
    return moment(TIME, "YYYYMMDDHH").add(72,'hours').format("YYYYMMDDHH");
}

var div1Icon = function(html) {
    return L.divIcon({
        className: "a",
        iconAnchor: [10, 23],
        html: '<div class="y_guige">' + html + '</div>'
    })
}
function get_level(height) {
    var max = 11;
    var zoom = map.getZoom();
    if(Number(height) < 1000) {
        max = 8
    }
    var level;
    if(zoom > max) {
        level = 1;
    } else {
        level = Math.pow(2, max - zoom);
    }
    return level;
}
var interFun = {
    add : function(){
        var iEle = $('.y_pro>li.active').attr('name');
        var sTime = $('.i_drag').attr('st');
        var iTime = $('.i_drag').attr('t');
        var iState = $('.i_drag').attr('state');
        if(iEle == 'dbz'){
            if(iState == 'sk'){
                var path = IP8081_1+'pic/getRadarData?time=' + iTime;
                var data = {
                    latmin: 12.2,
                    latmax: 54.2,
                    lonmin: 73,
                    lonmax: 135,
                    interval: 0.05,
                    nlat: 840,
                    nlon: 1240,
                    state:iState
                }
                /*var data = {
					latmin: 23.63,
					latmax: 31.39,
					lonmin: 108.37,
					lonmax: 115.19,
					interval: 0.01,
					nlat: 777,
					nlon: 683,
					state:iState
				}*/
            }else{
                var path = IP8087 + 'radardata/getFcstGridBinary?stime=' + sTime + '&time=' + iTime + '&element=' + iEle;
                var data = {
                    latmin: 23.63,
                    latmax: 31.39,
                    lonmin: 108.37,
                    lonmax: 115.19,
                    interval: 0.01,
                    nlat: 777,
                    nlon: 683,
                    state:iState
                }
            }
            xhr_pro(path,data,iEle);
        }else if(iEle == 't2'){
            if(iState == 'sk'){
                var data = {
                    latmin: 15,
                    latmax: 59.9,
                    lonmin: 70,
                    lonmax: 139.9,
                    interval: 0.1,
                    nlat: 450,
                    nlon: 700,
                }
                var path = IP8081_1+'pic/getData?time='+iTime.substring(0,10)+'&type=t2';
            }else{
                if(tem_now == 1000){
                    var data = {
                        latmin: 17,
                        latmax: 55,
                        lonmin: 72,
                        lonmax: 136.0,
                        interval: 0.05,
                        nlat: 761,
                        nlon: 1281,
                    }
                }else{
                    data = {
                        latmin: -10,
                        latmax: 60,
                        lonmin: 60,
                        lonmax: 150,
                        nlon: 361,
                        nlat: 281,
                        interval: 0.25,
                    }
                    iEle = 't';
                }
                //var path = IP8087 + 'ShortMid/getGridData?stime=' + sTime + '&time=' + iTime + '&element='+iEle+'&product=ec&lev=' + tem_now;
                //t_20210127150000_1000_0_0.25
                var path = "http://localhost:8000/meteorological/queryAreaData?time=20210127150000&altitude=1000&dataType=t&areaCode=0"
            }
            xhr_pro(path,data,iEle);
        }else if(iEle == 'wind10'){
            if(iState == 'sk'){
                var data = {
                    latmin: 15,
                    latmax: 59.9,
                    lonmin: 70,
                    lonmax: 139.9,
                    interval: 0.1,
                    nlat: 450,
                    nlon: 700,
                }
                var winddata = {
                    latmin: 15,
                    latmax: 59.9,
                    lonmin: 70,
                    lonmax: 139.9,
                    interval: 0.1,
                    nlat: 450,
                    nlon: 700,
                }
                var path = IP8081_1+'pic/getData?time='+iTime.substring(0,10)+'&type=wind';
            }else{
                if(tem_now == 1000){
                    var data = {
                        latmin: 17,
                        latmax: 55,
                        lonmin: 72,
                        lonmax: 136.0,
                        interval: 0.05,
                        nlat: 761,
                        nlon: 1281,
                    }
                    var winddata = {
                        latmin: 17,
                        latmax: 55,
                        lonmin: 72,
                        lonmax: 136,
                        interval: 0.1,
                        nlat: 381,
                        nlon: 641,
                    };
                }else{
                    data = {
                        latmin: -10,
                        latmax: 60,
                        lonmin: 60,
                        lonmax: 150,
                        nlon: 361,
                        nlat: 281,
                        interval: 0.25,
                    }
                    var winddata = {
                        latmin: -10,
                        latmax: 60,
                        lonmin: 60,
                        lonmax: 150,
                        nlon: 361,
                        nlat: 281,
                        interval: 0.25,
                    }
                    iEle = 'wind'
                }
                var path = IP8087 + 'ShortMid/getGridData?stime=' + sTime + '&time=' + iTime + '&element='+iEle+'&product=ec&lev=' + tem_now;
            }
            xhr_pro(path,data,iEle);
            function getData1(type) {
                return new Promise(function(resolve, reject) {
                    if(iState == 'sk'){
                        var url = IP8081_1+'pic/getData?time='+iTime.substring(0,10)+'&type=' + type;
                    }else{
                        var url = "http://211.154.196.238:8087/ShortMid/getGridData?stime="+sTime+"&time="+iTime+"&element=" + type + "&product=ec&lev="+tem_now;
                    }
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.responseType = "arraybuffer";
                    xhr.onload = function() {
                        var binaryString = pako.ungzip(this.response, {
                            to: 'string'
                        });
                        winddata[type] = JSON.parse(binaryString);
                        resolve("success");
                    }
                    xhr.send();
                })
            }
            Promise.all([getData1("u"), getData1("v")]).then(function(values) {
                for(var i = 0; i < winddata.u.length; i++) {
                    for(var j = 0; j < winddata.u[i].length; j++) {
                        winddata.u[i][j] = winddata.u[i][j] / 10;
                        winddata.v[i][j] = winddata.v[i][j] / 10;
                    }
                }
                L.Layer.canvasLayer(winddata, {}).addTo(windGroup)
            })
        }else if(iEle == 'vis'){
            if(iState == 'sk'){
                var path = IP8081_1+'pic/getData?time='+iTime.substring(0,10)+'&type='+iEle;
                var data = {
                    latmin: 17,
                    latmax: 55,
                    lonmin: 72,
                    lonmax: 136.0,
                    interval: 0.05,
                    nlat: 761,
                    nlon: 1281,
                }
            }else{
                var path = IP8081_1+'pic/getData?stime='+sTime.substring(0,10)+'&time='+iTime;
                var data = {
                    latmin: 0,
                    latmax: 60,
                    lonmin: 70,
                    lonmax: 140,
                    interval: 0.05,
                    nlat: 1201,
                    nlon: 1401
                }
            }
            xhr_pro(path,data,iEle);
        }else if(iEle == 'img'){
            proGroup.clearLayers();
            var sTime = iTime.substring(0,8);
            var imageUrl = 'http://211.154.196.238:8889/kh8-base/'+sTime+'/vis_'+iTime+'.jpg';
            var imageBounds = [[1,70],[56,150]];
            var layer = L.imageOverlay(imageUrl, imageBounds).addTo(iconGroup);
        }else if(iEle == 'ice' || iEle == 'qk' || iEle == 'yz'){
            var iT = $('.kwbc_egrr>span.active').attr('name');
            if(iT == 'ice_shear'){
                if(iEle == 'ice'){
                    iT = 'Ic';
                    iEle = 'Ic';
                }else{
                    iT = 'Is';
                    iEle = 'Is';
                }
                theCs = iT;
                var data = {
                    latmin:-10,
                    latmax:60,
                    nlat:281,
                    lonmin:60,
                    lonmax:150,
                    nlon:361,
                    interval:0.25
                }
            }else{
                var ele_='Ic';//华盛顿中心 伦敦中心 颜色全部参考云象
                theCs = iT+'/'+iEle;
                iEle = ele_;
                var data = {
                    latmin:0,
                    latmax:58.75,
                    nlat:48,
                    lonmin:70,
                    lonmax:138.75,
                    nlon:56,
                    interval:1.25
                }
            }
            var path = IP8081_1+'pic/getHkData?type='+theCs+'&stime='+sTime+'&time='+iTime+'&pre='+tem_now;
            xhr_pro(path,data,iEle);
        }else if(iEle == 'vms' || iEle == 'sand'){
            //console.log(iEle)
            if(iEle == 'vms'){
                iTy = iEle + tem_now;
                var data = {
                    latmin: 0,
                    latmax: 60,
                    lonmin: 70,
                    lonmax: 150,
                    nlat: 240,
                    nlon: 320,
                    interval: 0.25
                }
            }else{
                iTy = iEle;
                var data = {
                    latmin: 0,
                    latmax: 60,
                    lonmin: 70,
                    lonmax: 140,
                    nlat: 240,
                    nlon: 280,
                    interval: 0.25
                }
            }
            var path = IP8081_1+'pic/getTypesData?type='+iTy+'&stime='+sTime+'&time='+iTime;
            xhr_pro(path,data,iEle);
        }else if(iEle == 'pre'){
            if(iState == 'sk'){
                var data = {
                    latmin: 15.005,
                    latmax: 59.995,
                    lonmin: 70.005,
                    lonmax: 139.995,
                    interval: 0.1,
                    nlat: 450,
                    nlon: 700,
                }
                var path = IP8081_1+'pic/getPreData?time=' + iTime.substring(0,10);
            }else{
                data = {
                    latmin: 17,
                    latmax: 55,
                    nlat: 761,
                    lonmin: 72,
                    lonmax: 136.0,
                    nlon: 1281,
                    interval: 0.05,
                }
                var path = 'http://211.154.196.238:8087/ShortMid/getGridData?stime=' + sTime.substring(0,10) + '&time=' + iTime.substring(0,10) + '&element=precipitation&product=ec&lev=1000'
            }
            xhr_pro(path,data,iEle);
        }
    },
    del : function(){
        iconGroup.clearLayers();
        windGroup.clearLayers();
    },
    update : function(){
        meteorologicalFun.del();
        meteorologicalFun.add();
    }
}
$('#to_play_meteo').click(function(){
    if($(this).attr('src') == 'img/start.png'){
        $(this).attr('src','img/stop.png');
        set_p();
        if(lineAnimation){
            if(lineAnimation.isPlayedAirAnimation){
                lineAnimation.motionResume();
            }
        }

    }else{
        $(this).attr('src','img/start.png');
        stop_p();

        if(lineAnimation){

            lineAnimation.motionPause();
        }

    }
})
function set_click(){
    $('.i_line').off('click').click(function(e){
        meteoTimelineDragOrClick(e,"click");
    })
}

function meteoTimelineDragOrClick(e,mousetype){
    if($("#airTimeSpanControlDIV").length >= 1){
        if(e.offsetX>=$("#airTimeSpanControlDIV").position().left && e.offsetX<=$("#airTimeSpanControlDIV").position().left+$("#airTimeSpanControlDIV").width()){
            isPlayedAirAnimation_top = true;
        }
    }

    var iWi = e.pageX - $('.i_line').offset().left;
    var iW = parseFloat($('.i_line').css('width'));
    var iL = drag_arr.length;

    if("click" == mousetype){
        $('.i_drag').css("left", (iWi-43) + "px");
        $('.i_played').css("width", iWi + "px");
    }

    let mouseMarginLeft =  $(".i_drag").position().left+43;
    let mouseMarginLeftPer = mouseMarginLeft/$(".i_avbl").width();
    let mouseMarginLeftTimestampDiff  = mouseMarginLeftPer*timeSpanAll_top;
    let mouseMarginLeftTimestamp = airTimeFormat(timeLineTimeList_top[0],null,"ED8").getTime()+mouseMarginLeftTimestampDiff;
    let timeStr = dateFormat("mm-dd HH:MM:SS",new Date(mouseMarginLeftTimestamp));

    $(".i_drag").html(timeStr);

    var i = Math.floor(iWi/(iW/iL))
    var noe = drag_arr[i];
    var not = trans_arr[i];
    var nos = state_arr[i];
    $('.i_drag').attr('t',dateFormat("YYYYmmddHHMMSS",new Date(mouseMarginLeftTimestamp)));
    $('.i_drag').attr('i',i);
    $('.i_drag').attr('state',nos);

    //判断飞机位置
    if(linePointsDistanceArr_top.length>0){
        if(lineAnimation){
            lineAnimation.motionPause();//暂停
        }

        //飞机图标定位
        let currTime = mouseMarginLeftTimestamp;

        //确定当前时间所在的时间区间，计算当前时间占整个时间区间的比例，并根据比例计算经纬度
        if(currTime<=linePointsDistanceArr_top[0].timestamp){
            //设置飞机图标位置及角度，点击时间轴对应时间在飞机起飞时间之前,则取飞机起飞时间
            initAirIconMarker_top.setLatLng(lineArr_top[0]);
            initAirIconMarker_top.setRotationAngle(getAngle({lat:lineArr_top[0][0],lng:lineArr_top[0][1]},{lat:lineArr_top[1][0],lng:lineArr_top[1][1]}));

            lineAnimation.isPlayedAirAnimation = false;//设置动画是否播放标识属性为true
            lineAnimation.__ellapsedTime = 1 ;

        }else if(currTime>=linePointsDistanceArr_top[linePointsDistanceArr_top.length-1].timestamp){

            //设置飞机图标位置及角度，点击时间轴对应时间在飞机落地时间之后,则取飞机落地时间
            initAirIconMarker_top.setLatLng(lineArr_top[linePointsDistanceArr_top.length-1]);
            initAirIconMarker_top.setRotationAngle(getAngle({lat:lineArr_top[linePointsDistanceArr_top.length-2][0],lng:lineArr_top[linePointsDistanceArr_top.length-2][1]},{lat:lineArr_top[linePointsDistanceArr_top.length-1][0],lng:lineArr_top[linePointsDistanceArr_top.length-1][1]}));

            lineAnimation.isPlayedAirAnimation = false;
        }else{
            for(let s = 0;s < linePointsDistanceArr_top.length ; s++){
                if(linePointsDistanceArr_top[s].timestamp >=currTime){
                    let timeRadio = (currTime- linePointsDistanceArr_top[s-1].timestamp)/(linePointsDistanceArr_top[s].timestamp-linePointsDistanceArr_top[s-1].timestamp);
                    //通过比例计算时间内经纬度的增量，从而确定飞机当前位置坐标
                    let currLat = lineArr_top[s-1][0]+(lineArr_top[s][0]-lineArr_top[s-1][0])*timeRadio;
                    let currLng = lineArr_top[s-1][1]+(lineArr_top[s][1]-lineArr_top[s-1][1])*timeRadio;

                    //设置飞机图标位置及角度
                    initAirIconMarker_top.setLatLng([currLat,currLng]);
                    initAirIconMarker_top.setRotationAngle(getAngle({lat:currLat,lng:currLng},{lat:lineArr_top[s][0],lng:lineArr_top[s][1]}));

                    lineAnimation.isPlayedAirAnimation = true;//设置动画是否播放标识属性为true
                    lineAnimation.__ellapsedTime = (currTime - linePointsDistanceArr_top[0].timestamp)/lineAnimation.playRatio;

                    break;
                }
            }
        }
    }

    meteorologicalFun.update();
}

//是否在定时器中执行航班动画逻辑,默认执行,执行一次后改为false
let isPlayedAirAnimation_top = true;
function set_p(){
    let time = $('.i_drag').attr('t');

    //播放：每100毫秒移动一次，每次移动代表五分钟数据
    let timestampPlayed = airTimeFormat(time,null,"ED8").getTime();

    proInter = setInterval(function(){
        // if(i == meteoTimeList_top.length-1){
        //     i = 0;
        // }else{
        //     i += 1;
        // }
        var iW = parseFloat($('.i_line').css('width'));

        time = dateFormat("YYYYmmddHHMMSS",new Date(timestampPlayed));
        $('.i_drag').attr('t',time);
        //根据当前时间算出长度百分比
        let timeParamTime = airTimeFormat(time,null,"ED8");
        let lengthPer =  (timeParamTime.getTime() - airTimeFormat(timeLineTimeList_top[0],null,"ED8").getTime())/timeSpanAll_top;
        let playedLength =lengthPer*iW;

        $('.i_drag').animate({"left": playedLength-43 + "px"},8);
        $('.i_played').animate({"width": playedLength + "px"},8);

        let mouseMarginLeftTimestampDiff  = lengthPer*timeSpanAll_top;
        let mouseMarginLeftTimestamp = airTimeFormat(timeLineTimeList_top[0],null,"ED8").getTime()+mouseMarginLeftTimestampDiff;
        let timeStr = dateFormat("mm-dd HH:MM:SS",new Date(mouseMarginLeftTimestamp));
        $('.i_drag').html(timeStr);
        if(meteoTimeList_top.indexOf(parseInt(time))!=-1){

            $('.i_drag').attr('t',time);
            meteorologicalFun.update();
        }

        if(time>timeLineTimeList_top[timeLineTimeList_top.length-1]){
            timestampPlayed = airTimeFormat(timeLineTimeList_top[0],null,"ED8").getTime();
        }

        let airPlayRatio = 0;
        if(meteorologicalInfo.timeSpan == 60){
            timestampPlayed+=1000*60*3;
            timestampPlayed =timestampPlayed - timestampPlayed%(1000*60*3);

            airPlayRatio = (3*60*1000)/50;
        }else if(meteorologicalInfo.timeSpan == 180){
            timestampPlayed+=1000*60*6;
            timestampPlayed =timestampPlayed - timestampPlayed%(1000*60*6);

            airPlayRatio = (6*60*1000)/50;
        }else{
            timestampPlayed+=1000*60;
            timestampPlayed =timestampPlayed - timestampPlayed%(1000*60);

            airPlayRatio = (60*1000)/50;
        }

        //如果当前存在航班轨迹信息,则播放航班动画
        if(linePointsDistanceArr_top.length>0){
            if(isPlayedAirAnimation_top == true){
                if(timestampPlayed>=linePointsDistanceArr_top[0].timestamp){
                    isPlayedAirAnimation_top = false;

                    if(flightGroup){
                        flightGroup.removeLayer(initAirIconMarker_top);//移出初始图标
                    }

                    initAirIconMarker_top = lineAnimation.getMarker();
                    lineAnimation.motionOptions.duration = timeSpan/airPlayRatio;
                    lineAnimation.playRatio = airPlayRatio;
                    lineAnimation.motionStart();


                    //解除其他完成時間對該邏輯的影響
                    lineAnimation.off(L.Motion.Event.Ended);
                    lineAnimation.on(L.Motion.Event.Ended, function (e) {
                        lineAnimation.isPlayedAirAnimation = false;
                    })


                }
            }else if(timestampPlayed<linePointsDistanceArr_top[0].timestamp){
                lineAnimation.getMarker().setLatLng(lineArr_top[0]);
                lineAnimation.getMarker().setRotationAngle(getAngle({lat:lineArr_top[0][0],lng:lineArr_top[0][1]},{lat:lineArr_top[1][0],lng:lineArr_top[1][1]}));
                isPlayedAirAnimation_top = true;
                lineAnimation.isPlayedAirAnimation = true;
            }
        }
    },50)
}

function stop_p(){
    clearInterval(proInter);
}
//AWOS表盘
function add_clock(mainId,boxId){
    for(var i = 0; i < 12; i++) {
        var width = 2,
            height = 10,
            oBcolor = '#111';
        var num = 3 * (i+1)
        if(num == 3){
            num = 36;
        }else{
            num -= 3;
        }
        $("<div class='clockNum'>"+num+"</div>").appendTo(boxId).css({
            'position': 'absolute',
            'fontSize':'12px',
            'top': 0,
            'left': boxId.width() / 2,
            'transform': 'rotate(' + (i * 30 - 2) + 'deg)',
            "transform-origin": "0 " + boxId.width() / 2 + 'px'
        });
    }
    for(var i = 0; i < 36; i++) {
        var width = 1,
            height = 6,
            oBcolor = '#111';
        $("<div class='clockMark'></div>").appendTo(mainId).css({
            'width': width,
            'height': height,
            'position': 'absolute',
            'top': 0,
            'left': mainId.width() / 2,
            'background': oBcolor,
            'transform': 'rotate(' + i * 10 + 'deg)',
            "transform-origin": "0 " + mainId.width() / 2 + 'px'
        });
    }
}
//航班数据
//var airReset = setInterval(function(){
//	if($('.list li.active').attr('list') == 'flight'){
//		air24H();
//	}
//},600000);
function air24H(){
    flightGroup.clearLayers();
    airGroup.clearLayers();
    $('.timer_box').hide();
    if(authManage.depart == 3){
        var strAll = 'ALL';
    }else{
        var strAll = authManage.airlinePer;
    }
    $.ajax({
        type:"get",
        url:"http://10.151.21.43:8081/file/getFlightTime",
        /*data:{
            filter:strAll
        },*/
        async:true,
        success:function(data){
            //un_H24_202012281517_202012291517.json,ing_tt_202012281611.json
            //un_H24_202012151617_202012161617@202012150910,null@null
            var arr = data.split(',');
            /*var n1 = (arr[0]).split('.')[0];
			var n2 = (arr[1]).split('.')[0];
			add_ing_un(n1);
			add_ing_un(n2);*/
            var n1=arr[0];
            var n2=arr[1];
            add_ing_un(n1);
            add_ing_un(n2);
//			console.log(n1,n2);
        }
    });
}

//获取航班列表，从文件获取修改为从数据库获取 2021.01.20  by Wuguoqiang
var flightsList_top = null;//航班列表全局变量
function add_ing_un(){
    if(authManage.depart == 3){
        var strAll = 'ALL';
    }else{
        var strAll = authManage.airlinePer;
    }

    var storage=JSON.parse(window.localStorage.getItem("userInfo"));

    var queryParam = {};
    if(storage.username == "zh"){
        queryParam.zhonghang = "zhonghang";
    }
    queryParam.userId = storage.id;
    $.ajax({
        type:"get",
        url:localIP +"air/getFlightList",
        data:queryParam,
        success:function(data){
            if(data.resultCode == 1){
                var datas = data.data;
                flightsList_top = datas;
                add_ing_line(datas);
            }else {
                console.log("航班数据请求失败了");
            }
        }
    });
}

function add_ing_line(oArr){
    var ing_no_str = '';
    var ing_no_num = 0;
    var ing_ok_str = '';
    var ing_ok_num = 0;
    var selectFltid = $('.ing .warn_no .flights>li>.active').attr("fltid")
    $('.ing .warn_yes .flights').empty();
    $('.ing .warn_no .flights').empty();
    $('.ing .warn_yes .title>span:last-child').html('共0条');
    $('.ing .warn_no .title>span:last-child').html('共0条');
    $('.plan .warn_yes .flights').empty();
    $('.plan .warn_no .flights').empty();
    $('.plan .warn_yes .title>span:last-child').html('共0条');
    $('.plan .warn_no .title>span:last-child').html('共0条');
    for(var i = 0;i<oArr.length;i++){
        var a_line = oArr[i];
        var code = a_line.FLTNO;
        //根据状态判断样式
        let air = airStatuFormatter(a_line);
        let classByStatus = air.color;
        let etd = Date.parse(a_line.ETD);
        let etdStr = airTimeFormat(dateFormat("YYYYmmddHHMMSS",new Date(a_line.ETD)),"HH:MM");
        let etaStr = airTimeFormat(dateFormat("YYYYmmddHHMMSS",new Date(a_line.ETA)),"HH:MM");
        let t = etdStr+"-"+etaStr;

        ing_ok_str += '<li status="'+a_line.STATUS+'" ac="'+a_line.AC+'"  level="'+air.level+'"  etd ="'+etd+'"  class="flightListLi '+a_line.STATUS+'">' +
            '<img src="'+air.src+'">'+
            '<span status="'+a_line.STATUS+'" ac="'+a_line.AC+'" t="'+t+'" name="'+code+'"fltid="'+a_line.FLTID+'" class="'+classByStatus+'" title="'+code+'/'+a_line.DEPSTN+'-'+a_line.ARRSTN+'">'+code+'/'+a_line.DEPSTN+'-'+a_line.ARRSTN+'</span>' +
            '</li>';
        ing_ok_num += 1;
    }

    $('.ing .warn_no .flights').html(ing_ok_str);
    //默认显示全部航班
    $(".flightListLi").hide();
    var select = $(".cute_ul li[class='active']").attr("state")
    if(select == "ALL"){
        $('.ing .warn_no .flights>li').show();
        $('.ing .warn_no .title>span:last-child').html('共' + $('.ing .warn_no .flights>li').size() + '条');
    }else{
        $("."+select).show();
        $('.ing .warn_no .title>span:last-child').html('共' + $("."+select).size() + '条');
    }
    if(selectFltid){
        $('.ing .warn_no .flights>li>span[fltid="'+selectFltid+'"]').addClass("active").css("color","#96afee");
    }

    var cs1 = $('.ing .flights>li>span:first-child').attr('name');

    $('.ing .flights>li>span').click(function(){
        flightsLiClickFunc(this);
    })
}

/**
 * 航班列表点击事件
 */
function flightsLiClickFunc($this){
    $("#y_timer_in").css("width","0")
    if($($this).attr("flight")!=1){
        $('.air_port>img').click();
    }
    $($this).attr("flight",0);
    $(".runwayInfo").hide();
    $('#awos_detail').hide();
    $('#d_chart').hide();
    judge1hour = '';
    //closeAirRouteSectionDiv();
    if($($this).hasClass('active')){
        $($this).removeClass('active');
        $($this).css("color","white");
        flightGroup.clearLayers();
        airGroup.clearLayers();
        $(".timer_box").hide();
        $(".flightWarn").hide();
        //清空全局变量
        lineArr_top = [];//航线点
        initAirIconMarker_top = null;//初始飞机图标对象
        linePointsDistanceArr_top = [];//航线航路点记录及到达时间集合
        airAltitude_top = null; //航班高度
        closeAirRouteSectionDiv();
    }else{
        $('.flights>li>span').removeClass('active');
        $('.flights>li>span').css("color","white")
        $($this).css("color","#96AFEE");
        $($this).addClass('active');
        showFlightWarn($this);
        showFlightInfo($this);
    }
}

/**
 * 显示航班告警面板
 */
function showFlightWarn(e){
    const fltid = $(e).attr("fltid");
    let t = $(e).attr("t");
    let text = $(e).text();
    let depstn = text.split("/")[1].split("-")[0];
    let arrstn = text.split("/")[1].split("-")[1];
    $("#flightWarn_content").html("<div style='text-align: center;margin-top: 200px;'>无预警</div>");
    $("#atdMeteo").html("<span style='color: #99f599'>天气正常</span>");
    $("#ataMeteo").html("<span style='color: #99f599'>天气正常</span>");
    var storage=JSON.parse(window.localStorage.getItem("userInfo"));
    $.ajax({
        url:localIP +"air/getFlightWarn",
        async:true,
        data:{
            "fltid":fltid,
            "userId":storage.id
        },
        type:"get",
        success:function(data){
            if(data.data && !$.isEmptyObject(data.data)){
                var warnInfo = data.data;
                var keys = Object.keys(warnInfo);
                var html = "";
                for (var i =0;i<keys.length;i++){
                    var str = "";
                    var key =keys[i];
                    if((warnInfo[key].takeoff !='' && warnInfo[key].takeoff.level>1) || (warnInfo[key].landing !='' && warnInfo[key].landing.level>1) || i==0){
                        let maxlevel  = warnInfo[key].maxLevel;
                        let color = "white";
                        let colorStr = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;无";
                        if(maxlevel==3){
                            color = "red";
                            colorStr = "红色";
                        }else if(maxlevel==2){
                            color = "yellow";
                            colorStr = "黄色";
                        }
                        str+='<div style="text-align: center;margin: 20px 0px 10px 0px;">---------'+key+'---------</div><div>'+
                            '<p style="text-align: center;"><span onclick="showFlightInfo(this)" style="text-decoration: underline;cursor:pointer;color: '+color+';">'+text+'</span><span> ('+t+')</span> '+colorStr+'告警</p>';
                        if(warnInfo[key].takeoff !='' && warnInfo[key].takeoff.level>1){
                            let level  = warnInfo[key].takeoff.level;
                            let color = "yellow";
                            let value = warnInfo[key].takeoff.value
                            value = value.replace(/<div.*div><p/g,"<p");
                            value = value.replace(/<div.*div>/g,"");
                            if(level==3){
                                color = "red";
                            }
                            str+=' <div style="margin-left: 11px;">\n' +
                                    '<span onclick="showAirport(this)" class="warn_title" style="color: '+color+'">'+depstn+'(起飞)</span>\n' +value +
                                '</div>'
                        }else{
                            str+='<div style="margin-left: 11px;">\n' +
                                '<span onclick="showAirport(this)" class="warn_title" style="color: white">'+depstn+'(起飞)</span>\n天气正常</div>';
                        }

                        if(warnInfo[key].landing !='' && warnInfo[key].landing.level>1){
                            let level  = warnInfo[key].landing.level;
                            let color = "yellow";
                            let value = warnInfo[key].landing.value
                            value = value.replace(/<div.*div><p/g,"<p");
                            value = value.replace(/<div.*div>/g,"");
                            if(level==3){
                                color = "red";
                            }
                            str+='<div style="margin-left: 11px;">\n' +
                                    '<span onclick="showAirport(this)" class="warn_title" style="color: '+color+'">'+arrstn+'(落地)</span>\n' + value +
                                '</div>';
                        }else{
                            str+='<div style="margin-left: 11px;">\n' +
                                '<span onclick="showAirport(this)" class="warn_title" style="color: white">'+arrstn+'(落地)</span>\n天气正常</div>';
                        }
                    }
                    html+= str+"</div>";
                }
                if(keys.length>0){
                    //起飞机场
                    var takeoff = warnInfo[keys[0]].takeoff;
                    var takeoffStr = "" ;
                    if(takeoff!=null){
                        if(takeoff.level>1){
                            var value = takeoff.value
                            if(takeoff.level==2){
                                takeoffStr = "<span style='color: #f3ef7f'>"+value+"</span>"
                            }else{
                                takeoffStr = "<span style='color: #f5738b'>"+value+"</span>"
                            }
                        }else{
                            takeoffStr = "<span style='color: #99f599'>天气正常</span>"
                        }
                    }

                    //落地机场
                    var landing = warnInfo[keys[0]].landing;
                    var landingfStr = "" ;
                    if(landing!=null){
                        if(landing.level>1){
                            var value = landing.value
                            if(landing.level==2){
                                landingfStr = "<span style='color: #f3ef7f'>"+value+"</span>"
                            }else{
                                landingfStr = "<span style='color: #f5738b'>"+value+"</span>"
                            }
                        }else{
                            landingfStr = "<span style='color: #99f599'>天气正常</span>"
                        }
                    }
                    $("#atdMeteo").html(takeoffStr);
                    $("#ataMeteo").html(landingfStr);
                }
                let s = html;
                if(s.replace(/<\/div>/g,"") == ""){
                    html = '<div style="text-align: center;margin-top: 20px;"><span onclick="showFlightInfo(this)" style="text-decoration: underline;cursor:pointer;color: #ffffff;">'+text+'</span><span> ('+t+')</span> 无告警</div>';
                }
                $("#flightWarn_content").html(html);
            }else{
                let html = '<div style="text-align: center;margin-top: 20px;"><span onclick="showFlightInfo(this)" style="text-decoration: underline;cursor:pointer;color: #ffffff;">'+text+'</span><span> ('+t+')</span> 无告警</div>';
                $("#flightWarn_content").html(html);
            }
            $(".flightWarn").show();
        }
    })
}

/**
 * 显示航班具体信息
 * @param e
 */
function showFlightInfo(e){
//从航班列表中获取当前点击查看的航班数据
    $(".flightWarn").hide();
    var cs = $(e).text();
    var oArr = flightsList_top;
    for(let k=0;k<oArr.length;k++){
        if(oArr[k].FLTNO+"/"+oArr[k].DEPSTN+"-"+oArr[k].ARRSTN == cs){
            addFlyline(oArr[k]);
            break;
        }
    }
}

function showAirport(e,code){
    //closeAirRouteSectionDiv();
    //flightGroup.clearLayers();
    //airGroup.clearLayers();
    $(".flightWarn").hide();
    var three = code == undefined ?$(e).text().split("(")[0] : $(e).text()
    $(".airport span[three='"+three+"']").attr("isFlight","true").click();
    $(".v_atmos").hide()
}

function showBottom(lat,lon,airport4Code){
    $('#ysTable>table>tbody').html("");
    $.ajax({
        type:"get",
        url:meteorologicalHost+"meteorological/getNcsData",
        data:{
            lat:lat,
            lon:lon,
            airport4Code:airport4Code
        },
        async:true,
        success:function(data){
            if(data.code == 0 && data.data.length > 0){
                mkerGroup.clearLayers();
                var strTime = '';
                var strThun = '';
                var strVis = '';
                var strTem = '';
                var strSpd = '';
                var strDir = '';
                var strPre = '';
                var strSand = '';
                var strWs = '';
                var colThun = [];
                var colVis = [];
                var colTem = [];
                var colSpd = [];
                var colDir = [];
                var colPre = [];
                var colSand = [];
                var colWs = [];
                var jsLen = 0;//计算总长度
                var info = data.data;
                thDate = {};
                for(var i = 0;i<data.data.length;i++){
                    //判断标题栏日期th长度
                    var rq = info[i].time.substring(0,8);
                    if(!thDate[rq]){
                        thDate[rq] = [];
                    }
                    thDate[rq].push(airTimeFormat(info[i].time));
                    //根据温度判断  如果温度为空 则之后的都不展示
                    strTime += '<td><div class="ysTd">' + airTimeFormat(data.data[i].time,"HH","ED8") + '</div></td>';
                    strThun += '<td><div class="ysTd">' + judgeNull(data.data[i].thunder) + '</div></td>';
                    strVis += '<td><div class="ysTd">' + judgeNull(data.data[i].vis,"vis") + '</div></td>';
                    strTem += '<td><div class="ysTd">' + judgeNull(data.data[i].t2) + '</div></td>';
                    strSpd += '<td><div class="ysTd">' + judgeNull(data.data[i].speed) + '</div></td>';
                    strDir += '<td><div class="ysTd">' + judgeWindd(data.data[i].dir) + '</div></td>';
                    strPre += '<td><div class="ysTd">' + judgeNull(data.data[i].pre) + '</div></td>';
                    strSand += '<td><div class="ysTd">' + judgeNull(data.data[i].ducmass) + '</div></td>';
                    strWs += '<td><div class="ysTd">' + judgeNull(data.data[i].ws) + '</div></td>';
                    colThun.push(colorNull(data.data[i].thunderColor));
                    colVis.push(colorNull(data.data[i].visColor));
                    colTem.push(colorNull(data.data[i].t2Color));
                    colSpd.push(colorNull(data.data[i].speedColor));
                    colPre.push(colorNull(data.data[i].preColor));
                    colSand.push(colorNull(data.data[i].ducmassColor));
                    colWs.push(colorNull(data.data[i].wsColor));
                    jsLen += 1;
                }
                var coThun = colThun.join(',');
                var coVis = colVis.join(',');
                var coTem = colTem.join(',');
                var coSpd = colSpd.join(',');
//						var coDir = colDir.join(',');
                var coPre = colPre.join(',');
                var coSand = colSand.join(',');
                var co3km = colWs.join(',');
                /*if(authManage.airportPer_TH!=null){//通航账户特殊处理
                    var strTbody = '<tr>' + strTime + '</tr>' +'<tr style="background:linear-gradient(to right,'+coThun+');">' + strThun + '</tr>' + '<tr style="background:linear-gradient(to right,'+coVis+');">' + strVis + '</tr>' +'<tr style="background:linear-gradient(to right,'+coTem+');">' + strTem + '<tr>' + strDir + '</tr>' + '</tr>' +'<tr style="background:linear-gradient(to right,'+coSpd+');">' + strSpd + '</tr>' +'<tr style="background:linear-gradient(to right,'+coPre+');">' + strPre + '</tr>' +'<tr style="background:linear-gradient(to right,'+coSand+');">' + strSand + '</tr>' +'<tr style="background:linear-gradient(to right,'+co3km+');">' + str3km + '</tr>' +'<tr style="background:linear-gradient(to right,'+col6km+');">' + str6km + '</tr>';
                }else{*/
                var strTbody = '<tr>' + strTime + '</tr>' +'<tr style="background:linear-gradient(to right,'+coThun+');">' + strThun + '</tr>' + '<tr style="background:linear-gradient(to right,'+coVis+');">' + strVis + '</tr>' +'<tr style="background:linear-gradient(to right,'+coTem+');">' + strTem + '<tr>' + strDir + '</tr>' + '</tr>' +'<tr style="background:linear-gradient(to right,'+coSpd+');">' + strSpd + '</tr>' +'<tr style="background:linear-gradient(to right,'+coPre+');">' + strPre + '</tr>' +'<tr style="background:linear-gradient(to right,'+coSand+');">' + strSand + '</tr>' +'<tr style="background:linear-gradient(to right,'+co3km+');">' + strWs + '</tr>' ;
                /*}*/
                $('#ysTable>table>tbody').html(strTbody);

                var th = "<tr>";
                var rqs = Object.keys(thDate);
                for(var i=0;i<rqs.length;i++){
                    var colspan = 0;
                    if(thDate[rqs[i]].length==1){
                        colspan = 2;
                        if(i==0){
                            $("#ysTable tbody>tr").prepend("<td><div class='ysTd'></div></td>")
                            $("#ysTable tbody>tr").each(function (){
                                var background = $(this).css("background");
                                if(background.indexOf("right,")!=-1){
                                   var stl =  background.split("right,")
                                    $(this).css("background",stl[0] +"right,#1F437B00,"+stl[1]);
                                }
                            })
                        }else{
                            $("#ysTable tbody>tr").append("<td><div class='ysTd'></div></td>")
                            $("#ysTable tbody>tr").each(function (){
                                var background = $(this).css("background");
                                if(background.indexOf("))")!=-1){
                                    var stl =  background.split("))")
                                    $(this).css("background",stl[0] +"),#1F437B00)"+stl[1]);
                                }
                            })
                        }
                    }else{
                        colspan = thDate[rqs[i]].length
                    }
                    th += "<th colspan="+colspan+">"+ transAirTime(rqs[i]) +"</th>"
                }
                th += "</tr>"
                //根据返回的时间判断thead内容   根据返回的时间以及数据的长度判断
                /*var airTime1 = data.data[0].time;
                //第一天
                var num = 24 - Number(airTime1.substring(8))-8;
                if(num >= jsLen){
                    var strThead = '<tr><th colspan="' + jsLen + '">' + transAirTime(airTime1) + '</th>';
                }else{
                    var strThead = '<tr><th colspan="' + num + '">' + transAirTime(airTime1) + '</th>';
//							$('.v_atmos>div>table>tbody>tr>td').eq(num).css();
                    var nu = Math.ceil((jsLen - num)/24);'border-right:1px solid #ccc'
                    for(var i = 1;i<nu+1;i++){
                        if((i*24+num) <= jsLen){
                            var airTime = data.data[(i-1)*24+num].time;
//									$('.v_atmos>div>table>tbody>tr>td').eq(i*24+num).css('border-right:1px solid #ccc');
                            strThead += '<th colspan="24">' + transAirTime(airTime) + '</th>';
//									$('.v_atmos>div>table>tbody>tr>td').eq((i-1)*24+num).css('border-right:1px solid #ccc');
                        }else{
                            var airTime = data.data[(i-1)*24+num].time;
                            var colspan = (jsLen - num)%24;
                            strThead += '<th colspan="'+colspan+'">' + transAirTime(airTime) + '</th>';
//									$('.v_atmos>div>table>tbody>tr>td').eq((i-1)*24+num).css('border-right:1px solid #ccc');
                        }
                    }
                }*/
                //strThead += '</tr>';
                $('#ysTable>table>thead').html(th);
                $('.v_atmos').show();

                if($("#meteoSection").css("display") == "block"){
                    closeAirRouteSectionDiv();
                }
                //$("#meteoSection").hide();
                //$(".t_box").hide();
            }
        }
    });
}

function transTime(TIME){
    var time;
    var t1 = TIME.substring(10);
    var name = moment(TIME, "YYYYMMDDHHmm").format("YYYYMMDDHHmm");
    if(t1%6 == 0){
        var r_t = name;
    }else if(t1%6 < 3){
        var r_t = moment(name, "YYYYMMDDHHmm").subtract(t1%6, "minutes").format("YYYYMMDDHHmm");
    }else{
        var r_t = moment(name, "YYYYMMDDHHmm").add((6-t1%6), "minutes").format("YYYYMMDDHHmm");
    }
    return r_t;
}

function new_click(){
    airGroup.clearLayers();
    var now_index = $('.y_time>li').index($('.li_sel'));
    var air_point = point_arr[now_index];
    var air_angle = angle_arr[now_index];
    var icon = L.marker(air_point, {icon: setMyIcon(),pane:'line',rotationOrigin:"center center",rotationAngle:air_angle}).addTo(airGroup);
    re_site(icon);
}
function add_time_line(CODE,oArr){
    var arr = [];
    var str = '';
    var str1,str2,str_;
    var cArr = [];
    for(var i = 0;i<oArr.length;i++){
        var a_line = oArr[i];
        for(var key in a_line){
            var code = key;
            if(code == CODE){
                var line = a_line[key][0].newfly_road;
                var col = a_line[key][0].Original_waypoint_influence;
                var otime=a_line[key][0].newfly_road[0].fly_time;
                var otimeArr=new Array();
                for(var key in line){
                    var t = line[key].fly_time;
                    var line_time = t;
                    otimeArr.push(t);
//					var line_time = transTime(t);
                    var new_time = transTime1(t);
                    /*if(key=="0"){
						str += '<li name="'+line_time+'">'+ new_time +'</li>';
					}*/
                    str += '<li name="'+line_time+'">'+ new_time +'</li>';
                }
                if(otimeArr.length>0){
                    var stime=moment(otimeArr[0], "YYYYMMDDHHmm").subtract(5, "minutes").format("YYYYMMDDHHmm");
                    var otime1=moment(stime, "YYYYMMDDHHmm").add(8,'hours').format("HH:mm");
                    str1='<li name="'+stime+'">'+ otime1 +'</li>';
                    var olen=otimeArr.length;
                    var etime=moment(otimeArr[olen-1], "YYYYMMDDHHmm").add(5, "minutes").format("YYYYMMDDHHmm");
                    var etime1=moment(etime, "YYYYMMDDHHmm").add(8,'hours').format("HH:mm");
                    str2='<li name="'+etime+'">'+ etime1 +'</li>';
                }
                str_=str1+str+str2;
                for(var key in col){
                    var c = col[key];
//					console.log(c);
                    cArr.push(c);
                }
            }
        }
    }

    $('.y_time').html(str_);
    $('.timer_box').show();
    $('.y_time>li').eq(0).addClass('li_sel');

    $('.s_drag').animate({left:0},400);
    var color = cArr.join(',');
    $('.y_timer').css({'background':'linear-gradient(to right,'+color+')'});
    $('.y_time>li').click(function(){
        $('.y_time>li').removeClass('li_sel');
        var index = $(this).index();
        var len = $('.y_time>li').length - 1;
        var left = (index/len).toFixed(2) * 100 + '%';
        $('.s_drag').animate({left:left},400);
        $(this).addClass('li_sel');
        interFunLine.update();
        new_click();
    })
    interFunLine.update();
    //强对流监测----暂时隐藏
//	down_all();
}

var airHeight = '';//当前航班的高度
function add_jia_line(CODE,oArr){
    point_arr = [];
    flightGroup.clearLayers();
    var ii_arr = [];
    var ii_arr_raofei=[];
    var latlon_time = [];
    var latlon_time_raofei = [];
    var color_arr = [];
    var color_arr_raofei=[];
    var raofei;
    for(var i = 0;i<oArr.length;i++){
        (function(i){
            var a_line = oArr[i];
            for(var key in a_line){
                var code = key;
                if(code == CODE){
                    var line = a_line[key][0].newfly_road;
                    var cols = a_line[key][0].Original_waypoint_influence;
                    raofei = a_line[key][0].fly_around_road;
                    if(raofei){//有绕飞航线
                        for(var key1 in raofei){
                            latlon_time_raofei.push(raofei[key1]);
                            color_arr_raofei.push("green");
                        };
                    }
                    airHeight = a_line[key][0].HEIGHT;
                    setDrag();
                    var sAir = a_line[key][0].DEPSTN;
                    var eAir = a_line[key][0].ARRSTN;

                    var ftime = get_6min();
                    //获取关联机场
                    console.log(a_line);
                    console.log(a_line[key][0].DEP_ALTN);
                    console.log(a_line[key][0].ROUTE_ALTN);
                    console.log(a_line[key][0].ARR_ALTN);

                    if(a_line[key][0].DEP_ALTN==null){
                        var relArr1 = [];
                    }else if((a_line[key][0].DEP_ALTN).length > 0){
                        var relArr1 = (a_line[key][0].DEP_ALTN).split(' ');
                    }else{
                        var relArr1 = [];
                    }
                    if(a_line[key][0].ROUTE_ALTN==null){
                        var relArr2 = [];
                    }else if((a_line[key][0].ROUTE_ALTN).length > 0){
                        var relArr2 = (a_line[key][0].ROUTE_ALTN).split(' ');
                    }else{
                        var relArr2 = [];
                    }
                    if(a_line[key][0].ARR_ALTN==null){
                        var relArr3 = [];
                    }else if((a_line[key][0].ARR_ALTN).length > 0){
                        var relArr3 = (a_line[key][0].ARR_ALTN).split(' ');
                    }else{
                        var relArr3 = [];
                    }

//					var relArr1 = (a_line[key][0].DEP_ALTN).split(' ');
//					var relArr2 = (a_line[key][0].ROUTE_ALTN).split(' ');
//					var relArr3 = (a_line[key][0].ARR_ALTN).split(' ');
                    //console.log(relArr1,relArr2,relArr3);
                    var arr111 = relArr1.concat(relArr2,relArr3);
                    /*console.log(arr111);
					console.log(relArr1);*/
                    $.ajax({
                        type:"get",
                        url:IP8081_1+"file/getJsonData",
                        async:true,
                        data:{
                            time:ftime,
                            filter:'ALL'
                        },
                        success:function(data){
                            var json = JSON.parse(data);
                            var arr = [];
                            for(var key in json){
                                arr.push(json[key]);
                            }
                            for(var i = 0;i<arr.length;i++){
                                (function(i){
                                    for(var j = 0;j<arr111.length;j++){
                                        if(arr111[j] == arr[i].ID_three){
                                            var ID_four = arr[i].ID_four;
                                            var ID_three = arr[i].ID_three;
                                            var LAT = arr[i].LAT;
                                            var LON = arr[i].LON;
                                            var Name_zh = arr[i].Name_zh;
                                            var mk = get_r();
                                            var y_marker = L.circleMarker([LAT,LON], {
                                                stroke: true,
                                                color: arr[i].prewarn_level,
                                                weight: 10,
                                                opacity: 0,
                                                fillColor: arr[i].prewarn_level,
//											fillColor: 'red',
                                                fillOpacity: 1,
                                                radius: mk,
                                                pane:'flight'
                                            }).addTo(flightGroup);
                                            re_radius(y_marker);
                                            y_marker.on("mouseover", function() {
                                                n_marker = L.marker([LAT,LON], {
                                                    icon: nameIcon(Name_zh+" / "+ID_four),
                                                    pane: "flight"
                                                }).addTo(flightGroup);
                                            })
                                            y_marker.on("mouseout", function() {
                                                flightGroup.removeLayer(n_marker);
                                            })
                                            if(authManage.airlinePer_TH!=null){
                                                /*=============加载时序图弹窗=============*/
                                                y_marker.on('click',function(e){
                                                    L.DomEvent.stopPropagation(e);
                                                    loadDiagramPop(LAT,LON);
                                                })
                                            }else{
                                                y_marker.on('click',function(e){
                                                    L.DomEvent.stopPropagation(e);
                                                    add_mess(ID_four);
                                                    add_awos(ID_four);
                                                    addAirportWarn(ID_four,Name_zh.substring(0,2));
                                                    //add_syn(ID_four);
                                                    var i_air = ID_three;
                                                    var i_mes = Name_zh + '/' + ID_four + '/' + ID_three;
                                                    $('.air_port>h1').html(i_mes);
                                                    //如果选择为航班：航班开始时间前30min、结束时间：航班结束时间后30min
                                                    var i_t1 = $('.y_time>li').eq(0).attr('name');
                                                    var i_t2 = $('.y_time>li').eq($('.y_time>li').length - 1).attr('name');
                                                    var i_time = get_pre30(i_t1);
                                                    var i_ftime = get_last30(i_t2);
                                                    //如果选择为机场：开始时间：当前时间、结束时间：当前时间之后4h
                                                    //						        			var i_time = get_thishour();
                                                    //						        			var i_ftime = get_4hour();
                                                    f_llcolor(i_air,i_time,i_ftime);
                                                })
                                            }

                                        }
                                    }
                                })(i)
                            }
                        }
                    });
                    for(var key in line){
                        //获取到的时间和位置为最后一个点的，先获取arr
                        latlon_time.push(line[key]);
                    }
                    for(var key in cols){
                        //获取到的时间和位置为最后一个点的，先获取arr
                        if(key!="fly_around_road"){
                            color_arr.push(cols[key]);
                        }
                    };
                    for(var i = 0;i<latlon_time.length;i++){
                        (function(i){
                            var arr = [latlon_time[i].lat,latlon_time[i].lon];
                            var time = latlon_time[i].fly_time;
                            var mk = get_r();
                            var col = color_arr[i];
                            var k_marker = L.circleMarker(arr, {
                                stroke: true,
                                color: col,
                                weight: 10,
                                opacity: 0,
                                fillColor: col,
                                fillOpacity: 1,
                                radius: mk,
                                pane:'dash'
                            }).addTo(flightGroup);
                            //小飞机展示到第一个点上
                            //航班号  起飞机场-结束机场-起飞时间-降落时间-当前时间-经纬度
                            var add_html = '<div class="hover_div">航班：'+CODE+'</br>'+transTime0(time)+'</br>起飞机场：'+sAir+'</br>结束机场：'+eAir+'</br>经纬度：'+latlon_time[i].lat+','+latlon_time[i].lon+'<span></span>';
                            k_marker.on("mouseover", function() {
                                n_marker = L.marker(arr, {
                                    icon: iIcon(add_html),
                                    pane: "hover"
                                }).addTo(flightGroup);
                            })
                            k_marker.on("mouseout", function() {
                                flightGroup.removeLayer(n_marker);
                            })
                            re_radius(k_marker);
                            ii_arr.push(arr);
                            point_arr.push(arr);
                            if(i == Math.ceil((latlon_time.length)/2)){
                                var arrView = [Number(latlon_time[i].lat),Number(latlon_time[i].lon)];
                                showPort1(arrView);
                            }
                        })(i)
                    }
                    //绕飞航线--------新增----
                    for(var i = 0;i<latlon_time_raofei.length;i++){
                        (function(i){
                            var arr = [latlon_time_raofei[i].lat,latlon_time_raofei[i].lon];
                            var time = latlon_time_raofei[i].fly_time;
                            var mk = get_r();
                            var col = color_arr_raofei[i];
                            var k_marker_raofei = L.circleMarker(arr, {
                                stroke: true,
                                color: col,
                                weight: 10,
                                opacity: 0,
                                fillColor: col,
                                fillOpacity: 1,
                                radius: mk,
                                pane:'dash'
                            }).addTo(flightGroup);
                            //小飞机展示到第一个点上
                            //航班号  起飞机场-结束机场-起飞时间-降落时间-当前时间-经纬度
                            var add_html = '<div class="hover_div">航班：'+CODE+'</br>'+transTime0(time)+'</br>起飞机场：'+sAir+'</br>结束机场：'+eAir+'</br>经纬度：'+latlon_time_raofei[i].lat+','+latlon_time_raofei[i].lon+'<span></span>';
                            k_marker_raofei.on("mouseover", function() {
                                n_marker_raofei = L.marker(arr, {
                                    icon: iIcon(add_html),
                                    pane: "hover"
                                }).addTo(flightGroup);
                            })
                            k_marker_raofei.on("mouseout", function() {
                                flightGroup.removeLayer(n_marker_raofei);
                            })
                            re_radius(k_marker_raofei);
                            ii_arr_raofei.push(arr);
                            point_arr_raofei.push(arr);
                            if(i == Math.ceil((latlon_time_raofei.length)/2)){
                                var arrView = [Number(latlon_time_raofei[i].lat),Number(latlon_time_raofei[i].lon)];
                                showPort1(arrView);
                            }
                        })(i)
                    }
                    if(raofei){//有绕飞航线
                        addLine_raofei(ii_arr_raofei);
                    }
                    //绕飞航线--------新增----
                    //航线需要连接起飞机场和结束机场  数据中只有机场的三字码，调取接口获取机场经纬度
                    /*if(authManage.airportPer=="TH"){
						var para={'name':sAir,'filter':'TH'};
						var para1={'name':eAir,'filter':'TH'};
					}else{
						var para={'name':sAir,'filter':'ALL'};
						var para1={'name':eAir,'filter':'ALL'};
					}*/
                    $.ajax({
                        type:"get",
                        url:IP8081_1+"air/getAirDataByThreeName",
                        async:true,
                        //data:para,
                        data:{
                            name:sAir,
                        },
                        success:function(data){
                            var data = data.data[0];
                            var arr = [data.LAT,data.LON];
                            var ID_four = data.ID_four;
                            var Name_zh = data.Name_zh;
                            var mk = get_r();
                            var a_marker = L.circleMarker(arr, {
                                stroke: true,
                                color: 'green',
                                weight: 1,
                                opacity: 1,
                                fillColor: 'green',
                                fillOpacity: 1,
                                radius: mk,
                                pane:'dash'
                            }).addTo(flightGroup);
                            re_radius(a_marker);
                            if(authManage.airlinePer_TH!=null){
                                var otip=Name_zh;
                            }else{
                                var otip=Name_zh+" / "+ID_four;
                            }
                            a_marker.on("mouseover", function() {
                                n_marker = L.marker(arr, {
                                    icon: nameIcon(otip),
                                    pane: "flight"
                                }).addTo(flightGroup);
                            })
                            a_marker.on("mouseout", function() {
                                flightGroup.removeLayer(n_marker);
                            })
                            if(authManage.airlinePer_TH!=null){
                                /*=============加载时序图弹窗=============*/
                                a_marker.on('click',function(e){
                                    L.DomEvent.stopPropagation(e);
                                    loadDiagramPop(data.LAT,data.LON);
                                })
                            }else{
                                //关联机场---开始时间：航班开始时间前30min、结束时间：航班结束时间后30min
                                a_marker.on('click',function(e){
                                    L.DomEvent.stopPropagation(e);
                                    add_mess(ID_four);
                                    add_awos(ID_four);
                                    addAirportWarn(ID_four,Name_zh.substring(0,2));
                                    //add_syn(ID_four);
                                    var i_mes = Name_zh + '/' + ID_four + '/' + sAir;
                                    $('.air_port>h1').html(i_mes);
                                    var i_t1 = $('.y_time>li').eq(0).attr('name');
                                    var i_t2 = $('.y_time>li').eq($('.y_time>li').length - 1).attr('name');
                                    var i_time = get_pre30(i_t1);
                                    var i_ftime = get_last30(i_t2);
                                    //			        			var i_time = get_thishour();
                                    //			        			var i_ftime = get_4hour();
                                    f_llcolor(sAir,i_time,i_ftime);
                                })
                            }
                            ii_arr.unshift(arr);
                            point_arr.unshift(arr);
                            /*ii_arr_raofei.unshift(arr);
							point_arr_raofei.unshift(arr);*/
                            $.ajax({
                                type:"get",
                                url:IP8081_1+"air/getAirDataByThreeName",
                                async:true,
                                //data:para1,
                                data:{
                                    name:eAir,
                                },
                                success:function(data){
                                    var data = data.data[0];
                                    var arr = [data.LAT,data.LON];
                                    var ID_four = data.ID_four;
                                    var Name_zh = data.Name_zh;
                                    var mk = get_r();
                                    var a_marker = L.circleMarker(arr, {
                                        stroke: true,
                                        color: 'green',
                                        weight: 1,
                                        opacity: 1,
                                        fillColor: 'green',
                                        fillOpacity: 1,
                                        radius: mk,
                                        pane:'dash'
                                    }).addTo(flightGroup);
                                    re_radius(a_marker);
                                    ii_arr.push(arr);
                                    point_arr.push(arr);
                                    /*ii_arr_raofei.push(arr);
									point_arr_raofei.push(arr);*/
                                    addLine(ii_arr);
                                    /*if(raofei){//有绕飞航线
										addLine_raofei(ii_arr_raofei);
									}*/
                                    if(authManage.airlinePer_TH!=null){
                                        var otip1=Name_zh;
                                    }else{
                                        var otip1=Name_zh+" / "+ID_four;
                                    }
                                    a_marker.on("mouseover", function() {
                                        n_marker = L.marker(arr, {
                                            icon: nameIcon(otip1),
                                            pane: "flight"
                                        }).addTo(flightGroup);
                                    })
                                    a_marker.on("mouseout", function() {
                                        flightGroup.removeLayer(n_marker);
                                    })
                                    if(authManage.airlinePer_TH!=null){
                                        /*=============加载时序图弹窗=============*/
                                        a_marker.on('click',function(e){
                                            L.DomEvent.stopPropagation(e);
                                            loadDiagramPop(data.LAT,data.LON);
                                        })
                                    }else{
                                        //关联机场---开始时间：航班开始时间前30min、结束时间：航班结束时间后30min
                                        a_marker.on('click',function(e){
                                            L.DomEvent.stopPropagation(e);
                                            add_mess(ID_four);
                                            add_awos(ID_four);
                                            addAirportWarn(ID_four,Name_zh.substring(0,2));
                                            //add_syn(ID_four);
                                            var i_mes = Name_zh + '/' + ID_four + '/' + eAir;
                                            $('.air_port>h1').html(i_mes);
                                            var i_t1 = $('.y_time>li').eq(0).attr('name');
                                            var i_t2 = $('.y_time>li').eq($('.y_time>li').length - 1).attr('name');
                                            var i_time = get_pre30(i_t1);
                                            var i_ftime = get_last30(i_t2);
                                            //					        			var i_time = get_thishour();
                                            //					        			var i_ftime = get_4hour();
                                            f_llcolor(eAir,i_time,i_ftime);
                                        })
                                    }
                                }
                            });
                        }
                    });
                }
            }
        })(i);
    }
}
function addLine_raofei(ARR){
    console.log(ARR);
    angle_arr = [];
    for(var i = 0;i<ARR.length-1;i++){
        (function(i){
            var arr = [];
            arr[0] = ARR[i];
            arr[1] = ARR[i+1];
            var rr = get_w();
            //航线颜色根据两点的颜色判断
            var dotted = L.polyline(arr,{
                color:'#f4bf30',
                weight: rr,
                pane:'line',
                /*dashArray:[6,6]*/
            }).addTo(flightGroup);
            re_weight(dotted);
            /*var iNum = 0;
			var n_e = setInterval(function(){
				iNum -= 1;
				dotted.redraw().setStyle({dashOffset:iNum});
			},50)*/
            if(i>0 && i<ARR.length-1){
                var this_angle = get_angle(ARR[i][0],ARR[i][1],ARR[(i+1)][0],ARR[(i+1)][1]);
                angle_arr.push(this_angle);
            }
        })(i)
    }
    var angle1=get_angle(ARR[0][0],ARR[0][1],ARR[1][0],ARR[1][1]);
    var angle2=0;
    angle_arr.unshift(angle1);
    angle_arr.push(angle2);
    //初始小飞机位置
    airGroup.clearLayers();
    var now_index = $('.y_time>li').index($('.li_sel'));
    var air_point = point_arr_raofei[now_index];
    var air_angle = angle_arr[now_index];
    var icon = L.marker(air_point, {icon: setMyIcon(),pane:'line',rotationOrigin:"center center",rotationAngle:air_angle}).addTo(airGroup);
    re_site(icon);
}
function addLine(ARR){
    console.log(ARR);
    angle_arr = [];
    for(var i = 0;i<ARR.length-1;i++){
        (function(i){
            var arr = [];
            arr[0] = ARR[i];
            arr[1] = ARR[i+1];
            var rr = get_w();
            //航线颜色根据两点的颜色判断
            var dotted = L.polyline(arr,{
                color:'green',
                weight: rr,
                pane:'line',
                dashArray:[6,6]
            }).addTo(flightGroup);
            re_weight(dotted);
            var iNum = 0;
            var n_e = setInterval(function(){
                iNum -= 1;
                dotted.redraw().setStyle({dashOffset:iNum});
            },50)
            if(i>0 && i<ARR.length-1){
                var this_angle = get_angle(ARR[i][0],ARR[i][1],ARR[(i+1)][0],ARR[(i+1)][1]);
                angle_arr.push(this_angle);
            }
        })(i)
    }
    var angle1=get_angle(ARR[0][0],ARR[0][1],ARR[1][0],ARR[1][1]);
    var angle2=0;
    angle_arr.unshift(angle1);
    angle_arr.push(angle2);
    //初始小飞机位置
    airGroup.clearLayers();
    var now_index = $('.y_time>li').index($('.li_sel'));
    var air_point = point_arr[now_index];
    var air_angle = angle_arr[now_index];
    var icon = L.marker(air_point, {icon: setMyIcon(),pane:'line',rotationOrigin:"center center",rotationAngle:air_angle}).addTo(airGroup);
    re_site(icon);
}
//模糊查询
//机场-中文名、四字码、三字码
//航班-航班名、开始机场-结束机场、四字码-四字码、三字码-三字码
var cpLock = true;
$('#sel_time').on('compositionstart', function() {
    cpLock = false;
});
$('#sel_time').on('compositionend', function() {
    cpLock = true;
});
$("#sel_time").on("input", function(e) {
    e.preventDefault();
    var _this = this;
    setTimeout(function() {
        if(cpLock) {
            var str = ($('#sel_time').val()).toUpperCase();
            selVal(str);
        }
    }, 0)
})
function selVal(NAME){
    //查询六个表格的内容
    var li = '';
    $('.flights li span').each(function(){
        //str-内容    机场三字码
        if($(this).attr('three')){
            var thr = $(this).attr('three');
        }else{
            var thr = '';
        }
        var str = $(this).html();
        if(NAME == '' || thr.indexOf(NAME) == -1) {

        }else{
            var fDiv = $(this).parent().parent().parent().parent().attr('class');
            var sDiv = $(this).parent().parent().parent().index();
            var idx = $(this).parent().index();
            li += '<li idx="'+idx+'" s="'+sDiv+'" f="'+fDiv+'">'+str+'</li>';
        }
        if(NAME == '' || str.indexOf(NAME) == -1) {

        }else{
            var fDiv = $(this).parent().parent().parent().parent().attr('class');
            var sDiv = $(this).parent().parent().parent().index();
            var idx = $(this).parent().index();
            li += '<li idx="'+idx+'" s="'+sDiv+'" f="'+fDiv+'">'+str+'</li>';
        }
    })
    $('.o_fuzzy').html(li);

    $('.o_fuzzy li').click(function() {
        console.log("sel")
        //展示飞机位置  触发点击事件  li隐藏
        $('#sel_time').val($(this).html());
        var idx = $(this).attr('idx');
        var fDiv = $(this).attr('f');
        var sDiv = $(this).attr('s');
        if(fDiv == 'airport') {
            $('.list li[list="' + fDiv + '"]').trigger('click');
        } else {
            $('.list li[list="flight"]').trigger('click');
            $('.sel li[state="' + fDiv + '"]').trigger('click');
        }
        if(sDiv == 0) {
            var s = '>div:first-child .flights';
        } else {
            var s = '>div:last-child .flights';
        }
        var boxObj = $("." + fDiv + s);
        var nowObj = $("." + fDiv + s + ' li').eq(idx);
        var height = boxObj.scrollTop() + nowObj.offset().top - boxObj.offset().top;
        boxObj.animate({
            scrollTop: height
        });
        $('.o_fuzzy').html('');
        setTimeout(function() {
            nowObj.children('span').trigger('click');
        }, 700)
    })

}
$('#del_time').click(function(){
    $('#sel_time').val('');
    $('.o_fuzzy').html('');
})

/**
 * @describe 格式化航班状态
 * @author Wuguoqiang
 * @date 2020.01.1
 * @param data 航班数据
 * @return statu 航班状态
 */
function airStatuFormatter(data){
    let statu = "";
    let color = "green"
    let src = "../images/green.png";
    let level = 1;
    if(data.maxLevel && data.maxLevel && (data.STATUS!='ATA' && data.STATUS != 'CNL')){
        if(data.maxLevel==2){
            level = 2;
            color = "yellow"
            src = "../images/yellow.png";
        }else if(data.maxLevel==3){
            level = 3;
            color = "red"
            src = "../images/red.png";
        }
        return {color:color,level:level,src:src};
    }



    return {"statu":statu,"color":color,"src":src,"level":level};
}

/**
 * @describe 根据航班在地图上添加航线、备降机场等等
 * @auther Wuguoqiang
 * @date 2021.01.21
 * @param flight 航班对象
 */
var lineArr_top = [];//航线点
var initAirIconMarker_top = null;//初始飞机图标对象
var linePointsDistanceArr_top = [];//航线航路点记录及到达时间集合
var airAltitude_top = null; //航班高度
function addFlyline(flight){
    //查询参数
    let queryParam = {};
    var queryUrl = "";

    if(flight.TONGHANG == "TRUE"){
        queryParam.depstn = flight.DEPSTN;
        queryParam.arrstn = flight.ARRSTN;
        queryUrl = localIP+"air/getTonghangAirlineByAirport";
    }else{
        queryParam.depstn = flight.DEPSTN;
        queryParam.arrstn = flight.ARRSTN;
        queryParam.actype = flight.ACTYPE;
        queryParam.season = getFlightSeason();
        queryUrl = localIP+"air/getAirlineByAirport";
    }

    //清除图层
    flightGroup.clearLayers();
    //全局变量清空
    lineArr_top=[];
    linePointsDistanceArr_top = [];//航线航路点记录及到达时间集合

    //航线长度
    let distance = 0;

    //查询航线
    $.ajax({
        url:queryUrl,
        method:"get",
        data:queryParam,
        success:function(data){

            if(data.resultCode!=1 || !data.data){
                zeroModal.error({
                    content:"航路数据请求异常",
                    height:"200px"
                });

                //todo 加载航班详情
                loadAirflightDetail(flight);
                if( $('#meteoSection').css("display") == "none"){
                    $(".v_atmos").hide();
                    $('#meteoSection').slideUp("fast",function(){
                        $('#meteoSection').show();
                        $('#meteoSection').css("overflow","visible");

                    });
                }

                return;
            }

            let lineObj = {};
            if(typeof data.data === "string"){
                let datas = JSON.parse(data.data);

                lineObj = datas.DATA[0];
            }else if(typeof data.data === "object"){
                lineObj = data.data;
            }

            lineObj.ENROUTE_DETAIL.sort(function(a,b){
                var value1 = a.SERIES_NO;
                var value2 = b.SERIES_NO;
                return value1 - value2;
            })

            if(lineObj.ALTITUDE){
                if(lineObj.ALTITUDE.INITIAL){
                    airAltitude_top = lineObj.ALTITUDE.INITIAL;
                }
            }


            //返回的航线数据不包含机场，添加起飞落地机场
            var depAirportrNode = $(".airport span[three='"+lineObj.DEPSTN+"']");
            if(depAirportrNode.length == 1){//起飞机场

                lineObj.ENROUTE_DETAIL.unshift({
                    LAT:parseFloat(depAirportrNode.attr("lat")),
                    LON:parseFloat(depAirportrNode.attr("lon")),
                    POINT_ID:depAirportrNode.attr("three"),
                    isConvertLatlng :false
                })
            }


            for(let s = 0;s<lineObj.ENROUTE_DETAIL.length;s++){
                let currLat = 0;
                let currLon = 0;
                let pointId = lineObj.ENROUTE_DETAIL[s].POINT_ID;

                if(lineObj.ENROUTE_DETAIL[s].isConvertLatlng == false){
                    currLat = lineObj.ENROUTE_DETAIL[s].LAT;
                    currLon = lineObj.ENROUTE_DETAIL[s].LON;
                }else{
                    currLat = dms2ddd("lat",lineObj.ENROUTE_DETAIL[s].LAT);
                    currLon = dms2ddd("lon",lineObj.ENROUTE_DETAIL[s].LON);
                }


                //定位到中间点
                if(s == parseInt(lineObj.ENROUTE_DETAIL.length/2)){
                    map.flyTo([currLat,currLon]);
                }

                let thisAltitude = lineObj.ALTITUDE.INITIAL;

                //计算距离
                if(s>=1){
                    var lastPoint = [];
                    if(lineObj.ENROUTE_DETAIL[s-1].isConvertLatlng == false){
                        lastPoint = [lineObj.ENROUTE_DETAIL[s-1].LAT,lineObj.ENROUTE_DETAIL[s-1].LON];
                    }else{
                        lastPoint = [dms2ddd("lat",lineObj.ENROUTE_DETAIL[s-1].LAT),dms2ddd("lon",lineObj.ENROUTE_DETAIL[s-1].LON)];
                    }

                    let thisDistance = getDistance(currLat,currLon,lastPoint[0],lastPoint[1]);
                    distance+=thisDistance;

                    // if(s == lineObj.ENROUTE_DETAIL.length-1){
                    //     thisAltitude = 0;
                    // }
                    linePointsDistanceArr_top.push({"distance":thisDistance,"altitude":thisAltitude,"pointId":pointId,"lat":currLat,"lng":currLon});
                }else{
                    linePointsDistanceArr_top.push({"distance":0,"altitude":thisAltitude,"pointId":pointId,"lat":currLat,"lng":currLon});
                }

                var k_marker = L.circleMarker([currLat,currLon], {
                    stroke: true,
                    color: "green",
                    weight: 2,
                    opacity: 0,
                    fillColor: "green",
                    fillOpacity: 0.7,
                    radius: 5,
                    pane:'dash'
                }).addTo(flightGroup);

                lineArr_top.push([currLat,currLon]);
            }

            //添加航线,并设置线动画效果
            L.polyline.antPath(lineArr_top, {
                "paused": false,   　　//暂停  初始化状态
                "reverse": false,　　//方向反转
                "delay": 1000,　　　　//延迟，数值越大效果越缓慢
                "dashArray": [20, 20],　//间隔样式
                "weight": 6,　　　　//线宽
                "opacity": 0.5,　　//透明度
                "color": "#0000FF",　//颜色
                "pulseColor": "#FFFFFF"　　//块颜色
            }).addTo(flightGroup);

            //计算到达各个点的时间 km/s
            let speedAvg = distance / ((new Date(flight.ATA).getTime() - new Date(flight.ATD).getTime())/1000);
            let useTime = 0;//飞行耗时
            for (let i=0;i<linePointsDistanceArr_top.length;i++) {
                useTime += (linePointsDistanceArr_top[i].distance/speedAvg);

                let time = new Date(flight.ATD).getTime() + useTime*1000 +8*1000*60*60;

                linePointsDistanceArr_top[i]={
                    distance:linePointsDistanceArr_top[i].distance,
                    timestamp:time,
                    altitude:linePointsDistanceArr_top[i].altitude,
                    pointId:linePointsDistanceArr_top[i].pointId,
                    lat:linePointsDistanceArr_top[i].lat,
                    lng:linePointsDistanceArr_top[i].lng
                };
            }

            //添加初始飞机图标
            initAirIconMarker_top = L.marker(
                lineArr_top[0],
                {icon:L.icon({
                        iconUrl: 'img/320_up.png',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })}
            ).setRotationAngle(
                getAngle({lat:lineArr_top[0][0],lng:lineArr_top[0][1]},{lat:lineArr_top[1][0],lng:lineArr_top[1][1]})
            ).addTo(flightGroup);

            //添加时间线
            addAirTimeLine(flight,linePointsDistanceArr_top);

            //加载天气剖面
            loadAirrouteMeteoSection(flight);
        }
    })
}



function new_click(){
    airGroup.clearLayers();
    var now_index = $('.y_time>li').index($('.li_sel'));
    var air_point = point_arr[now_index];
    var air_angle = angle_arr[now_index];
    var icon = L.marker(air_point, {icon: setMyIcon(),pane:'line',rotationOrigin:"center center",rotationAngle:air_angle}).addTo(airGroup);
    re_site(icon);
}

/**
 * @describe 页面添加时间轴
 * @author Wuguoqiang
 * @date 2021.01.22
 * @param flight
 */
var timeSpan = 0;//时间轴总时间跨度
function addAirTimeLine(flight,pointArr){
    //时间轴的时间跨度
    timeSpan = pointArr[pointArr.length - 1].timestamp - pointArr[0].timestamp;

    let myIcon = L.icon({
        iconUrl: 'img/320_up.png',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    lineAnimation = L.motion.polyline(lineArr_top, {
        color: "transparent"
    }, {
        auto: false,
        easing: L.Motion.Ease.linear,
        duration: timeSpan
    },{icon:myIcon}).addTo(flightGroup);

    if(meteorologicalInfo.timeList){
        add_time();
        return;
    }

    var str = '';
    var str1,str2,str_;
    var cArr = [];

    var col = [];
    var otimeArr=[];//航班起飞落地时间及其中间的整点时间
    otimeArr.push(pointArr[0].timestamp);

    var firstCalTimestamp = pointArr[0].timestamp + 1200000 - pointArr[0].timestamp%1200000;
    otimeArr.push(firstCalTimestamp+0);

    while(firstCalTimestamp<pointArr[pointArr.length-1].timestamp){
        otimeArr.push(firstCalTimestamp+1200000);
        firstCalTimestamp+=1200000;

    }

    if(otimeArr.indexOf(pointArr[pointArr.length-1].timestamp) == -1){
        otimeArr.push(pointArr[pointArr.length-1].timestamp);
    }


    for(let s=0;s<otimeArr.length;s++){
        let newDate = new Date(otimeArr[s]);

        let newTimeHour = newDate.getHours()+"";
        if(newTimeHour.length<2){
            newTimeHour = '0'+newTimeHour;
        }

        let newTimeMinutes = newDate.getMinutes()+"";
        if(newTimeMinutes.length<2){
            newTimeMinutes = '0'+newTimeMinutes;
        }

        let new_time = newTimeHour+":"+newTimeMinutes;

        //计算当前时间与开始时间跨度与整个时间轴时间跨度比例
        let timeScale = (otimeArr[s] - otimeArr[0])/timeSpan.toFixed(1)*100;
        let timeScaleNext = 0;

        if(s<otimeArr.length - 1 && s>0){
            timeScaleNext = (otimeArr[s+1] - otimeArr[0])/timeSpan.toFixed(1)*100;
            timeScaleLast = (otimeArr[s-1] - otimeArr[0])/timeSpan.toFixed(1)*100;
        }

        //若左右间隔小于4%，则不添加时间显示，只添加时间刻度
        if((timeScaleNext - timeScale) >4 || timeScaleNext ==0 || (timeScaleLast - timeScale) >4){
            str += '<li title="'+new_time+'" style="left:'+timeScale+'%" name="'+otimeArr[s]+'">' +
                ''+ new_time +'' +
                '<span style="color:#aaaaaa; position: relative;top: -15px;left: -90%;">|</span>' +
                '</li>';
        }else{
            str += '<li title="'+new_time+'" style="left:'+timeScale+'%" name="'+otimeArr[s]+'">' +
                '<span style="color:#aaaaaa; position: relative;top: -15px;left: -50%;">|</span>' +
                '</li>';

        }

    }

    str_=str;
    for(var key in col){
        var c = col[key];
//					console.log(c);
        cArr.push(c);
    }

//	console.log(str);
    $('.y_time').html(str_);
    $('.timer_box').show();
    $('.y_time>li').eq(0).addClass('li_sel');
//	new_click();
    $('.s_drag').animate({left:0},400);
    $(".s_drag .s_drag_label").html(dateFormat("mm-dd HH:MM:SS",new Date(linePointsDistanceArr_top[0].timestamp)));

    var color = cArr.join(',');
    $('.y_timer').css({'background':'linear-gradient(to right,'+color+')'});
    $('.y_timer').click(function(e){
        $('.s_drag').css({'left': e.offsetX});

        //飞机图标定位
        let this_active = (($('.s_drag').css("left").replace("px",""))/parseInt($('#y_timer').css("width").replace("px",""))).toFixed(2);
        let currTime = linePointsDistanceArr_top[0].timestamp +timeSpan*this_active;
        $("#y_timer_in").css("width",e.offsetX+"px");
        $(".s_drag .s_drag_label").html(dateFormat("mm-dd HH:MM:SS",new Date(currTime)));

        //设置暂停后继续播放的全局变量
        lineAnimation.__ellapsedTime = timeSpan*this_active/playSpeed;
        slideDistanceTotla = parseFloat(this_active)*100;
        playIsCpmplete = false;
        lineAnimation.motionOptions.duration = timeSpan/playSpeed;

        //确定当前时间所在的时间区间，计算当前时间占整个时间区间的比例，并根据比例计算经纬度
        for(let s = 0;s < linePointsDistanceArr_top.length ; s++){
            if(linePointsDistanceArr_top[s].timestamp >=currTime){
                let timeRadio = (currTime- linePointsDistanceArr_top[s-1].timestamp)/(linePointsDistanceArr_top[s].timestamp-linePointsDistanceArr_top[s-1].timestamp);
                //通过比例计算时间内经纬度的增量，从而确定飞机当前位置坐标
                let currLat = lineArr_top[s-1][0]+(lineArr_top[s][0]-lineArr_top[s-1][0])*timeRadio;
                let currLng = lineArr_top[s-1][1]+(lineArr_top[s][1]-lineArr_top[s-1][1])*timeRadio;

                //设置飞机图标位置及角度
                initAirIconMarker_top.setLatLng([currLat,currLng]);
                initAirIconMarker_top.setRotationAngle(getAngle({lat:currLat,lng:currLng},{lat:lineArr_top[s][0],lng:lineArr_top[s][1]}));
                break;
            }
        }

    })
}

/**
 * 添加机场图例
 */

/**
 * 打开更新日志
 */
function openUpdateLog(){
    zeroModal.show({
        title: '更新日志',
        iframe: true,
        url: 'updateLog.html',
        width: '80%',
        height: '80%',
        top: '100px',
        cancel: true,
        overlay:true,
        opacity: 0.8,
        close:false
    });
}