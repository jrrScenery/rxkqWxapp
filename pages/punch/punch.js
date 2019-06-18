var util = require('../../utils/util.js');
var QQMapWX = require('../../common/sdk/qqmap-wx-jssdk.js');
var qqmapsdk;
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
  },

  punchCard: function () {
    var that = this;
    that.refreshLocation();     
  },

  refreshLocation:function(){
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude; 
        if (latitude && longitude){
          that.getSpecificLocation(latitude, longitude);
          var targetLatitude = that.data.targetLatitude;
          var targetLongitude = that.data.targetLongitude;
          that.refreshDistance(latitude, longitude, targetLatitude, targetLongitude);
        }else{
          wx.showToast({
            title: "位置信息获取经纬度为空",
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail:function(res){
        console.log(res);
        wx.showToast({
          title: '位置信息接口调用失败，请确认位置权限是否打开',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  refreshDistance: function (lat1, lng1, lat2, lng2){
    console.log("lat2:" + lat2, ",lng2:"+lng2);
    var that = this;
    var f = this.getRad((lat1 + lat2) / 2);
    var g = this.getRad((lat1 - lat2) / 2);
    var l = this.getRad((lng1 - lng2) / 2);
    var sg = Math.sin(g);
    var sl = Math.sin(l);
    var sf = Math.sin(f);
    var s, c, w, r, d, h1, h2, display;
    var a = 6378137.0;  //The Radius of eath in meter.   
    var fl = 1 / 298.257;
    sg = sg * sg;
    sl = sl * sl;
    sf = sf * sf;
    s = sg * (1 - sl) + (1 - sf) * sl;
    c = (1 - sg) * (1 - sl) + sf * sl;
    w = Math.atan(Math.sqrt(s / c));
    r = Math.sqrt(s * c) / w;
    d = 2 * w * a;
    h1 = (3 * r - 1) / 2 / c;
    h2 = (3 * r + 1) / 2 / s;
    s = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
    s = s / 1000;
    s = s.toFixed(2);//指定小数点后的位数。

    var location = that.data.location;
        location.latitude = lat1;
        location.longitude = lng1;
        that.setData({
          location: location,
          distantMeter: s
        })
    if (s <= that.data.prjDistance) {
      wx.showLoading({
        title: '正在打卡',
      });
      that.setData({
        disable: true
      })
      var date = new Date();
      //对打卡范围进行设定，满足请求服务器，不满足返回失败
      var url = util.requestService("/api/hrkq/punchCard");
      var punchtime = util.formatTime(new Date).substring(10, 20);
      var postdata = {
        encryption: wx.getStorageSync("encryption"),
        topEmpId: wx.getStorageSync("topEmpId"),
        punchDate: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        punchTime: punchtime,
        location: that.data.location.address,
        latitude: that.data.location.latitude,
        longitude: that.data.location.longitude,
        prjId: that.data.prjId,
        groupId: that.data.groupId,
        addrId: that.data.addrId
      };
      console.log(postdata);
      //请求服务器成功将获取的打卡次数赋值给punchNum
      function success(res) {
        wx.hideLoading();
        setTimeout(function () {
          that.setData({
            disable: false
          })
        }, 3000);
        if (res.data.code == 200) {
          wx.hideLoading();
          wx.showToast({
            title: '打卡成功',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            punchNum: res.data.punchNum
          })
        } else if (res.data.code == 99) {
          util.redirect(res.data.message);
        } else {
          wx.showToast({
            title: res.data.message,
            icon: "none",
            duration: 2000
          })
        }
      }
      util.getPostRequest(url, postdata, success);
    } else {
      wx.showToast({
        title: '不在打卡范围，打卡失败',
        icon: "none",
        duration: 2000
      })
    }
  },
  getPunchInfo(){
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    var encryption = wx.getStorageSync("encryption") || null;
    if (encryption) {
      wx.checkSession({
        success: function () {
          var updateUrl = util.requestService("/api/hrkq/update");
          var update = {
            encryption: wx.getStorageSync("encryption"),
            topEmpId: wx.getStorageSync("topEmpId")
          }
          function success(res) {
            console.log("update",res);
            if (res.data.code == 200) {
              wx.setStorage({
                key: 'loginData',
                data: res.data,
              })
              if (res.data.leadPrjMapList.length != 0) {
                for (let i = 0; i < res.data.leadPrjMapList.length; i++) {
                  if (res.data.leadPrjMapList[i].addressMapList != null) {
                    res.data.prjMapList[res.data.prjMapList.length] = res.data.leadPrjMapList[i];
                  }
                }
              }
              that.setData({
                prjMapList: res.data.prjMapList,
              })             
              var date = new Date();
              var url = util.requestService("/api/hrkq/queryPunchNum");
              var postdata = {
                encryption: wx.getStorageSync("encryption"),
                topEmpId: wx.getStorageSync("topEmpId"),
                punchDate: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
              }
              function success(res) {
                console.log("queryPunchNum", res);
                wx.hideLoading();
                if (res.data.code == 200) {
                  that.getLocationInfo();
                  that.getTime();
                  that.setData({
                    punchNum: res.data.punchNum,
                    isLogin: true
                  })
                } else if (res.data.code == 99) {
                  util.redirect(res.data.message);
                } else {
                  wx.showToast({
                    title: res.data.message,
                    icon: "none",
                    duration: 2000
                  })
                }
              }
              util.getPostRequest(url, postdata, success);
            } else if (res.data.code == 99) {
              wx.redirectTo({
                url: "/pages/login/login",
              })
            } else {
              wx.showToast({
                title: res.data.message,
                icon: "none",
                duration: 2000
              })
            }
          }
          util.getPostRequest(updateUrl, update, success);          
        },
        fail: function (res) {
          wx.hideLoading();
          //跳转到登录页面
          util.redirect("登录失效，请重新登录");
        }
      })
    } else {
      wx.hideLoading();
      wx.redirectTo({
        url: '../login/login',
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    qqmapsdk = new QQMapWX({
      key: 'EDYBZ-VE664-LM7UY-XC7KU-KBRGK-G2BRI'
    });   
    this.setData({
      punch: "",
      location: {
        "latitude": "",
        "longitude": "",
        "address": "",
        "addressName": ""
      },
      distantMeter: null,
      punchtime: null,
      disable: false,
      isLogin: false,
      prjMapList: []
    })
    this.getPunchInfo(); 
    setInterval(this.getTime,1000)
  },

  //获取当前时间
  getTime() {
    var that = this;
    this.setData({
      punch: util.formatTime(new Date).substring(10, 20)
    })
  },

  //获取经纬度信息 
  getLocationInfo: function () {
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude; 
        that.getSpecificLocation(latitude, longitude);
        console.log("latitude:" + latitude, "longitude:" + longitude);
        if (latitude && longitude){
          if (that.data.prjMapList) {
            for (var i = 0; i < that.data.prjMapList.length; i++) {
              if (that.data.prjMapList[i].addressMapList != null) {
                var addressMapList = that.data.prjMapList[i].addressMapList;
                for (var j = 0; j < addressMapList.length; j++) {
                  var targetLatitude = addressMapList[j].latitude;
                  var targetLongitude = addressMapList[j].longitude;
                  that.getDistance(latitude, longitude, targetLatitude, targetLongitude, i, j);
                }
              } else {
                util.redirect("没有对应的项目地址，请联系管理员！");
              }
            }
            console.log("data", that.data);
          } else {
            util.redirect("没有对应的项目，请联系管理员！");
          }
        }else{
          wx.showToast({
            title: "经纬度获取为空",
            icon: 'none',
            duration: 2000
          })
        }        
        // that.getSpecificLocation(latitude, longitude);
      },
      fail:function(res){
        wx.showToast({
          title: '位置信息接口调用失败，请确认位置权限是否打开',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

//获取具体的位置信息
  getSpecificLocation: function (latitude, longitude) {
    let that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (addressRes) { //成功后的回调
        var addressRes = addressRes.result;
        console.log("getSpecificLocation:",addressRes)
        let location = {};
        location = that.data.location;
        location.address = addressRes.address;
        location.addressName = addressRes.formatted_addresses.recommend;
        console.log("location.address:" + location.address);
        console.log("location.addressName:" + location.addressName);
        that.setData({
          location: location,
        })
      },
      fail: function (error) {
        wx.showToast({
          title: "获取具体的位置信息失败"
        })
        console.error(error);
      },
      complete: function (addressRes) {
        console.log(addressRes);
      }
    })
    // var that = this;
    // var apiURL = "https://apis.map.qq.com/ws/geocoder/v1/?location=" + latitude + "," + longitude + "&key=EDYBZ-VE664-LM7UY-XC7KU-KBRGK-G2BRI";
    // wx.request({//根据经纬度获取具体位置信息
    //   url: apiURL,
    //   success: function (res) {
    //     console.log("getSpecificLocation",res);
    //     if (res.data.status == 0){
    //       var location = {};
    //       location = that.data.location;
    //       location.address = res.data.result.address;
    //       location.addressName = res.data.result.formatted_addresses.recommend;
    //       that.setData({
    //         location: location,
    //       })
    //     } else if (res.data.status == 310){
    //       wx.showToast({
    //         title: '请求参数信息有误',
    //         icon: 'none',
    //         duration: 2000
    //       })
    //     } else if (res.data.status == 311) {
    //       wx.showToast({
    //         title: 'key格式错误',
    //         icon: 'none',
    //         duration: 2000
    //       })
    //     } else if (res.data.status == 306) {
    //       wx.showToast({
    //         title: '请求有护持信息请检查字符串',
    //         icon: 'none',
    //         duration: 2000
    //       })
    //     } else if (res.data.status == 110) {
    //       wx.showToast({
    //         title: '请求来源未被授权',
    //         icon: 'none',
    //         duration: 2000
    //       })
    //     }else{
    //       wx.showToast({
    //         title: '获取具体位置信息失败',
    //         icon: 'none',
    //         duration: 2000
    //       })
    //     }
    //   }
    // })
  },

  getRad:function(d){   
    var PI = Math.PI;    
    return d* PI / 180.0;    
  },
  /**
 * 获取两个经纬度之间的距离
 * @param lat1 第一点的纬度/当前纬度
 * @param lng1 第一点的经度/当前经度
 * @param lat2 第二点的纬度/目的纬度
 * @param lng2 第二点的经度/目的经度
 * @returns {Number}
 */

  getDistance: function (lat1, lng1, lat2, lng2, idi, idj){
    var that = this;
    var f = this.getRad((lat1 + lat2) / 2);     
    var g = this.getRad((lat1 - lat2) / 2);     
    var l = this.getRad((lng1 - lng2) / 2);     
    var sg = Math.sin(g);     
    var sl = Math.sin(l);     
    var sf = Math.sin(f);     
    var s, c, w, r, d, h1, h2, display;     
    var a = 6378137.0;  //The Radius of eath in meter.   
    var fl = 1 / 298.257;     
    sg = sg * sg;     
    sl = sl * sl;     
    sf = sf * sf;     
    s = sg * (1 - sl) + (1 - sf) * sl;     
    c = (1 - sg) * (1 - sl) + sf * sl;     
    w = Math.atan(Math.sqrt(s / c));     
    r = Math.sqrt(s * c) / w;     
    d = 2 * w * a;     
    h1 = (3 * r - 1) / 2 / c;     
    h2 = (3 * r + 1) / 2 / s;     
    s = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));   
    s = s / 1000;
    s = s.toFixed(2);//指定小数点后的位数。
    var location = that.data.location;
    location.latitude = lat1;
    location.longitude = lng1;
    var addressMapList = that.data.prjMapList[idi].addressMapList;
    if (that.data.distantMeter == null) {
      that.setData({
        targetLatitude: lat2,
        targetLongitude: lng2,
        distantMeter: s,
        location: location,
        prjDistance: that.data.prjMapList[idi].prjDistance / 1000,
        prjId: that.data.prjMapList[idi].prjId,
        prjAddress: addressMapList[idj].address,
        amworktime: that.data.prjMapList[idi].ambegintime + "-" + that.data.prjMapList[idi].amendtime,
        pmworktime: that.data.prjMapList[idi].pmbegintime + "-" + that.data.prjMapList[idi].pmendtime,
        // amworktime: addressMapList[idj].ambegintime + "-" + addressMapList[idj].amendtime,
        // pmworktime: addressMapList[idj].pmbegintime + "-" + addressMapList[idj].pmendtime,
        groupId: that.data.prjMapList[idi].groupId,
        addrId: addressMapList[idj].addrId
      })
      wx.setStorageSync("ambegintime", that.data.prjMapList[idi].ambegintime);
      wx.setStorageSync("amendtime", that.data.prjMapList[idi].amendtime);
      wx.setStorageSync("pmbegintime", that.data.prjMapList[idi].pmbegintime);
      wx.setStorageSync("pmendtime", that.data.prjMapList[idi].pmendtime);
      // console.log("370行：", that.data);
    } else if (parseFloat(that.data.distantMeter) > parseFloat(s)) {
      that.getNewData(lat1, lng1, lat2, lng2, s, idi, idj);
    } else if (parseFloat(that.data.distantMeter) < parseFloat(s)){
      // that.getNewData(lat1, lng1, lat2, lng2, that.data.distantMeter, idi, idj);
    }
  },

  getNewData: function (lat1, lng1, lat2, lng2, s, idi, idj){
    var that = this;
    var location = that.data.location;
        location.latitude = lat1;
        location.longitude = lng1;
    var addressMapList = that.data.prjMapList[idi].addressMapList;
      that.setData({
        targetLatitude: lat2,
        targetLongitude: lng2,
        distantMeter: s,
        location: location,   
        prjDistance: that.data.prjMapList[idi].prjDistance / 1000,
        prjId: that.data.prjMapList[idi].prjId,
        prjAddress: addressMapList[idj].address,
        amworktime: that.data.prjMapList[idi].ambegintime + "-" + that.data.prjMapList[idi].amendtime,
        pmworktime: that.data.prjMapList[idi].pmbegintime + "-" + that.data.prjMapList[idi].pmendtime,
        // amworktime: addressMapList[idj].ambegintime + "-" + addressMapList[idj].amendtime,
        // pmworktime: addressMapList[idj].pmbegintime + "-" + addressMapList[idj].pmendtime,
        groupId: that.data.prjMapList[idi].groupId,
        addrId: addressMapList[idj].addrId
      })
    wx.setStorageSync("ambegintime", that.data.prjMapList[idi].ambegintime);
    wx.setStorageSync("amendtime", that.data.prjMapList[idi].amendtime);
    wx.setStorageSync("pmbegintime", that.data.prjMapList[idi].pmbegintime);
    wx.setStorageSync("pmendtime", that.data.prjMapList[idi].pmendtime);
  },

  /**
 * 页面相关事件处理函数--监听用户下拉动作
 */
  onPullDownRefresh: function () {
    // wx.startPullDownRefresh();
    wx.showNavigationBarLoading(); //在标题栏中显示加载图标
    this.onLoad();
    // this.getPunchInfo(); 
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (e) {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: '打卡',
      desc: "打卡",
      path: 'pages/punch/punch',
      success: function (res) {
        wx.showShareMenu({
          // 要求小程序返回分享目标信息
          withShareTicket: true
        });

      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})