// pages/mine/exportAttendence/exportAttendence.js
var util = require('../../../utils/util.js');
var curMonth = util.formatTime(new Date()).substring(0, 7);

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hiddenmodalput: true,
    email:"",   
  },

  prjCodeChange: function (e) {
    console.log(this.data);
    console.log(e)
    var index = parseInt(e.detail.value);
    this.setData({
      selectedPrjCodeIndex: parseInt(e.detail.value)
    })
  },
  modalInput: function () {
    this.setData({
      hiddenmodalput: !this.data.hiddenmodalput
    })
  },
  emailInput: function (e) {
    console.log(e);
    this.setData({
      email: e.detail.value
    })
  },
  //取消按钮  
  cancel: function () {
    this.setData({
      hiddenmodalput: true,
      email: '',
      selectMonth: curMonth
    });
  }, 
  confirm: function (e) {
    // wx.showLoading({
    //   title: '提交中，请稍后',
    // })
    console.log(e);
    console.log(this.data);
    var that = this;
    if (that.data.email == "") {
      wx.showToast({
        title: '邮箱不能为空',
        icon: "none",
        duration: 2000
      })
    }else{
      let url = util.requestService("/api/hrkq/exportExcel");
      let attnMonth = that.data.selectMonth;
      let email = that.data.email;
      let businessType = wx.getStorageSync("loginData").businessType;
      let idx = that.data.selectedPrjCodeIndex;
      let roleMapList = wx.getStorageSync("loginData").roleMapList;
      let roleType = '';
      for (let i = 0; i < roleMapList.length;i++){
        roleType += roleMapList[i].roleName+','
      }
      var postdata = {
        topEmpId: wx.getStorageSync("topEmpId"),
        encryption: wx.getStorageSync("encryption"),
        prjId: that.data.prjCodeArr[idx].prjId,
        attnMonth: attnMonth,
        email: email,
        businessType:businessType,
        roleType: roleType
      }
      console.log("postdata", postdata);
      that.setData({
        hiddenmodalput: true,
        email: "",
        selectMonth: curMonth,
      })
      function success(res) {
        wx.hideLoading();        
        console.log(res);
        if(res.data.code=='200'){
          that.setData({
            hiddenmodalput: true,
            email: "",  
            selectMonth: curMonth,
            selectedPrjCodeIndex:0
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
    }
  },

  monthChange: function (e) {
    console.log(e);
    this.setData({
      selectMonth: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let leadPrjMapList = wx.getStorageSync("loginData").leadPrjMapList;
    let prjCodeArr = [];
    let prjCode = {
      prjId:'',
      prjCode:'全部'
    }
    prjCodeArr.push(prjCode);
    for (let i = 0; i < leadPrjMapList.length;i++){
      let prjCodeObj = {};
      prjCodeObj.prjId = leadPrjMapList[i].prjId;
      prjCodeObj.prjCode = leadPrjMapList[i].prjCode;
      prjCodeArr[i+1]=prjCodeObj
    }
    var beginMonth = util.GetMonthStr(-180);   
    this.setData({
      selectMonth: curMonth,
      beginMonth: beginMonth,
      curMonth: curMonth,
      prjCodeArr: prjCodeArr,
      selectedPrjCodeIndex:0,
    })
    console.log("data",this.data);
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