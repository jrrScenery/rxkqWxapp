var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    page: 1,
    num: 10,
    auditInfo: null,
    total: 0,
    hasmoreData: true,//更多数据
    hiddenloading: true,//加载中
    abstype: [
      "调休",
      "有偿"
    ],
  },

  change: function (e) {
    console.log(e)
    var idx = e.target.dataset.current;
    this.data.auditInfo[idx].leaveType = e.detail.value
    this.setData({
      auditInfo: this.data.auditInfo
    })
  },
  checkaudit: function (event) {
    util.navigateTo(event);
  },

  allAudit: function (e) {
    console.log(e)
    console.log(this.data)
    var that = this;
    var url = util.requestService("/api/hrkq/auditCombine");
    var postdata = {};
    postdata.ids = "";
    // postdata.ids = that.data.options.id;
    postdata.loaType = that.data.options.loaType;
    var overType = [];
    if (that.data.options.loaType == '1') {
      for (var i = 0; i < that.data.auditInfo.length; i++) {
        var overTypeObj = {};
        overTypeObj.id = that.data.auditInfo[i].id;
        overTypeObj.leaveType = that.data.auditInfo[i].leaveType;
        overType[i] = overTypeObj;
      }
      postdata.overType = overType;
    }
    for (var j = 0; j < that.data.auditInfo.length; j++) {
      postdata.ids += that.data.auditInfo[j].id + ",";
    }
    postdata.topEmpId = wx.getStorageSync("topEmpId");
    postdata.encryption = wx.getStorageSync("encryption");
    if (e.target.id == 'ok') {
      postdata.auditType = 0;
    } else {
      postdata.auditType = 1;
    }
    console.log(postdata)
    function success(res) {
      if (res.data.code == 200) {
        wx.showToast({
          title: '审批完成',
          icon: 'success',
          duration: 2000
        })
        wx.navigateBack({
          url: "../mybatchaudit/mybatchaudit"
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
  modifyaudit: function (event) {
    console.log(event);
    let route = event.currentTarget.dataset.route;
    var idx = event.currentTarget.dataset.current;
    console.log(this.data.auditInfo);
    var value = this.data.auditInfo[idx];
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
        transdata.groupId = value.groupId;
      }
      if (value.loaType == 1) {
        transdata.applyUser = value.applyUser;
        transdata.sortId = 'applyUser';
        transdata.groupId = value.groupId;
      }
      if (value.loaType == 3) {
        transdata.applyUser = value.applyUser;
        transdata.sortId = 'bpg';
        transdata.addrId = value.addrId;
        transdata.groupId = value.groupId;
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
        transdata.attnMonth = value.attnMonth;  //(需加月份)
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
    console.log(that.data)
    var idx = e.detail.target.dataset.current;
    var url = util.requestService("/api/hrkq/auditProcess");
    var postdata = {};
    postdata.id = this.data.auditInfo[idx].id;
    postdata.groupId = this.data.auditInfo[idx].groupId;
    postdata.topEmpId = wx.getStorageSync("topEmpId");
    postdata.encryption = wx.getStorageSync("encryption");
    if (this.data.auditInfo[idx].loaType == '1') {
      postdata.leaveType = this.data.auditInfo[idx].leaveType
    }
    if (e.detail.target.id == 'ok') {
      postdata.auditType = 0;
    } else {
      postdata.auditType = 1;
    }
    postdata.loaType = that.data.auditInfo[idx].loaType;
    console.log(postdata);
    var options = {
      id: '',
      loaType: ''
    };
    options.loaType = that.data.auditInfo[0].loaType;

    console.log(options)
    function success(res) {
      console.log(res)
      if (res.data.code == 200) {
        wx.showToast({
          title: '审批完成',
          icon: 'success',
          duration: 2000
        })
        for (var i = 0; i < that.data.auditInfo.length; i++) {
          if (i != idx) {
            options.id += that.data.auditInfo[i].id + ","
          }
        }
        console.log("221行", options.id);
        if (options.id == "") {
          wx.navigateBack({
            url: "../mybatchaudit/mybatchaudit"
          })
        } else {
          that.setData({
            index: 0,
            page: 1,
            num: 10,
            auditInfo: null,
            total: 0,
            hasmoreData: true,//更多数据
            hiddenloading: true,//加载中
          })
          // console.log(options)
          that.onLoad(options)
          // that.todoAuditInfo(options);
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
    if (this.data.auditInfo[idx].processStatus == 1 || this.data.auditInfo[idx].processStatus != 3) {//审批状态不为修改
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
    }
  },

  todoAuditInfo: function (options) {
    console.log(options)
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    if (that.data.hasmoreData == false) {
        wx.hideLoading();
        that.setData({ hiddenloading: true })
        　　　　return;
    　　}
    var loaType = util.getType().loaType;
    var leaveType = util.getType().leaveType;
    var relaxation = util.getType().relaxation;
    var processStatus = util.getType().processStatus;
    var url = util.requestService("/api/hrkq/individualAudit");
    var postdata = {
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption"),
      processType: 0,
      processIds: options.id,
      page: that.data.page,
      num: that.data.num
    }
    console.log("postdata", postdata)
    function success(res) {
      console.log(res)
      wx.hideLoading();
      if (res.data.code == 200) {
        if (res.data.auditinfos.length != 0) {
          wx.setNavigationBarTitle({
            title: loaType[res.data.auditinfos[0].loaType] + "批量审批",
          })
        }
        var c = new Array();
        if (that.data.auditInfo == null) {
          that.setData({
            auditInfo: res.data.auditinfos
          })
        } else {
          that.setData({
            auditInfo: c.concat(that.data.auditInfo, res.data.auditinfos)
          })
        }
        that.setData({
          // auditInfo: res.data.auditinfos,
          total: res.data.totalNum,
          loaType: loaType,
          leaveType: leaveType,
          relaxation: relaxation,
          processStatus: processStatus,
          page: that.data.page + 1
        })
        console.log(that.data);
        if (that.data.total <= 0 || that.data.num * (that.data.page - 1) >= that.data.total) {
          that.setData({ hasmoreData: false, hiddenloading: true })
        }
        console.log(that.data);
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

    this.todoAuditInfo(options);
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
    // this.todoAuditInfo(options);
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
      auditInfo: null,
      total: 0,
      hasmoreData: true,//更多数据
      hiddenloading: true//加载中
    })
    this.todoAuditInfo(this.data.options);
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
    this.todoAuditInfo(that.data.options);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})