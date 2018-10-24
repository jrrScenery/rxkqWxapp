var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: { 
    // submitaudit:""
  }, 

  checkaudit: function (event) {
    console.log(event);
    util.navigateTo(event);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    var url = util.requestService("/api/hrkq/todoAudit");
    var postdata = {
         topEmpId: wx.getStorageSync("topEmpId"),
         encryption: wx.getStorageSync("encryption"),
         processType:1
    }
    var loaType = util.getType().loaType;
    var leaveType = util.getType().leaveType;
    var relaxation = util.getType().relaxation;
    var processStatus = util.getType().processStatus
    function success(res) {
      console.log(res);
      wx.hideLoading();
      if (res.data.code == 200) {
        that.setData({
          // submitaudit: res.data.auditInfo,
          combineInfos: res.data.combineInfos,
          singleInfos: res.data.singleInfos,
          loaType: loaType,
          leaveType: leaveType,
          relaxation: relaxation,
          processStatus: processStatus
        })
      } else if (res.data.code == 99) {
        util.mineRedirect(res.data.message);
      }else{
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