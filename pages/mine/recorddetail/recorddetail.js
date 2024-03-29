// pages/mine/recorddetail/recorddetail.js
var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
  },
  navToPage: function (event){
    var that = this;
    let route = event.currentTarget.dataset.route;
    var id = event.currentTarget.id;
    var selectInfo = {};
    selectInfo.sortId = id;
    wx.navigateTo({
      url: route + "?selectInfo=" + JSON.stringify(selectInfo)
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    // var proInfo = util.prjInfo().prjInfoList;
    var postdata={
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption")
    };
    var url = util.requestService("/api/hrkq/queryLeadPrjList");
    function success(res){
      wx.hideLoading();
      console.log(res);
      if (res.data.code == 200) {
        that.setData({
          proInfo:res.data.data
        })
        console.log(that.data);
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
    util.checkEncryption(url, postdata, success);
    // console.log(proInfo);
    // this.setData({
    //   proInfo:proInfo
    // })
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