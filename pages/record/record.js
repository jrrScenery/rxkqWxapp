var util = require('../../utils/util.js');
var n=0;
var newYear = new Date().getFullYear();
var newMonth = new Date().getMonth();
var day = new Date().getDate();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    starPoint:[0,0],  //初始化touchstart坐标
    arr: [],  //定义日期数组
    sysW: null,
    lastDay: null,
    firstDay: null,
    weekArr: ['日', '一', '二', '三', '四', '五', '六'],
    date: "",
    norecord:"",
    dayrecordInfo:"",
    slidFlag:true,
    color: [{ month: 'current'}, { day: '2018-11-06' }, { color: '#ffffff'}, { background:"#436EEE"}]
  },

  mytouchstart:function(e){
    var that = this;
    this.setData({
      starPoint:[e.touches[0].pageX,e.touches[0].pageY]
    })
  },

  mytouchmove:function(e){
    var that = this;
    if (that.data.slidFlag){
      that.data.slidFlag = false;
      //当前触摸点坐标
      var curPoint = [e.touches[0].pageX, e.touches[0].pageY];
      var startPoint = [];
      startPoint = this.data.starPoint;
      //比较pageX的值
      if (Math.abs(curPoint[0] - startPoint[0]) < Math.abs(curPoint[1] - startPoint[1])) {
        wx.showLoading({
          title: '加载中',
        })
        console.log(newMonth)
        if (curPoint[1] >= startPoint[1]) {//下拉
          if (newMonth < 1) {
            newYear = newYear - 1;
            newMonth = 11;
          } else {
            newMonth = newMonth-1;
          }
          console.log(newMonth)
          that.getrecords(newYear, newMonth + 1, that.data.currentnum);
          if (that.data.records.punchDateMonth == (newMonth+1)){
            that.setData({
              arr: []
            })
          }else{
            that.setData({
              arr: [],
              records: ""
            })
          }
         
        } else {//上拉
          console.log("newMonth:"+newMonth)
          if (newMonth > 10) {
            newYear = newYear + 1;
            newMonth = 0;
          } else {
            newMonth = newMonth + 1
          }
          console.log(newMonth)
          that.getrecords(newYear, newMonth+1, day);
          if (that.data.records.punchDateMonth == (newMonth + 1)){
            that.setData({
              arr: []
            })
          }else{
            that.setData({
              arr: [],
              records: ""
            })
          }
        }
        var date = new Date(newYear + "-" + newMonth + "-" + day);
        var months = newMonth + 1;
        that.dataTime(date, newYear, newMonth, months);
        //根据得到今月的最后一天日期遍历 得到所有日期
        for (var i = 1; i < this.data.lastDay + 1; i++) {
          that.data.arr.push(i);
        }
        var res = wx.getSystemInfoSync();
        var sysW = null;
        if (res.system.substring(0, 3) == "iOS") {
          sysW = res.windowHeight;
        } else {
          sysW = res.screenHeight;
        }
        that.setData({
          sysW: sysW / 12,//根据屏幕宽度变化自动设置宽度
          marLet: that.data.firstDay,
          arr: that.data.arr,
          year: that.data.year,
          getDate: day,  //当天日期
          month: that.data.month,
          date: date
        });
      }
      setTimeout(function(){
        that.data.slidFlag = true;
      },500)
    }    
  },

  mytouchend:function(e){
    this.data.currentGesture = 0;
  },

  bindtap:function(e){
    var that = this;
    var idx = e.target.dataset.idx;
    if(idx!=null){
      var date = new Date();
      var year = that.data.year;
      var months = that.data.month;
      var day = idx + 1;
      var currentdate = year + "-" + months + "-" + day;
      var currentnum = idx+1;
      this.setData({
        getDate: currentnum,
        date: currentdate
      })
      //获取点击日期的打卡记录
      that.getdayrecordInfo(year, months, currentnum);
      if (that.data.dayrecordInfo.punchDateNum == currentnum && that.data.month == months){
        var recordInfo = that.data.dayrecordInfo;
        that.setData({
          dayrecordInfo: recordInfo
        })
        console.log(that.data)
      }else{
        that.setData({
          dayrecordInfo: ""
        })
      }
    }
  },

  getdayrecordInfo:function(year,months,date){
    var that = this;
    wx.hideLoading();
    var url = util.requestService("/api/hrkq/punchCardDate");
    var postdata = {
      punchDate: year+"-"+months+"-"+date,
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption")
    }
    function success(res){
      console.log(res)
      if(res.data.code == 200){
        that.setData({
            dayrecordInfo: res.data
          })
      } else if (res.data.code == 99) {
        util.redirect(res.data.message);            
      }else{
        wx.showToast({
          title: res.data.message,
          icon: "none",
          duration:2000
        })
      }
    }
    util.checkEncryption(url, postdata, success);
  },

  getrecords: function (year, months,date){
    var that = this;
    var url = util.requestService("/api/hrkq/punchCardMonth");
    var postdata = {
      punchMonth: year +"-"+ months,
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption")
    }
    function success(res){
      console.log(res)
      wx.hideLoading();
      if(res.data.code == 200){
        that.setData({
          records: res.data
        })
        that.getdayrecordInfo(year, months, day);
      } else if (res.data.code == 99) {
        util.redirect(res.data.message);
      }else{
        wx.showToast({
          title: res.data.message,
          icon:"none",
          duration: 2000
        })
      }
    }
    util.checkEncryption(url, postdata, success);
    // that.checkEncryption(url, postdata, success);
    // util.getPostRequest(url, postdata,success);
  },
  //获取日历相关参数
  dataTime: function (date, year, month, months) {
    //获取现今年份
    this.data.year = year;

    //获取现今月份
    this.data.month = months;

    //获取今日日期
    this.data.getDate = date.getDate();

    //最后一天是几号
    var d = new Date(year, months, 0);
    this.data.lastDay = d.getDate();

    //第一天星期几
    let firstDay = new Date(year, month, 1);
    this.data.firstDay = firstDay.getDay();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    })
    var date = new Date();
    var year = date.getFullYear();  //获取当前年份
    var month = date.getMonth();    //获取上个月份
    var months = date.getMonth() + 1;  // 获取当前月份
    var day = date.getDate();
    this.dataTime(date, year, month, months);
   
    //向服务器获取records信息和dayrecordInfo信息
    that.getrecords(year, months, day);

    //根据得到今月的最后一天日期遍历 得到所有日期
    for (var i = 1; i < this.data.lastDay + 1; i++) {
      this.data.arr.push(i);
    }
    var res = wx.getSystemInfoSync();   //获取系统信息同步接口
    console.log(res);
    var date = new Date();
    var sysW = null;
    //根据手机类型获取相应屏幕宽度
    if (res.system.substring(0,3)=="iOS"){
      sysW = res.windowHeight;
    }else{
      sysW = res.screenHeight;
      // sysW = res.windowHeight
    }
    this.setData({
      sysW: sysW / 12,  //根据屏幕宽度变化自动设置宽度
      scHeight: res.screenHeight,
      marLet: this.data.firstDay,
      arr: this.data.arr,
      year: this.data.year,
      getDate: this.data.getDate,
      month: this.data.month,
      date: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      norecord:"无打卡记录"
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      starPoint: [0, 0],  //初始化touchstart坐标
      arr: [],  //定义日期数组
      sysW: null,
      lastDay: null,
      firstDay: null,
      weekArr: ['日', '一', '二', '三', '四', '五', '六'],
      year: "",
      records: "",
      date: "",
      norecord: "",
      dayrecordInfo: "",
      slidFlag: true
    })
    this.onLoad();
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
      title: '考勤打卡',
      desc: "考勤打卡",
      path: 'pages/record/record',
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
