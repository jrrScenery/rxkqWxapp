// pages/mine/punchMonthdetail/punchMonthdetail.js
var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  searchBindInput: function (e) {
    var searchInfo = e.detail.value;//input框中的查询值
    if (searchInfo) {
      this.setData({
        searchInfo: searchInfo
      })
    } else {
      this.setData({
        searchInfo: ''
      })
    }
  },
  //监听搜索按钮点击事件
  searchBindTap: function (e) {
    // this.getStaffjq();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var leavedata = util.getpunchMonthdetail().personDetail;
    this.setData({
      leavedata: leavedata
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