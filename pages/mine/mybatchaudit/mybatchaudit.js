var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0
  },

  checkaudit: function (event) {
    console.log(event);
    util.navigateTo(event);
  },

  modifyaudit: function (event) {
    console.log(event);
    let route = event.currentTarget.dataset.route;
    var idx = event.currentTarget.dataset.current;
    var value = this.data.singleInfos[idx];
    console.log(value);
    var attnMonth = value.attnMonth;
    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;
    var date = year + "-" + month;
    if (value.loaType != 2 && value.loaType != 4) {
      var transdata = {};
      transdata.id = value.id;
      transdata.selectedIndex = value.leaveType;
      transdata.selectBeginDate = value.beginDate;
      transdata.selectEndDate = value.endDate;
      transdata.beginTime = value.beginTime;
      transdata.endTime = value.endTime;
      if (value.loaType == 0) {
        transdata.addrId = value.addrId;
      }
      if (value.loaType == 1) {
        transdata.addrId = value.addrId;
        transdata.applyUser = value.applyUser;
        transdata.sortId = 'applyUser'
      }
      if (value.loaType == 3) {
        transdata.applyUser = value.applyUser;
        transdata.sortId = 'bpg';
        transdata.addrId = value.addrId;
      }
      transdata.reason = value.reason;
      wx.navigateTo({
        url: route + "?transdata=" + JSON.stringify(transdata)
      })
    } else {
      if (value.loaType == 2) {
        if (value.attnMonth == date) {
          wx.navigateTo({
            url: "../myattendance/myattendance?id=" + value.id
          })
        } else {
          wx.navigateTo({
            url: "../lsmyattendance/lsmyattendance?id=" + value.id
          })
        }
      } else {
        var transdata = {};
        transdata.id = value.id;
        transdata.leaveMonth = value.leaveMonth; //(需加月份)
        // transdata.extraMonth = new Date().getMonth()+1;//(未返回月份，暂时取当月)
        wx.navigateTo({
          url: route + "?transdata=" + JSON.stringify(transdata)
        })
      }
    }
  },

  formSubmit: function (e) {
    console.log(e)
    var that = this;
    var idx = e.detail.target.dataset.current;
    var url = util.requestService("/api/hrkq/auditCombine");
    var postdata = {};
    postdata.ids = this.data.combineInfos[idx].processIds;
    postdata.loaType = this.data.combineInfos[idx].loaType;
    postdata.topEmpId = wx.getStorageSync("topEmpId");
    postdata.encryption = wx.getStorageSync("encryption");
    if (e.detail.target.id == 'ok') {
      postdata.auditType = 0;
    } else {
      postdata.auditType = 1;
    }
    console.log(postdata);
    function success(res) {
      if (res.data.code == 200) {
        wx.showToast({
          title: '审批完成',
          icon: 'success',
          duration: 2000
        })
        that.todoAuditInfo();
        //通知提醒
        var auditType = e.detail.target.id;
        var loaType = util.getType().loaType[that.data.combineInfos[idx].loaType];
        var opMapList = res.data.opMapList;
        var templateId = "m9nESjCzUE9wfiQLcYyST7omnVG05nMRs-qR_rPsfNs"
        if (auditType == 'ok') {//审核通过
          //流程待办提醒
          for (var i = 0; i < opMapList.length; i++) {
            util.getSendTemplateResult(opMapList[i].openId, opMapList[i].processId, templateId, loaType, loaType, auditType);
          }
        }else{
          for (var i = 0; i < opMapList.length; i++) {
            util.getSendTemplateResult(opMapList[i].openId, opMapList[i].processId, templateId, loaType, loaType, auditType);
          }
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
    wx.showModal({
      title: '提示',
      content: '确认提交吗？',
      success: function (res) {
        if (res.confirm) {
          util.checkEncryption(url, postdata, success);
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  todoAuditInfo: function () {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    var loaType = util.getType().loaType;
    var leaveType = util.getType().leaveType;
    var relaxation = util.getType().relaxation;
    var processStatus = util.getType().processStatus;
    var url = util.requestService("/api/hrkq/todoAudit");
    var postdata = {
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption"),
      processType: 0
    }
    function success(res) {
      console.log(res);
      wx.hideLoading();
      if (res.data.code == 200) {
        that.setData({
          combineInfos: res.data.combineInfos,
          singleInfos: res.data.singleInfos,
          loaType: loaType,
          leaveType: leaveType,
          relaxation: relaxation,
          processStatus: processStatus
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
  onLoad: function () {
    this.todoAuditInfo();
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
    this.todoAuditInfo();
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
    this.todoAuditInfo();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
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