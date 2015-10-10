/**
 * 
 * @authors Tom Hu (h1994st@gmail.com)
 * @date    2015-10-03 22:23:28
 * @version 1.0
 */
$(document).ready(function() {
  // init map
  var map = new BMap.Map('item-map');
  var itemOverlays = [];

  function addItem(item) {
    var itemGeoPoint = item.get('location');
    var address = item.get('place');
    var type = item.get('type');
    var typeStr = '';
    var itemIcon;
    var mk;

    var itemPoint = new BMap.Point(itemGeoPoint.longitude, itemGeoPoint.latitude); // lng, lat

    if (type === 'found') {
      typeStr = '捡到的物品'
      itemIcon = new BMap.Icon("/images/marker_green_sprite.png", new BMap.Size(19,25));
      mk = new BMap.Marker(itemPoint, { icon:itemIcon });
    } else {
      typeStr = '丢失的物品'
      mk = new BMap.Marker(itemPoint);
    }

    // Add new overlay
    map.addOverlay(mk);

    // Add info window
    // 百度地图API功能
    var content = '<div style="margin:0;line-height:20px;padding:2px;">' +
                    '<img src="' + item.get('image').url() + '" alt="' + item.get('name') + '" style="float:right;zoom:1;overflow:hidden;width:100px;height:100px;margin-left:3px;"/>' +
                    '地址：' + item.get('place') + '<br/>简介：' + item.get('itemDescription') + '<br/><a href="/items/' + item.id + '">详细信息</a>' +
                  '</div>';
    var itemInfoWindow = new BMapLib.SearchInfoWindow(map, content, {
      title: item.get('name') + '(' + typeStr + ')',
      width: 290,
      // height: 105,
      panel: 'panel',
      enableAutoPan: true,
      enableCloseOnClick: true,
      searchTypes: []
    });
    mk.addEventListener('click', function () {
      itemInfoWindow.open(mk);
    });

    itemOverlays.push(mk);
  }

  function showItems(items) {
    for (var i = 0; i < itemOverlays.length; i++) {
      map.removeOverlay(itemOverlays[i]);
    };

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      addItem(item);
    };
  }

  function retrieveItems(centerPoint) {
    var point = new AV.GeoPoint({
      'latitude': centerPoint.lat,
      'longitude': centerPoint.lng
    });

    var query = new AV.Query(Item);
    // query.withinKilometers('location', point, 10);
    query.near('location', point);
    query.find({
      success: function (items) {
        showItems(items);
      },
      error: function (error) {
        console.log(error);
      }
    });
  }

  // Default - current city
  var myCity = new BMap.LocalCity();
  myCity.get(function (result) {
    var cityName = result.name;
    map.centerAndZoom(cityName);
  });

  // 右下角，添加比例尺
  var scaleControl = new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT});
  map.addControl(scaleControl);

  // 添加导航控件
  var navigationControl = new BMap.NavigationControl({
    // 靠左上角位置
    anchor: BMAP_ANCHOR_TOP_LEFT
  });
  map.addControl(navigationControl);

  // 添加定位控件
  var geolocationControl = new BMap.GeolocationControl({
    enableAutoLocation: true
  });

  geolocationControl.addEventListener('locationSuccess', function (e) {
    // 定位成功事件
    var address = '';
    address += e.addressComponent.province;
    address += e.addressComponent.city;
    address += e.addressComponent.district;
    address += e.addressComponent.street;
    address += e.addressComponent.streetNumber;

    var point = e.point;

    map.centerAndZoom(point, 18);

    // http://api0.map.bdimg.com/images/geolocation-control/point/position-icon-14x14.png
    var centerIcon = new BMap.Icon("http://api0.map.bdimg.com/images/geolocation-control/point/position-icon-14x14.png", new BMap.Size(14,14));
    var centerMarker = new BMap.Marker(point, { icon:centerIcon });

    map.addOverlay(centerMarker);

    retrieveItems(point);
  });

  geolocationControl.addEventListener('locationError', function (e) {
    // 定位失败事件
    console.log(e.message);

    // // Default - current city
    // var myCity = new BMap.LocalCity();
    // myCity.get(function (result) {
    //   var cityName = result.name;
    //   map.centerAndZoom(cityName);
    // });
  });

  map.addControl(geolocationControl);

  // 开始定位
  geolocationControl.location();
});
