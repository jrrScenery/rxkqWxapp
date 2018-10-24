// pages/mine/application/application.js
var util = require('../../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
  },
//监听搜索输入框值输入
  searchBindInput:function(e){
    var searchInfo = e.detail.value;//input框中的查询值
    if (searchInfo){
      this.setData({
        searchInfo: searchInfo
      })
    }else{
      this.setData({
        searchInfo: ''
      })
      this.application(this.data.selectInfo);
    }
  },
//监听搜索按钮点击事件
  searchBindTap:function(e){
    var that = this;
    if (that.data.searchInfo!=null){ 
      if (that.data.selectInfo.sortId == 'applyUser'){
        var flag = true;
        var queryApplyInfos = [];
        console.log(that.data.applyInfos);
        var k = 0;
        var m = 0;
        for (var i = 0; i < that.data.applyInfos.length;i++){
          var applyInfo = that.data.applyInfos[i].applyInfo;
          var apply = {};
              apply.prjId = that.data.applyInfos[i].prjId;
              apply.prjCode = that.data.applyInfos[i].prjCode;
              apply.prjName = that.data.applyInfos[i].prjName;
              apply.applyInfo = [];
              queryApplyInfos[m] = apply;
              console.log(k);
          for (var j = 0; j < applyInfo.length;j++){
            if (applyInfo[j].staffName.indexOf(that.data.searchInfo)>-1){  
              console.log(applyInfo[j].staffName);            
                  apply.applyInfo[k] = that.data.applyInfos[i].applyInfo[j];
                  flag = false;
                  k++;
            }
          }
          m++;
        }
        that.setData({
          applyInfos: queryApplyInfos
        })
        console.log(queryApplyInfos);
        if (flag){
          wx.showToast({
            title: '申请人输入错误！',
            icon:'none',
            duration:2000
          })
        }
      } else{
        that.application(that.data.selectInfo);
      }   
    }else{
      that.application(that.data.selectInfo);
    }
  },
//监听单选按钮值的改变
  radioChange: function (e) {
    this.selectApply(e.detail.value);
  },
//选择单选框事件
  selectApply: function (e) {
    var that = this;
        that.data.selectInfo.applyUser = e;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    var selectInfo = that.data.selectInfo;
    prevPage.setData({
        selectedAddrIndex: parseInt(selectInfo.selectedAddrIndex),
        selectedIndex: parseInt(selectInfo.selectedIndex),
        selectBeginDate: selectInfo.selectBeginDate,
        selectEndDate: selectInfo.selectEndDate,
        selectBeginTime: selectInfo.selectBeginTime,
        selectEndTime: selectInfo.selectEndTime,
        applyUser: selectInfo.applyUser,
        reason: selectInfo.reason
    })
    wx.navigateBack();
  },
//请求服务器获取相关权限下申请人信息
  application: function (options){
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    var url = util.requestService("/api/hrkq/queryApplyUser");
    var postdata = {
      topEmpId: wx.getStorageSync("topEmpId"),
      encryption: wx.getStorageSync("encryption"),           
    }
    var conditions = {};
    console.log(that.data);
    conditions.page = that.data.page;
    if (options.sortId =='applyUser'){
      postdata.applyType = 0;
      postdata.conditions = conditions;
    }else{
      postdata.applyType = 1;
      postdata.applyPrjId = options.prjId;
      if (that.data.searchInfo){
        conditions.name = that.data.searchInfo;
      }     
      postdata.conditions = conditions;
    }
    console.log(postdata)
    function success(res) {
      console.log(res);
      wx.hideLoading();
      if (res.data.code == 200) {
        that.setData({
          applyInfos: res.data.data
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
    var that = this;
    var selectInfo = JSON.parse(options.selectInfo);
    that.setData({
      selectInfo: selectInfo,
      // page: 1
    })
    that.application(selectInfo);
    if (selectInfo.sortId == 'applyUser'){
      that.setData({
        norecord:'无对应的申请人'
      })
      wx.setNavigationBarTitle({
        title: '选择申请人',
      })
    }else{
      that.setData({
        norecord: '无对应的报工人'
      })
      wx.setNavigationBarTitle({
        title: '选择报工人',
      })
    }
    
    console.log(that.data);
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