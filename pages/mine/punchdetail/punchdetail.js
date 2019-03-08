// pages/mine/punchdetail/punchdetail.js
var util = require('../../../utils/util.js');
// var nowDate = new Date();
// if (new Date().getMonth() > 0) {
//   var beginDate = util.formatTime(new Date((new Date().getFullYear() + "-1-1").replace(/\-/g, '/'))).substring(0, 10);
//   var perDate = util.formatTime(new Date(nowDate.getTime() - 24 * 60 * 60 * 1000)).substring(0, 10);
//   // var curDate = new Date().getFullYear() + "-" + (new Date().getMonth() + 1)+"-"+new Date().getDate();
// } else {
//   var beginDate = util.formatTime(new Date(((new Date().getFullYear() - 1) + "-1-1").replace(/\-/g, '/'))).substring(0, 10);
//   var perDate = util.formatTime(new Date(((new Date().getFullYear() - 1) + "-12-" + new Date().getDate()).replace(/\-/g, '/'))).substring(0, 10);
// }
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
  },
  navToPage: function (event) {
    console.log(event);
    var that = this;
    let route = event.currentTarget.dataset.route;
    var id = event.currentTarget.id;
    var selectInfo = {};
    selectInfo.sortId = id;
    wx.navigateTo({
      url: route + "?selectInfo=" + JSON.stringify(selectInfo)
    })
  },
  dateChange:function(e){
    console.log(e);
    this.setData({
      selectDate: e.detail.value
    })
  },
  monthChange:function(e){
    console.log(e);
    this.setData({
      selectMonth: e.detail.value
    })
  },
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current })
  },
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({ currentTab: e.target.dataset.current })
    }
  },
  //获取当前时间前后N天前后日期的方法
  GetMonthStr: function (AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1);//获取当前月份的日期，不足10补0
    return y + "-" + m;
  },
  GetDateStr: function (AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1);//获取当前月份的日期，不足10补0
    var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();//获取当前几号，不足10补0
    return y + "-" + m + "-" + d;
  },
  getdaydetail: function (selectDate){
    var that = this;
    wx.showLoading({
      title: '加载中',selectDate 
    })
    var url = util.requestService("/api/hrkq/");
    var postdata = {
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption"),
      selectDate: selectDate
    }
    function success(res){
      wx.hideLoading();
      if (res.data.code == 200) {

      } else if (res.data.code == 99) {
        util.mineRedirect(res.data.message);
      } else {
        wx.showToast({
          title: res.data.message,
          icon: "none",
          duration: 2000
        })
      }    
    }
    util.checkEncryption(url, postdata, success);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var getpunchdetail = util.getpunchdetail().daypunchdetail;
    console.log(getpunchdetail);
    var beginDate = this.GetDateStr(-90);
    var perDate = this.GetDateStr(-1);
    var beginMonth = this.GetMonthStr(-90);
    var curMonth = util.formatTime(new Date()).substring(0, 7);
    that.setData({
      getpunchdetail: getpunchdetail,
      selectDate: perDate,
      beginDate: beginDate,
      endDate: perDate,
      beginMonth: beginMonth,
      curMonth: curMonth,
      selectMonth: curMonth
    })
    that.getdaydetail(that.data.selectDate);
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})