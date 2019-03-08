// pages/mine/staffnj/staffnj.js
var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */ 
  data: {

  },
  //监听搜索输入框值输入
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
    var that = this;
    that.getStaffjq();
  },
  getStaffjq:function(){
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    var url = util.requestService("/api/hrkq/queryApplyUser");
    var postdata = {
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption"),
      applyType:2
    }
    var conditions = {};
    if (that.data.searchInfo) {
      conditions.name = that.data.searchInfo;
    }   
    postdata.conditions = conditions;
    console.log(postdata);
    function success(res){
      console.log(res);
      wx.hideLoading();
      if(res.data.code==200){
        that.setData({
          leavedata: res.data.data
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
    that.getStaffjq();
    // var leavedata = util.getStaffjq().jqdata;
    // console.log(leavedata);
    // this.setData({
    //   leavedata: leavedata
    // })
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