var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curtime: new Date().getFullYear() + "年" + (new Date().getMonth() + 1) + "月",
    curFlag:true,
    abled:true
  },
  //页面跳转，跳转到上月加班页面
  navToPage: function (e) {
    var that = this;
    if (that.data.curFlag){
      that.setData({
        curtime: new Date().getFullYear() + "年" + new Date().getMonth() + "月",
        curFlag:false
      })
      that.queryLeaveMonth();
    }else{
      that.setData({
        curtime: new Date().getFullYear() + "年" + (new Date().getMonth()+1) + "月",
        curFlag: true
      })
      that.queryLeaveMonth();
    }
  },

  modalinput: function (e) {
    var idx = e.target.dataset.current;
    if (this.data.askInfo[idx].processStatus == 1 || this.data.askInfo[idx].processStatus == 2) {
      if (this.data.reason[idx] != "") {
        this.data.hiddenmodalput[idx] = !this.data.hiddenmodalput[idx];
        this.setData({
          hiddenmodalput: this.data.hiddenmodalput
        })
      }
    }
    if (this.data.askInfo[idx].processStatus == 0 || this.data.askInfo[idx].processStatus == 3) {
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
  // getperextra:function(event){
  //   let route = event.currentTarget.dataset.route;
  //   let sortId = event.currentTarget.id;
  //   wx.navigateTo({
  //     url: route + "?sortId=" + sortId
  //   })
  // },

  //加班原因多行文本框事件
  textareabindblur: function (e) {
    var current = e.target.dataset.current;
    this.data.reason[current] = e.detail.value;
    this.setData({
      reason: this.data.reason
    })
  },
  formSubmit: function (e) {
    var that = this;
    var url = util.requestService("/api/hrkq/submitLeaveMonth");
    var postdata = {};
    var postdataInfo = [];
    var k = 0;
    var processStatusFlag = false;
    for (var i = 0; i < that.data.askInfo.length; i++) {
      if (that.data.askInfo[i].processStatus == '0' || that.data.askInfo[i].processStatus=='3'){
        processStatusFlag = true;
      }
      var dataInfo = {};   
          dataInfo.processStatus = that.data.askInfo[i].processStatus;
      if (!that.data.reason[i]) {
        dataInfo.reason = "";
      } else {
        dataInfo.reason = that.data.reason[i];
      }
      dataInfo.id = that.data.askInfo[i].id;
      postdataInfo[k++] = dataInfo;
    }
    postdata.dataInfo = postdataInfo;
    postdata.topEmpId = wx.getStorageSync("topEmpId");
    postdata.encryption = wx.getStorageSync("encryption");

    function success(res) {
      console.log(res);
      if (res.data.code == 200) {
        wx.showToast({
          title: '提交成功',
          icon: "success",
          duration: 2000
        })
        for (var i = 0; i < that.data.askInfo.length; i++) {
          if (that.data.askInfo[i].processStatus != 2) {
            that.data.askInfo[i].processStatus = 1;
          }
        }
        that.setData({
          askInfo: that.data.askInfo,
          submitflag: true
        })
        var opMapList = res.data.opMapList;
        var templateId = "jM80gLFgx0ux1dbmopkRMwmejshNR4Dwf89IFDgZfQI"
        //流程待办提醒
        for (var i = 0; i < opMapList.length; i++) {
          util.getSendTemplateData(opMapList[i].openId, opMapList[i].processId, templateId, "批量加班", "批量加班", that.data.staffName);
        }
      } else if (res.data.code == 99){
        util.mineRedirect(res.data.message);
      } else {
        wx.showToast({
          title: res.data.message,
          icon: "none",
          duration: 2000
        })
      }
    }

    if (processStatusFlag) {
      wx.showModal({
        title: '提示',
        content: '确认提交批量加班吗？',
        success: function (res) {
          if (res.confirm) {
            util.checkEncryption(url, postdata, success);
          } else if (res.cancel) {
            console.log("取消");
          }
        }
      })
    } else {
      wx.showToast({
        title: '已提交状态，不可重复提交',
        icon: "none",
        duration: 2000
      })
    }
  },

  modifyLeaveDetail: function (transdata){
    console.log(transdata);
    var that = this;
    var processStatus = util.getType().processStatus;
    var transdata = JSON.parse(transdata);
    if (transdata.leaveMonth == new Date().getFullYear()+"-"+(new Date().getMonth() + 1)){
      that.setData({
        curtime: new Date().getFullYear() + "年" + (new Date().getMonth()+1) + "月",
        abled:false
      })
    }else{
      that.setData({
        curtime: new Date().getFullYear() + "年" + new Date().getMonth() + "月",
        abled: false
      })
    }
    var url = util.requestService("/api/hrkq/queryLeaveDetail");
    var postdata = {
      processId: transdata.id,
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption")
    }
    console.log(postdata);
    function success(res) {
      console.log(res);
      wx.hideLoading();
      if (res.data.code == 200) {
        var reason = [];  //定义请假原因下标数组
        var hiddenmodalput = [];//原因弹框显示标识
        for (var i = 0; i < res.data.askInfoDetail.length; i++) {
          reason[i] = res.data.askInfoDetail[i].reason;
          hiddenmodalput[i] = true;  //原因弹框显示标识
        }
        that.setData({
          processId: transdata.id,
          askInfo: res.data.askInfoDetail,
          reason: reason,
          hiddenmodalput: hiddenmodalput,
          processStatus: processStatus,
          submitflag: false
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

  queryLeaveMonth:function(){
    var that = this;
    var processStatus = util.getType().processStatus;
    var year = new Date().getFullYear();
    var month = null;
    if(that.data.curFlag){
      month = new Date().getMonth() + 1;
    }else{
      month = new Date().getMonth()
    }
    var leaveMonth = year + "-" + month;//请求服务器年月份
    var curData = {
      leaveMonth: leaveMonth,
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption")
    }
    var url = util.requestService("/api/hrkq/queryLeaveMonth");
    function success(res) {
      console.log(res);
      wx.hideLoading();
      if (res.data.code == 200) {
        var reason = [];  //定义请假原因下标数组
        var hiddenmodalput = [];//原因弹框显示标识
        for (var i = 0; i < res.data.askInfo.length; i++) {
          reason[i] = res.data.askInfo[i].reason;
          hiddenmodalput[i] = true;  //原因弹框显示标识
        }
        that.setData({
          askInfo: res.data.askInfo,
          reason: reason,
          hiddenmodalput: hiddenmodalput,
          processStatus: processStatus,
          submitflag: false
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
    console.log(that.data);
    util.checkEncryption(url, curData, success);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var that = this;
    wx.showLoading({
      title: '加载中'
    })
    that.setData({
      staffName: wx.getStorageSync("loginData").staffName
    })
    if (options.transdata) {//处理考勤页面点击驳回修改按钮传递过来的驳回数据
      that.modifyLeaveDetail(options.transdata);
      // var url = util.requestService("/api/hrkq/queryLeaveDetail");
      // var postdata = {
      //   processId: options.id,
      //   topEmpId: wx.getStorageSync("topEmpId"),
      //   encryption: wx.getStorageSync("encryption")
      // }
      // console.log(postdata);
      // function success(res){
      //   console.log(res);
      //   wx.hideLoading();
      //   if(res.data.code == 200){
      //     var reason = [];  //定义请假原因下标数组
      //     for (var i = 0; i < res.data.askInfoDetail.length; i++) {
      //       reason[i] = res.data.askInfoDetail[i].reason;
      //     }
      //     that.setData({
      //       processId: options.id,
      //       askInfo: res.data.askInfoDetail,
      //       reason: reason,
      //       processStatus: processStatus,
      //       submitflag: false
      //     })
      //   } else if (res.data.code == 99) {
      //     util.mineRedirect(res.data.message);
      //   } else {
      //     wx.showToast({
      //       title: res.data.message,
      //       icon: "none",
      //       duration: 2000
      //     })
      //   }
      // }
      // util.checkEncryption(url, postdata, success);
    }else{
      that.queryLeaveMonth();
      // var url = util.requestService("/api/hrkq/queryLeaveMonth");
      // console.log(curData);
      // function success(res) {
      //   console.log(res);
      //   wx.hideLoading();
      //   if(res.data.code == 200){
      //     var reason = [];  //定义请假原因下标数组
      //     for (var i = 0; i < res.data.askInfo.length; i++) {
      //       reason[i] = res.data.askInfo[i].reason;
      //     }
      //     that.setData({
      //       askInfo: res.data.askInfo,
      //       reason: reason,
      //       processStatus: processStatus,
      //       submitflag: false
      //     })
      //   } else if (res.data.code == 99) {
      //     util.mineRedirect(res.data.message);
      //   } else {
      //     wx.showToast({
      //       title: res.data.message,
      //       icon: "none",
      //       duration: 2000
      //     })
      //   }
      // }
      // util.checkEncryption(url, curData, success);
    }

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