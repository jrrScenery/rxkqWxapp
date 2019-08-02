var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    attendancedetail: ""
  },

  recallInfo:function(e){
    console.log(e);
    let that = this;
    let loatype = e.currentTarget.dataset.loatype;
    let id = e.currentTarget.dataset.id;
    let processId = this.data.processId;
    let url = util.requestService("/api/hrkq/withdrawProcess");
    let postData={
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption"),
      attnId: id,
      loaType: loatype,
      processId: processId
    }
    console.log(postData);
    function success(res){
      console.log(res);
      if(res.data.code==200){
        wx.showToast({
          title: '已撤回',
          icon: 'success',
          duration: 2000
        })
        that.getAttenDetail();
      }
    }
    util.checkEncryption(url, postData, success);
  },
  getAttenDetail:function(){
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    var processStatus = util.getType().processStatus;
    var leaveType = util.getType().leaveType;
    var id = this.data.processId;
    var url = util.requestService("/api/hrkq/queryAttnDetail");
    var postdata = {
      id: id,
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption"),
    }
    function success(res) {
      console.log(res);
      wx.hideLoading();
      if (res.data.code == 200) {
        wx.setNavigationBarTitle({
          title: '考勤详情-' + res.data.submitor,
        })
        that.setData({
          attendancedetail: res.data,
          processStatus: processStatus,
          leaveType: leaveType        
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options:", options);
    if (options.loaType){
      this.setData({
        loaType: options.loaType
      })
    }
    this.setData({
      processId:options.id
    })
    this.getAttenDetail();
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