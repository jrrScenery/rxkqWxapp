var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index:0
  },

  checkaudit: function (event) {
    util.navigateTo(event);
    // let route = event.currentTarget.dataset.route;
    // var id = event.currentTarget.dataset.current;
    // wx.navigateTo({
    //   url: route + "?id=" + id
    // })
  },

  modifyaudit:function(event){
    console.log(event);
    let route = event.currentTarget.dataset.route;
    var idx = event.currentTarget.dataset.current;
    var value = this.data.auditInfo[idx];
    var attnMonth = value.attnMonth;
    var year = new Date().getFullYear();
    var month = new Date().getMonth()+1;
    var date = year + "-" + month;
    if (value.loaType != 2 && value.loaType != 4){
      var transdata = {};
        transdata.id = value.id;
        transdata.selectedIndex = value.leaveType;
        transdata.selectBeginDate = value.beginDate;
        transdata.selectEndDate = value.endDate;
        transdata.beginTime = value.beginTime;
        transdata.endTime = value.endTime;
        if (value.loaType == 0){
          transdata.addrId = value.addrId;
        }
        if (value.loaType == 1){
          transdata.applyUser = value.applyUser;
          transdata.sortId = 'applyUser'
        }
        if (value.loaType == 3){
          transdata.applyUser = value.applyUser;
          transdata.sortId = 'bpg';
          transdata.addrId = value.addrId;
        }
        transdata.reason = value.reason;
        wx.navigateTo({
        url: route + "?transdata=" + JSON.stringify(transdata)
      })
    }else{
      if (value.loaType == 2){
        if (value.attnMonth == date){
          wx.navigateTo({
            url: "../myattendance/myattendance?id=" + value.id
          })
        } else{
          wx.navigateTo({
            url: "../lsmyattendance/lsmyattendance?id=" + value.id
          })
        }
      }else{
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
  formSubmit:function(e){
    var that = this;
    var idx = e.detail.target.dataset.current;
    var url = util.requestService("/api/hrkq/auditProcess");
    var postdata = {};
    postdata.id = this.data.auditInfo[idx].id;
    postdata.topEmpId = wx.getStorageSync("topEmpId");
    postdata.encryption = wx.getStorageSync("encryption");
    if (e.detail.target.id=='ok'){
      postdata.auditType = 0;
    }else{
      postdata.auditType = 1;
    }
    postdata.loaType = that.data.auditInfo[idx].loaType;

    var options = {
      id:''
    };
    console.log(that.data.auditInfo);
    for (var i = 0; i < that.data.auditInfo.length;i++){
      console.log(idx)
      if (i != idx){
        console.log(i)
        options.id += that.data.auditInfo[i].id+","
      }
    }
    function success(res){
      if (res.data.code == 200){
        wx.showToast({
          title: '审批完成',
          icon:'success',
          duration:2000
        })
        console.log(options);
        if (options.id==""){
          wx.navigateBack({
            url: "../mybatchaudit/mybatchaudit"
          })
        }else{
          that.todoAuditInfo(options);
        }
      } else if (res.data.code == 99) {
        util.mineRedirect(res.data.message);
      }else{
        wx.showToast({
          title: res.data.message,
          icon: "none",
          duration:2000
        })
      }
    }
    if (this.data.auditInfo[idx].processStatus == 1 || this.data.auditInfo[idx].processStatus != 3){//审批状态不为修改
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
      // util.checkEncryption(url, postdata, success);
    }
  },

  todoAuditInfo: function (options){
    console.log(options);
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    var loaType = util.getType().loaType;
    var leaveType = util.getType().leaveType;
    var relaxation = util.getType().relaxation;
    var processStatus = util.getType().processStatus;
    var url = util.requestService("/api/hrkq/individualAudit");
    var postdata = {
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption"),
      processType: 0,
      processIds: options.id
    }
    function success(res) {
      console.log(res);
      wx.hideLoading();
      if (res.data.code == 200) {
        that.setData({
          auditInfo: res.data.auditinfos,
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
  onLoad: function (options) {
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