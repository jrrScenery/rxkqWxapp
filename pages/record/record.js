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
    arr: [],  //定义日期数组
    weekArr: ['日', '一', '二', '三', '四', '五', '六'],
    year:"",
    month:"",
    date: "",
    norecord:"",
    dayrecordInfo:"",
  },

  navToPage: function (event) { 
    console.log("event",event);
    var that = this;
    let route = event.currentTarget.dataset.route;
    console.log(route)
    var id = event.currentTarget.id;
    var selectInfo = {};
    selectInfo.sortId = id;
    selectInfo.date = new Date();
    selectInfo.year = that.data.year;
    selectInfo.month = that.data.month;
    wx.navigateTo({
      url: route + "?selectInfo=" + JSON.stringify(selectInfo)
    })
  },

  // 切换控制年月，上一个月，下一个月
  handleCalendar: function (e) {
    const handle = e.currentTarget.dataset.handle;
    const cur_year = this.data.year;
    const cur_month = this.data.month;
    if (handle === 'prev') {
      let newMonth = cur_month - 1;
      let newYear = cur_year;
      if (newMonth < 1) {
        newYear = cur_year - 1;
        newMonth = 12;
      }
      this.calculateEmptyGrids(newYear, newMonth);
      this.calculateDays(newYear, newMonth);
      this.getrecords(newYear, newMonth, day);
      this.setData({
        year: newYear,
        month: newMonth,
        getDate: day
      })
    } else {
      let newMonth = cur_month + 1;
      let newYear = cur_year;
      if (newMonth > 12) {
        newYear = cur_year + 1;
        newMonth = 1;
      }
      this.calculateEmptyGrids(newYear, newMonth);
      this.calculateDays(newYear, newMonth);
      this.getrecords(newYear, newMonth, day);
      this.setData({
        year: newYear,
        month: newMonth,
        getDate: day
      })
    }
  },

  bindtap:function(e){
    console.log(e);
    var that = this;
    var idx = e.currentTarget.dataset.idx;
    if(idx!=null){
      var date = new Date();
      var year = that.data.year;
      var months = that.data.month;
      var day = idx;
      var currentdate = year + "-" + months + "-" + day;
      var currentnum = idx;
      for(let i=0;i<that.data.arr.length;i++){
        if (that.data.arr[i].date == idx){
          that.data.arr[i].clickFlag = true;
        }
      }
      this.setData({
        getDate: currentnum,
        date: currentdate,
        arr: that.data.arr
      })
      console.log("arr",that.data);
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
      encryption: wx.getStorageSync("encryption"),
      userName: that.data.userName
    }
    console.log("getdayrecordInfo",postdata);
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
    console.log("getrecords",this.data);
    var that = this;
    var url = util.requestService("/api/hrkq/punchCardMonth");
    var userName = that.data.userName;
    var postdata = {
      punchMonth: year +"-"+ months,
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption"),
      userName: userName
    }
    
    console.log("getrecords",postdata);
    function success(res){
      console.log(res)
      wx.hideLoading();
      if(res.data.code == 200){
        let newArr = that.data.arr;
        for(let i=0;i<that.data.arr.length;i++){
          for(let j=0;j<res.data.records.length;j++){
            if (that.data.arr[i].date == res.data.records[j].punchDateNum){
              newArr[i].isSign = true;
            }
          }
          if (that.data.arr[i].date == day){
            newArr[i].clickFlag = true;
          }else{
            newArr[i].clickFlag = false;
          }
        }
        that.setData({
          records: res.data,
          arr: newArr,
          getDate: day,
          // userName: userName
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
  },

  getInfo: function (date, year, months){
    var that = this;
    // var date = new Date();
    // var year = date.getFullYear();  //获取当前年份
    // var month = date.getMonth();    //获取上个月份
    // var months = date.getMonth() + 1;  // 获取当前月份
    this.calculateEmptyGrids(year, months);
    this.calculateDays(year, months);

    //向服务器获取records信息和dayrecoapplyUserrdInfo信息
    that.getrecords(year, months, day);
  },

  // 获取当月共多少天
  getThisMonthDays: function (year, month) {
    return new Date(year, month, 0).getDate()
  },

  // 获取当月第一天星期几
  getFirstDayOfWeek: function (year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).getDay();
  },

  // 计算当月1号前空了几个格子，把它填充在days数组的前面
  calculateEmptyGrids: function (year, month) {
    var that = this;
    //计算每个月时要清零
    that.setData({ arr: [] });
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        var obj = {
          date: null,
          isSign: false
        }
        that.data.arr.push(obj);
      }
      this.setData({
        arr: that.data.arr
      });
      console.log("data",this.data);
      //清空
    } else {
      this.setData({
        days: []
      });
    }
  },

  // 绘制当月天数占的格子，并把它放到days数组中
  calculateDays: function (year, month) {
    var that = this;
    const thisMonthDays = this.getThisMonthDays(year, month);
    for (let i = 1; i <= thisMonthDays; i++) {
      var obj = {
        date: i,
        isSign: false
      }
      that.data.arr.push(obj);
    }
    this.setData({
      arr: that.data.arr
    });
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
    // var month = date.getMonth();    //获取上个月份
    var months = date.getMonth() + 1;  // 获取当前月份
    // this.calculateEmptyGrids(year, months);
    // this.calculateDays(year, months);
   
    // //向服务器获取records信息和dayrecoapplyUserrdInfo信息
    // that.getrecords(year, months, day);  
    wx.getStorage({
      key: 'loginData',
      success: function (res) {
        console.log("loginData",res);
        that.setData({
          applyUser: res.data.staffName,
          userName: res.data.topUser,
          roleMapList: res.data.roleMapList
        })
        that.getInfo(date,year,months);
      },
    })
    this.setData({
      arr: this.data.arr,
      weekArr: ['日', '一', '二', '三', '四', '五', '六'],
      year: year,
      getDate: date.getDate(),
      month: months,
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
    
    // var that = this
    // var date = new Date();
    // var year = date.getFullYear();  //获取当前年份
    // var months = date.getMonth() + 1;  // 获取当前月份
    // this.setData({
    //   arr: this.data.arr,
    //   weekArr: ['日', '一', '二', '三', '四', '五', '六'],
    //   year: year,
    //   getDate: date.getDate(),
    //   month: months,
    //   date: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    //   norecord: "无打卡记录"
    // });
    // console.log("onShow:", this.data)
    // wx.getStorage({
    //   key: 'loginData',
    //   success: function (res) {
    //     console.log("loginData", res);
    //     that.setData({
    //       applyUser: res.data.staffName,
    //       userName: res.data.topUser,
    //       roleMapList: res.data.roleMapList
    //     })
    //     that.getInfo(date, year, months);
    //   },
    // })
    // this.getInfo(date, year, months);
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
