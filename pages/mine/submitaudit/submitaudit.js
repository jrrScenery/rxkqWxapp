var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // submitaudit:""
    page: 1,
    num: 10,
    total: 0,
    singleInfos: null,
    combineInfos: null,
    hasmoreData: true,//更多数据
    hiddenloading: true,//加载中
  },

  checkaudit: function (event) {
    console.log(event);
    util.navigateTo(event);
  },

  todoAudit: function (options) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    if (that.data.hasmoreData == false) {
      wx.hideLoading();
      that.setData({ hiddenloading: true })
      return;
    　　}
    var url = util.requestService("/api/hrkq/todoAudit");
    var postdata = {
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption"),
      processType: 1,
      page: that.data.page,
      num: that.data.num
    }
    var loaType = util.getType().loaType;
    var leaveType = util.getType().leaveType;
    var relaxation = util.getType().relaxation;
    var processStatus = util.getType().processStatus
    function success(res) {
      console.log(res);
      wx.hideLoading();
      if (res.data.code == 200) {
        var c = new Array();
        if (that.data.singleInfos == null || that.data.singleInfos.length == 0) {
          that.setData({
            singleInfos: res.data.singleInfos
          })
        } else {
          that.setData({
            singleInfos: c.concat(that.data.singleInfos, res.data.singleInfos)
          })
        }
        if (that.data.combineInfos == null || that.data.combineInfos.length == 0) {
          that.setData({
            combineInfos: res.data.combineInfos
          })
        } else {
          that.setData({
            combineInfos: c.concat(that.data.combineInfos, res.data.combineInfos)
          })
        }
        that.setData({
          // submitaudit: res.data.auditInfo,
          // combineInfos: res.data.combineInfos,
          // singleInfos: res.data.singleInfos,
          loaType: loaType,
          leaveType: leaveType,
          relaxation: relaxation,
          processStatus: processStatus,
          page: that.data.page + 1,
          // total: res.data.totalNum,
        })
        if (that.data.total <= 0 || that.data.num * (that.data.page - 1) >= that.data.total) {
          that.setData({ hasmoreData: false, hiddenloading: true })
        }
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
    this.setData({
      options: options
    })
    this.todoAudit(options);
    // wx.showLoading({ 
    //   title: '加载中',
    // })
    // var url = util.requestService("/api/hrkq/todoAudit");
    // var postdata = {
    //      topEmpId: wx.getStorageSync("topEmpId"),
    //      encryption: wx.getStorageSync("encryption"),
    //      processType:1
    // }
    // var loaType = util.getType().loaType;
    // var leaveType = util.getType().leaveType;
    // var relaxation = util.getType().relaxation;
    // var processStatus = util.getType().processStatus
    // function success(res) {
    //   console.log(res);
    //   wx.hideLoading();
    //   if (res.data.code == 200) {
    //     that.setData({
    //       // submitaudit: res.data.auditInfo,
    //       combineInfos: res.data.combineInfos,
    //       singleInfos: res.data.singleInfos,
    //       loaType: loaType,
    //       leaveType: leaveType,
    //       relaxation: relaxation,
    //       processStatus: processStatus
    //     })
    //   } else if (res.data.code == 99) {
    //     util.mineRedirect(res.data.message);
    //   }else{
    //     wx.showToast({
    //       title: res.data.message,
    //       icon: "none",
    //       duration: 2000
    //     })
    //   }
    // }
    // util.checkEncryption(url, postdata, success);
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
    wx.showNavigationBarLoading();
    this.setData({
      page: 1,
      total: 0,
      combineInfos: null,
      singleInfos: null,
      hasmoreData: true,//更多数据
      hiddenloading: true//加载中
    })
    this.todoAudit(this.data.options);
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    // 页数+1
    that.setData({
      hiddenloading: false
    })
    this.todoAudit(that.data.options);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})