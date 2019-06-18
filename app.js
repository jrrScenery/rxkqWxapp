var util = require('utils/util.js');
App({
  //判断sessionKey是否有效
  checkValid:function(){
    var that = this;
    if (wx.getStorageSync("encryption")) {
      wx.checkSession({
        success: function (res) {
          var updateUrl = util.requestService("/api/hrkq/update");
          var update = {
            encryption: wx.getStorageSync("encryption"),
            topEmpId: wx.getStorageSync("topEmpId")
          }
          function success(res) {
            console.log("update",res);
            wx.hideLoading();
            if (res.data.code == 200) {
              wx.setStorage({
                key: 'loginData',
                data: res.data,  
              })
              wx.switchTab({
                url: "/pages/punch/punch",
              })
            } else if (res.data.code == 99){
              wx.redirectTo({
                url: "/pages/login/login",
              })
            } else {
              wx.showToast({
                title: res.data.message,
                icon:"none",
                duration:2000
              })
            }
          }
          util.getPostRequest(updateUrl, update, success);
        },
        fail: function () {
          //跳转到登录页面
          wx.redirectTo({
            url: "/pages/login/login",
          })
        }
      })
    } else {
      wx.hideLoading();
      wx.showToast({
        title: '登录失效，请重新登录',
      })
      //跳转到登录页面
      wx.redirectTo({
        url: "/pages/login/login",
      })
      
    }
  },
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    if (wx.canIUse('getUpdateManager')){
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        //console.log(res)
        console.log("res.hasUpdate:" + res.hasUpdate)
      })

      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          }
        })
      })

      updateManager.onUpdateFailed(function () {
        // 新的版本下载失败
        wx.showModal({
          title: '更新提示',
          content: '新版本下载失败',
          showCancel: false
        })
      })
    }
    
    wx.showLoading({
      title: '加载中',
    })
    this.checkValid();
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  },
  globalData:{
    encryption:null,
    addressMapList:null,
    isLogin:false
  }
})
