var util = require('../../../utils/util.js');
var date = new Date();
var start = new Date(date.getFullYear()+ "-" + date.getMonth() + "-1");
var beginDate = util.formatTime(start).substring(0, 10);
var a = new Date(new Date().getFullYear() + "-12-31");
var enddate = util.formatTime(a).substring(0, 10);
var bpgStart = new Date();
var bpgBeginDate = util.formatTime(date).substring(0, 10);
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:null,
    beginDate: "",
    endDate: "",
    selectBeginDate: "",
    selectEndDate: "",
    beginTime: "09:00",
    endTime: "18:00",
    selectBeginTime: "09:00",
    selectEndTime: "23:59",
    reason: "",
    abstype:[
      "调休",
      "有偿"
    ],
    selectedIndex:0
  },

  navToPage:function(event){
    var that = this;
    console.log(event);
    let route = event.currentTarget.dataset.route;
    var id = event.currentTarget.id;
    var selectInfo = {};
    selectInfo.sortId = id;
    if (id == 'applyUser'){
      selectInfo.selectedIndex = that.data.selectedIndex;
    }else{
      if (that.data.address.length!=0){
        console.log(that.data.address);
        var selectedAddrIndex = that.data.selectedAddrIndex;
        selectInfo.selectedAddrIndex = selectedAddrIndex;
        selectInfo.prjCode = that.data.address[selectedAddrIndex].prjCode;
        selectInfo.prjId = that.data.address[selectedAddrIndex].prjId;
      }
    }
    selectInfo.selectBeginDate = that.data.selectBeginDate;
    selectInfo.selectEndDate = that.data.selectEndDate;
    selectInfo.selectBeginTime = that.data.selectBeginTime;
    selectInfo.selectEndTime = that.data.selectEndTime;
    selectInfo.reason = that.data.reason;
    if (that.data.address.length != 0){
      wx.navigateTo({
        url: route + "?selectInfo=" + JSON.stringify(selectInfo)
      })
    }else{
      wx.showToast({
        title: '没有对应项目地址，不能选择报工人',
        icon:"none"
      },2000)
    }
  },

  beginDateChange: function (e) {
    var date = e.detail.value;
    if (date > this.data.selectEndDate) {
      wx.showToast({
        title: '结束日期小于开始日期',
        icon: "none"
      }, 2000)
    }
    this.setData({
      selectBeginDate: date
    })
  },

  endDatechange: function (e) {
    var date = e.detail.value;
    if (date < this.data.selectBeginDate) {
      wx.showToast({
        title: '结束日期小于开始日期',
        icon: "none"
      }, 2000)
    }
    this.setData({
      selectEndDate: date
    })  
  },

  //开始时间
  beginTimeChange: function (e) {
    var flag = this.data.selectBeginDate == this.data.selectEndDate;
    var currentTime = e.detail.value;
    if (flag && currentTime > this.data.selectEndTime) {
      wx.showToast({
        title: '结束时间小于开始时间',
        icon: "none",
        duration:2000
      })
    }
    this.setData({
      selectBeginTime: currentTime
    })
  },
  //结束时间
  endTimeChange: function (e) {
    var flag = this.data.selectBeginDate == this.data.selectEndDate;
    var currentTime = e.detail.value;
    if (flag && currentTime < this.data.selectBeginTime) {
      wx.showToast({
        title: '结束时间小于开始时间',
        icon: "none",
        duration:2000
      })
    }
    this.setData({
      selectEndTime: currentTime
    })
  },

  change: function (e) {
    this.setData({
      selectedIndex: parseInt(e.detail.value)
    })
  },
  addrChange: function (e) {
    this.setData({
      selectedAddrIndex: parseInt(e.detail.value)
    })
  },
  
  prjCodeChange: function(e) {
    this.setData({
      selectedCodeIndex: parseInt(e.detail.value)
    })
  },
  formSubmit: function (e) {
    console.log(e);
    var that = this;
    var value = e.detail.value;
    console.log(value);
    console.log(that.data.address);
    if (that.data.address.length == 0 && that.data.sortId=='bpg'){
      wx.showToast({
        title: '没有领导项目，不能提交报工申请',
        icon: "none",
        duration: 2000
      })
    }else if (value.beginDate == value.endDate && value.beginTime > value.endTime) {
      wx.showToast({
        title: '结束时间小于开始时间',
        icon: "none",
        duration:2000
      })
    } else if (value.beginDate > value.endDate) {
      wx.showToast({
        title: '结束日期小于开始日期',
        icon: "none",
        duration:2000
      })
    }else if (value.reason == "") {
      wx.showToast({
        title: '请填写事由',
        icon: "none",
        duration:2000
      })
    } else {
      var url = util.requestService("/api/hrkq/askLeave");
      var postdata = value;
      postdata.topEmpId = wx.getStorageSync("topEmpId");
      postdata.encryption = wx.getStorageSync("encryption");
      if (value.address!=null){
        postdata.prjId = that.data.address[value.address].prjId;
        postdata.addrId = that.data.address[value.address].addrId; 
      }
      if (value.prjCode!=null){
        postdata.prjId = that.data.prjCode[value.prjCode].prjId;
      }
      if (that.data.sortId == 'applyUser'){
        postdata.loaType = 1;
      }else{
        postdata.loaType = 3;
        postdata.leaveType = 1;
      }
      if (that.data.id != null){
        postdata.id = that.data.id;
      }
      console.log(postdata);
      function success(res) {
        if(res.data.code == 200){
          wx.showToast({
            title: '提交成功',
            icon:"success",
            duration:2000
          })
          if (that.data.sortId == 'bpg') {
            that.setData({
              id: null,
              beginDate: bpgBeginDate,
              endDate: enddate,
              selectBeginDate: bpgBeginDate,
              selectEndDate: bpgBeginDate,
              selectBeginTime: wx.getStorageSync('ambegintime'),
              selectEndTime: wx.getStorageSync('pmendtime'),
              reason: "",
              selectedIndex: 0
            })
          }else{
            that.setData({
              id: null,
              beginDate: beginDate,
              endDate: enddate,
              selectBeginDate: beginDate,
              selectEndDate: beginDate,
              selectBeginTime: "09:00",
              selectEndTime: "23:59",
              reason: "",
              selectedIndex: 0
            })
          }
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
      wx.showModal({
        title: '提示',
        content: '确认提交申请吗？',
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var that = this;
    var address = [];
    var prjCode = [];
    var k = 0;
    var m = 0;
    var n=0;
    var prjMapList = wx.getStorageSync("loginData").prjMapList;
    
    for (var i = 0; i < prjMapList.length; i++) {
      var prjCodeObj = {};
      var addressList = prjMapList[i].addressMapList;
      for (var j = 0; j < addressList.length; j++) {
        if (options.transdata && options.transdata.sortId=='bpg'){
          if (JSON.parse(options.transdata).addrId == addressList[i].addrId){
            m = k;
          }
        }
      }
      prjCodeObj.prjId = prjMapList[i].prjId;
      prjCodeObj.prjCode = prjMapList[i].prjCode;
      prjCode[i] = prjCodeObj;
    }
    var leadPrjMapList = wx.getStorageSync("loginData").leadPrjMapList;
    console.log(leadPrjMapList);
    for (var i = 0; i < leadPrjMapList.length; i++) {
      var addressList = leadPrjMapList[i].addressMapList;
      for (var j = 0; j < addressList.length; j++) {
        if (options.transdata) {
          if (JSON.parse(options.transdata).addrId == addressList[i].addrId) {
            n = k;
          }
        }
        var addrObj = {};
        addrObj.prjId = addressList[j].prjId;
        addrObj.addrId = addressList[j].addrId;
        addrObj.address = leadPrjMapList[i].prjCode + "-" + addressList[j].address;
        addrObj.prjType = leadPrjMapList[i].prjType;
        addrObj.prjCode = leadPrjMapList[i].prjCode
        address[k++] = addrObj
      }
    }
    that.setData({
      address: address,
      selectedAddrIndex: m,
      selectedCodeIndex:n,
      prjCode: prjCode
    })
    console.log(that.data.address);
    if (options.sortId == 'applyUser'){
      wx.setNavigationBarTitle({
        title: '补提加班申请',
      })
      that.setData({
        beginDate: beginDate,
        selectBeginDate: beginDate,
        selectEndDate: beginDate,
      })
    } else if (options.sortId == 'bpg'){
      wx.setNavigationBarTitle({
        title: '报工申请',
      })
      that.setData({
        beginDate: bpgBeginDate,
        selectBeginDate: bpgBeginDate,
        selectEndDate: bpgBeginDate,
        beginTime: wx.getStorageSync('ambegintime'),
        endTime: wx.getStorageSync('pmendtime'),
        selectBeginTime: wx.getStorageSync('ambegintime'),
        selectEndTime: wx.getStorageSync('pmendtime'),
      })
    } else if (options.transdata){
      var transdata = JSON.parse(options.transdata);
      if (transdata.sortId == 'applyUser'){
        wx.setNavigationBarTitle({
          title: '补提加班申请',
        })
      }else{
        wx.setNavigationBarTitle({
          title: '报工申请',
        })
      }
    }
    if (options.transdata){
      var transdata = JSON.parse(options.transdata);
      var optionsBeginDate = new Date(transdata.selectBeginDate);
      var optionsEndDate = new Date(transdata.selectEndDate)
      that.setData({
        sortId: transdata.sortId,
        id: transdata.id,
        selectBeginDate: util.formatTime(optionsBeginDate).substring(0, 10),
        selectEndDate: util.formatTime(optionsEndDate).substring(0, 10),
        selectBeginTime: transdata.beginTime,
        selectEndTime: transdata.endTime,
        applyUser: transdata.applyUser,//加上
        reason: transdata.reason,
        selectedIndex: parseInt(transdata.selectedIndex)
      }) 
    }else{  
      that.setData({
        sortId: options.sortId,
        applyUser: wx.getStorageSync("loginData").topUser,
        // beginDate: beginDate,
        endDate: enddate,
        // selectBeginDate: beginDate,
        // selectEndDate: beginDate,
        selectedAddrIndex: 0,
        selectedCodeIndex:0
      }) 
    }
    console.log(this.data);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
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