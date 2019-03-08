// pages/mine/attendance.js
var util = require('../../../utils/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    todoNum:0
  },

  navToPage(event) {
    // console.log(event);
    let route = event.currentTarget.dataset.route;
    let sortId = event.currentTarget.id;
    wx.navigateTo({
      url: route + "?sortId=" + sortId
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getStorage({
      key: 'loginData',
      success: function(res) {
        // console.log(res);
        that.setData({
          staffName: res.data.staffName,
          topUser: res.data.topUser,
          roleMapList: res.data.roleMapList,
          businessType: res.data.businessType
        })
      },
    })
    var url = util.requestService("/api/hrkq/queryNum");

    var postdata={
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption")
    }
    function success(res){
      if(res.data.code == 200){
        that.setData({
          todoNum: res.data.todoNum
        })
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
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
  onShareAppMessage: function (res) {
    return {
      title: '打卡',
      desc: "打卡",
      path: 'pages/mine/attendance/attendance',
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