var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // produceInfo:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    var url = util.requestService("/api/hrkq/queryProcess");
    var postdata = {
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption"),
      id: options.id
    }
    function success(res){
      console.log(res);
      wx.hideLoading();
      if (res.data.code == 200){
        that.setData({
          processInfo: res.data.processInfo
        })
      } else if (res.data.code == 99) {
        util.mineRedirect(res.data.message);
      }else{
        wx.showToast({
          title: res.data.code,
          icon:'none',
          duration:2000
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