// pages/mine/selfInfo/selfInfo.js
var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var addressMapList = null;
    var prjMapList = null;
    wx.getStorage({
      key: 'loginData',
      success: function(res) {
        
        that.setData({
          staffName: res.data.staffName,
          topUser: res.data.topUser,
          leadPrjMapList: res.data.leadPrjMapList,
          prjMapList: res.data.prjMapList,
          residueDay: res.data.residueDay,
          restDay: res.data.restDay
        })
      },
    })
    console.log(that.data)
  },

  updateInfo:function(){
    var updateUrl = util.requestService("/api/hrkq/update");
    var update = {
      encryption: wx.getStorageSync("encryption"),
      topEmpId: wx.getStorageSync("topEmpId")
    }
    function success(res) {
      console.log(res);
      wx.hideLoading();
      if (res.data.code == 200) {
        wx.showToast({
          title: '更新成功',
          icon: "success",
          duration: 2000
        })
        wx.setStorage({
          key: 'loginData',
          data: res.data,
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

  removeTap:function(){
    wx.showModal({
      title: '提示',
      content: "确定解除绑定吗？",
      success: function (res) {
        if (res.confirm) {
          wx.clearStorage();
          wx.reLaunch({
            url: '../../login/login',
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })   
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