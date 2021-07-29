(function(){
    var originalInitTile = L.GridLayer.prototype._initTile
    L.GridLayer.include({
        _initTile: function (tile) {
            originalInitTile.call(this, tile);
			if(L.TileLayer.DRAWIMG&&this.__proto__==L.TileLayer.DRAWIMG.prototype){
				var tileSize = this.getTileSize();
				tile.style.width = tileSize.x + 0.5 + 'px';
				tile.style.height = tileSize.y + 0.5 + 'px';
			}
        }
    });
})()

//var  tile_size = 128; //默认瓦片的画布像素大小
//var  gradient = 0.75; //设置渐变度的大小，越小界限越清晰，越大，越模糊
//var  grid = null;
//以上参数，都可以在options中传递
var  imgfun = {
	//瓦片坐标与经纬度坐标换算
	xtolng: function(x, z) {
		//参数：瓦片坐标zoom，x
		return(x / Math.pow(2, z) * 360 - 180);
	},
	ytolat: function(y, z) {
		//参数：瓦片坐标zoom，y
		var  n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
		return(180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
	},
	get_latlng: function(coords) {
		//计算出来瓦片的左上角和右下角的经纬度
		//参数：瓦片坐标zoom，x，y
		//瓦片的排布方式是原点在左上角，y坐标是上小下大，而纬度是上大下小
		//所以纬度的计算方式跟经度刚好相反
		var  lon_min = this.xtolng(coords.x, coords.z);
		var  lon_max = this.xtolng(coords.x + 1, coords.z);
		var  lat_max = this.ytolat(coords.y, coords.z);
		var  lat_min = this.ytolat(coords.y + 1, coords.z);
		return {
			latmin: lat_min,
			latmax: lat_max,
			lonmin: lon_min,
			lonmax: lon_max
		}
	},
	//计算瓦片里某一点的经纬度坐标
	get_px_latlng: function(t, x, y,tile_size) {
		//参数：瓦片的最大最小经纬度，瓦片画布像素，需要计算的点的x，y坐标
		var  lon = t.lonmin + (t.lonmax - t.lonmin) * x / tile_size;
		var  lat = t.latmax - (t.latmax - t.latmin) * y / tile_size;
		return [lat, lon];
	},
	//反距离权重插值
	interpolation: function(x, y, g1, g2, g3, g4) {
		//把一个格子算成1*1的方块，x,y就是方块中某一点的坐标
		//g1,g2,g3,g4是左上，右上，左下，右下四个点
		var d1 = (1 - x) * (1 - y);
		var d2 = x * (1 - y);
		var d3 = y * (1 - x);
		var d4 = x * y;
		//d1--d4表示四个点对最终值的影响程度
		return g1 * d1 + g2 * d2 + g3 * d3 + g4 * d4;
	},
	//判断是否是数字，或者缺省
	isValue: function(v) {
		return !isNaN(v) && v < 99999;
	},
	//获取rgb颜色
	getrgba: function(v, color,gradient) {
		//因为数据总计算量很大，而且速度要求很高，所以这里能节省时间就节省时间
		//这里采用二分法查找
		var  this_rgb = [0, 0, 0, 0];
		if(v == null) {
			return this_rgb;
		}
		//违反验证
		if(Number(v) <= color.v[0]) {
			return [color.r[0], color.g[0], color.b[0],0];
		} else if(v >= 10000) {
			var  n = color.v.length - 1;
			return [color.r[n], color.g[n], color.b[n],0];
		} else if(v >= color.v[color.v.length - 1]) {
			var  n = color.v.length - 1;
			return [color.r[n], color.g[n], color.b[n],255];
		}
		//中间查找
		var  low = 0;
		var  high = color.v.length - 1;

		while(low < high) {
			var  mid = parseInt((low + high + 1) / 2);
			if(color.v[mid] == v) {
				this_rgb = [color.r[mid], color.g[mid], color.b[mid],255];
				break;
			} else if(color.v[mid] > v) {
				high = mid;
			} else {
				low = mid;
			}
			if((high - low) == 1) {
//				//位于两个值中间，就对颜色进行插值
				var  x = (v - color.v[low]) / (color.v[high] - color.v[low]);
				var  mid_r = (color.r[high] - color.r[low])/4;
				var  mid_g = (color.g[high] - color.g[low])/4;
				var  mid_b = (color.b[high] - color.b[low])/4;
				if(x <= gradient) {

					var  y = x/gradient
					var  r = color.r[low]+mid_r*y
					var  g = color.g[low]+mid_g*y
					var  b = color.b[low]+mid_b*y
					this_rgb = [parseInt(r), parseInt(g), parseInt(b), 255];
					break;
				}else if(x>gradient&&x<1-gradient){
					var  y = (x-gradient)/(1-2*gradient);
					var  r = color.r[low]+mid_r+2*mid_r*y
					var  g = color.g[low]+mid_g+2*mid_g*y
					var  b = color.b[low]+mid_b+2*mid_b*y
					this_rgb = [parseInt(r), parseInt(g), parseInt(b), 255];
					break;
				} else {
					var  y = (x+gradient-1)/gradient;
					var  r = color.r[low]+mid_r*y+3*mid_r;
					var  g = color.g[low]+mid_g*y+3*mid_g;
					var  b = color.b[low]+mid_b*y+3*mid_b;
					this_rgb = [parseInt(r), parseInt(g), parseInt(b), 255];
					break;
				}

//				//位于两个值中间，就对颜色进行插值
////				var  x = (v - color.v[low]) / (color.v[high] - color.v[low]);
////				var  r = color.r[low] * (1 - x) + color.r[high] * x;
////				var  g = color.g[low] * (1 - x) + color.g[high] * x;
////				var  b = color.b[low] * (1 - x) + color.b[high] * x;
////				this_rgb = [parseInt(r), parseInt(g), parseInt(b), 220];
////              mid = high
////              this_rgb = [color.r[mid], color.g[mid], color.b[mid],220];
////				break;
//
////				//位于两个值中间，就对颜色进行插值
//				var  x = (v - color.v[low]) / (color.v[high] - color.v[low]);
//				if(x <= gradient) {
//					var  y = x/gradient
//					var  r = color.r[low] * (1 - y) + color.r[high] * y;
//					var  g = color.g[low] * (1 - y) + color.g[high] * y;
//					var  b = color.b[low] * (1 - y) + color.b[high] * y;
//					this_rgb = [parseInt(r), parseInt(g), parseInt(b), 255];
//					break;
//				} else {
//					mid = high
//					this_rgb = [color.r[mid], color.g[mid], color.b[mid], 255];
//					break;
//				}



			}
		}
		return this_rgb;

	},
	//根据像素点的经纬度插值
	insertData: function(lat, lon,grid,grid_data) {
		//计算lon的位置
		//if(lon<0){
		//	lon+=360;
		//}
		var  x = (lon - grid.lonmin) / grid.interval_lng;
		var  y = (grid.latmax - lat) / grid.interval_lat;
		//各取前后一个整数格点的位置
		var  fx = Math.floor(x);
		var  fy = Math.floor(y);
		var  tx = fx + 1;
		var  ty = fy + 1;

		x = x - fx;
		y = y - fy;
		if(row = grid_data[fy]) {
			var  g1 = row[fx];
			var  g2 = row[tx];
			if(imgfun.isValue(g1) && imgfun.isValue(g2) && (row = grid_data[ty])) {
				var  g3 = row[fx];
				var  g4 = row[tx];
				if(imgfun.isValue(g3) && imgfun.isValue(g4)) {
					return imgfun.interpolation(x, y, g1, g2, g3, g4);
				}
			}
		}
		return null;
	},
	mouseMoveFunc:function(e,grid,tooltip) {

		var platlng=e.latlng;
		var value = imgfun.insertData(platlng.lat, platlng.lng,grid,grid.data);
		if(value == null){
			tooltip.remove();
		}
		if(value>0||value<0){
			if(grid.ele == 'vis'){
				tooltip.setLatLng(platlng).setContent(((parseFloat(value))/1000).toFixed(1)).addTo(map);
			}else if(grid.ele == 'Ic'){
				if(Number(value)==-1){
				}else if(Number(value)==1){
					tooltip.setLatLng(platlng).setContent("轻度").addTo(map);
				}else if(Number(value)==2){
					tooltip.setLatLng(platlng).setContent("中度").addTo(map);
				}else if(Number(value)==3){
					tooltip.setLatLng(platlng).setContent("严重").addTo(map);
				}
			}else if(grid.ele == 'DBZSWC'){
				if(Number(value)>=0){
					tooltip.setLatLng(platlng).setContent(value.toFixed(1)).addTo(map);
				}
			}else{
				tooltip.setLatLng(platlng).setContent(value.toFixed(1)).addTo(map);
			}
		}


	}
}
L.TileLayer.DRAWIMG = L.GridLayer.extend({
	options: {},
	initialize: function(data, options) {
		console.log(options)
		this.setGrid(data);
		this.color = options.color;
		options = L.setOptions(this, options);
		if("tile_size" in options) {
			this.tile_size = options.tile_size;
		}else{
			this.tile_size  =128;
		}
		if("gradient" in options){
			this.gradient = options.gradient;
		}else{
			this.gradient = 0.8;
		}
	},
	createTile: function(coords, done) {
		var  tile = document.createElement("canvas");
		//		var size = this.getTileSize();
		tile.width = this.tile_size;
		tile.height = this.tile_size;
		var  ctx = tile.getContext("2d");
		var  tile_latlng = this.tileOrginToPixelRange(coords);
		setTimeout(function() {
			done(null, tile);
		}, 0)
		this.draw(ctx, tile_latlng,tile);
		return tile;
	},
	setGrid: function(data) {
		//因为地理位置的原因，lat坐标要反转
//		this.grid_data = data.data.reverse();
        data.data = data.data.reverse();
		this.grid = {
			latmin: data.latmin,
			latmax: data.latmax,
			lonmin: data.lonmin,
			lonmax: data.lonmax,
			nlat: data.nlat,
			nlon: data.nlon,
			ele: data.ele,
			interval_lat: data.interval_lat,
			interval_lng: data.interval_lng,
		}

		this.grid_data = []
		var p = 0;
		var isContinuous = Math.floor(data.nlon * data.interval_lng) >= 360;
		//x方向的跨度乘以x方向的数量是否大于360
		for(var j = 0; j < data.nlat; j++) {
			var row = [];
			for(var i = 0; i < data.nlon; i++) {
				row[i] = data.data[j][i];
			}
			if(isContinuous) {
				// For wrapped grids, duplicate first column as last column to simplify interpolation logic
				row.push(row[0]);
			}
			this.grid_data[j] = row;
		}
		//grid是一个三维数组
		//第一纬表示行数
		//第二纬表示列数
		//第三纬表示每一个网格点的uv

	},
	tileOrginToPixelRange:function(coords){
		var tileSize = this.getTileSize();


//		var point=L.point(coords.x, coords.y);
//		var px=point.scaleBy(tileSize);
		var px = {
			x:coords.x*tileSize.x,
			y:coords.y*tileSize.y
		}

		return {
			p:px,
			z:coords.z,
		};
	},
	pixelPointToLayerPoint:function(px,i,j,z,tilesize){
		var map=this._map;
		var n = this.getTileSize().x/tilesize;
		var px1=L.point(px.x+i*n,px.y+j*n);
		var lp=map.unproject(px1,z);
		return lp;
	},
	draw: function(ctx, tile_latlng,tile) {
		var  color = this.color;
		var  grid = this.grid;
		var  grid_Data = this.grid_data;

		var vs=[];

		setTimeout(function() {
			var  rgba = ctx.createImageData(this.tile_size, this.tile_size);
			for(var  i = 0; i < this.tile_size; i++) {
				vs.push([])
				for(var  j = 0; j < this.tile_size; j++) {
//					var  latlng = imgfun.get_px_latlng(tile_latlng, j, i,this.tile_size);
                    var  latlng = this.pixelPointToLayerPoint(tile_latlng.p, j, i,tile_latlng.z,this.tile_size);
					var  v = imgfun.insertData(latlng.lat, latlng.lng,grid,grid_Data);
					var  thisrgb = imgfun.getrgba(v, color,this.gradient);
					rgba.data[(i * this.tile_size + j) * 4 + 0] = thisrgb[0];
					rgba.data[(i * this.tile_size + j) * 4 + 1] = thisrgb[1];
					rgba.data[(i * this.tile_size + j) * 4 + 2] = thisrgb[2];
					rgba.data[(i * this.tile_size + j) * 4 + 3] = thisrgb[3];


					vs[i].push(v);
				}
			}
			//console.log(vs);
			ctx.putImageData(rgba, 0, 0);

			tile.style.pointerEvents = 'initial';
		}.bind(this), 50)

	}
})
L.tileLayer.drawImg = function(grid, options) {
	var tileLayer = new L.TileLayer.DRAWIMG(grid, options);

	if(!map.meteotooltip){
		map.meteotooltip=L.tooltip({sticky:true,opacity:1});
	}

	map.meteotooltip.remove();
	map.off('mousemove', map.meteoMouseMovefunc)

	if(grid.ele != "wind"){
		map.meteoMouseMovefunc = function(e){
			imgfun.mouseMoveFunc(e,grid,map.meteotooltip)
		}

		map.on('mousemove', map.meteoMouseMovefunc)
	}

	return tileLayer
}