// pages/mine/attendancehistory/attendancehistory.js
var util = require('../../../utils/util.js'); 
// var start = new Date(new Date().getFullYear() + "-1-31");
// var beginDate = util.formatTime(start).substring(0, 7);
// var current = new Date(new Date().getFullYear() + "-" + new Date().getMonth()+"-"+ new Date().getDate());
// var curDate = current.getFullYear() + "-" + (current.getMonth() + 1)
if (new Date().getMonth()>0){
  var beginDate = new Date().getFullYear()+"-1";
  var curDate = new Date().getFullYear() + "-" + (new Date().getMonth()+1);
}else{
  var beginDate = (new Date().getFullYear()-1) + "-1";
  var curDate = (new Date().getFullYear()-1) + "-12";
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // selectDate: curDate,
    // isShow: true,
    // iswholeMonth: false,
    // wholeMonth:"1",
    // beginDate: beginDate,
    // endDate: curDate
  },
  
  navToPage: function (event) {
    console.log(event);
    var that = this;
    let route = event.currentTarget.dataset.route;
    console.log(route)
    var id = event.currentTarget.id;
    var selectInfo = {};
    selectInfo.sortId = id;
    wx.navigateTo({
      url: route + "?selectInfo=" + JSON.stringify(selectInfo)
    })
  },

  dateChange:function(e){
    console.log(e)
    var curdate = e.detail.value.split("-");
    console.log(curdate)
    var year = curdate[0];
    var month = "";
    console.log(curdate[1] < "1")
    if (curdate[1]<"1"){
      month = curdate[1].substring(1,2)
    }else{
      month = curdate[1]
    }
    // var date = new Date(e.detail.value.replace(/\-/g, '/'));
    // var curdate = date.getFullYear()+"-"+(date.getMonth()+1);
    this.setData({
      selectDate: year + "-" + month,
      wholeMonth:"1",
      iswholeMonth: false
    })

    this.getQueryAttn((year + "-" + month), this.data.wholeMonth);
  },

  iswholeMonthBindtap:function(e){
    console.log(e);
    var that = this;
    if (e.target.id == "wholeMonth") {
      that.setData({
        iswholeMonth: true,
        wholeMonth:"0"
      })
      that.getQueryAttn(that.data.selectDate,that.data.wholeMonth);
    } else {
      that.setData({
        iswholeMonth: false,
        wholeMonth: "1"
      })
      that.getQueryAttn(that.data.selectDate, that.data.wholeMonth);
    }
  },

  modalinput: function (e) {
    var idx = e.target.dataset.current;
    if (this.data.leavereason[idx] != "") {
      this.data.hiddenmodalput[idx] = !this.data.hiddenmodalput[idx];
      this.setData({
        hiddenmodalput: this.data.hiddenmodalput
      })
    }
  },

  //确认  
  confirm: function (e) {
    console.log(e)
    console.log(this.data)
    var idx = e.target.dataset.current;
    this.data.hiddenmodalput[idx] = !this.data.hiddenmodalput[idx];
    this.setData({
      hiddenmodalput: this.data.hiddenmodalput
    });
  },

  getQueryAttn: function (date, wholeMonth){
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    var processStatus = util.getType().processStatus;
    var leaveType = util.getType().leaveType;
    var postdata = {
      attnMonth: date,
      wholeMonth: wholeMonth,//是否全月，0：是；1：不是
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption"),
      isHistory: "0", //0历史，1不是
      userName:that.data.userName
    }
    console.log(postdata)
    var url = util.requestService("/api/hrkq/queryAttn");
    function success(res){
      console.log(res);
      wx.hideLoading();
      if(res.data.code == 200){    
        var leavereason = [];  //定义请假原因下标数组
        var hiddenmodalput = [];//原因弹框显示标识
        for (var i = 0; i < res.data.attnInfo.length; i++) {
          if (res.data.attnInfo[i].reason != null) {
            leavereason[i] = res.data.attnInfo[i].reason;
          } else {
            leavereason[i] = "";
          }
          hiddenmodalput[i] = true  //原因弹框显示标识
        }
        that.setData({
          dataInfo: res.data.attnInfo,
          collectInfo:res.data.collectInfo,
          roleMapList: wx.getStorageSync("loginData").roleMapList,
          leavereason: leavereason,
          hiddenmodalput: hiddenmodalput,
          leaveType: leaveType,
          processStatus: processStatus
        })
        console.log(that.data)
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
    wx.getStorage({
      key: 'loginData',
      success: function (res) {
        console.log(res);
        that.setData({
          applyUser: res.data.staffName,
          userName: res.data.topUser
        })
      },
    })
    that.setData({
      selectDate: curDate,
      isShow: true,
      iswholeMonth: false,
      wholeMonth: "1",
      beginDate: beginDate,
      endDate: curDate
    })
    //wholeMonth: "1",//是否全月，0：是；1：不是
    this.getQueryAttn(this.data.selectDate, this.data.wholeMonth);
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