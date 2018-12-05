// pages/login/login.js
var util = require('../../utils/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    account:"",
    password:""
    // telephone:null,
    // accountDisabled:false
  },

  // 获取输入手机账号 
  phoneInput: function (e) {
    this.setData({
      account: e.detail.value
    })
  }, 

  // 获取输入密码 
  passwordInput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },

  // getPhoneNumber:function(e) {
  //   console.log(e);
  //   var that = this;
  //   //调用后台获取手机号
  //   wx.login({
  //     success: function (res) {
  //       if(res.code){
  //         console.log(res)
  //         var getPhoneNumUrl = util.requestService('/api/hrkq/analyzePhone');
  //         var getPhoneData={
  //           js_code:res.code,
  //           encryptedData: e.detail.encryptedData,
  //           iv: e.detail.iv
  //         }
  //         function success(res){
  //           console.log(res)
  //           if(res.data.code == 200){
  //             wx.setStorage({
  //               key: 'encryption',
  //               data: res.data.encryption,
  //             })
  //             that.setData({
  //               telephone: res.data.phoneNumber,
  //               account: res.data.phoneNumber,
  //               // accountDisabled:true
  //             })
  //           } else if (res.data.code == 99) {
  //             wx.hideLoading();
  //             wx.showToast({
  //               title: res.data.message,
  //               icon: "none",
  //               duration: 2000
  //             })
  //           } else {
  //             wx.hideLoading();
  //             wx.showToast({
  //               title: res.data.message,
  //               icon: "none",
  //               duration: 2000
  //             })
  //           }
  //         }
  //         util.getPostRequest(getPhoneNumUrl, getPhoneData, success);
  //       }
  //     },
  //     fail: function (res) {
  //       wx.showToast({
  //         title: 'login登录接口失败',
  //         icon: "none",
  //         duration: 2000
  //       })
  //       wx.hideLoading();
  //     }
  //   })
  // },
  
  // 登录 
  login: function () {
    var that = this;
    // var reg = new RegExp('^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\\d{8}$');
    if (this.data.account.length == 0) {
      wx.showToast({
        title: '账号不能为空',
        icon: 'none',
        duration:2000
      })
    } else if (this.data.password.length == 0){
      wx.showToast({
        title: '密码不能为空',
        icon: 'none',
        duration:2000
      })
    }  
    // if (reg.test(this.data.account)){
    //   if (this.data.telephone == null){
    //     wx.showToast({
    //       title: '请点击验证按钮获取手机号',
    //       icon: 'none',
    //       duration: 3000
    //     })
    //   }
    //   else if (this.data.telephone != this.data.account){
    //     console.log("1111111");
    //     wx.showToast({
    //       title: '输入手机号与验证获取绑定微信手机号不一致',
    //       icon: 'none',
    //       duration: 3000
    //     })
    //   } else if (this.data.telephone == this.data.account){
    //     that.getLoginCheck();
    //   }
    // } 
    else {
      that.getLoginCheck();
    }
  },

  getLoginCheck:function(){
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.login({
      success: function (res) {
        console.log(res)
        if (res.code) {
          app.globalData.isLogin = true
          var url = util.requestService("/api/hrkq/login");
          var updateUrl = util.requestService("/api/hrkq/update");
          var postdata = {
            js_code: res.code,
            appid: "wxa8405bb1ac18d4b5",
            secret: "99f4bc81bd325c4cc40215c8ece52adb",
            account: that.data.account,
            password: that.data.password
          }

          function success(res) {
            console.log(res)
            if (res.data.code == 200) {
              wx.setStorage({
                key: 'encryption',
                data: res.data.encryption,
              })
              wx.setStorage({
                key: 'topEmpId',
                data: res.data.topEmpId,
              })
              var update = {
                encryption: res.data.encryption,
                topEmpId: res.data.topEmpId
              }
              function success(res) {
                console.log(res);
                wx.hideLoading();
                if (res.data.code == 200) {
                  wx.showToast({
                    title: '登录成功',
                    icon: "success",
                    duration: 2000
                  })
                  wx.setStorage({
                    key: 'loginData',
                    data: res.data,
                  })

                  wx.switchTab({
                    url: "../punch/punch",
                  })
                } else {
                  wx.showToast({
                    title: res.data.message,
                    icon: "none",
                    duration: 2000
                  })
                }
              }
              util.getPostRequest(updateUrl, update, success);
            } else if (res.data.code == 99) {
              wx.hideLoading();
              wx.showToast({
                title: res.data.message,
                icon: "none",
                duration: 2000
              })
            } else {
              wx.hideLoading();
              wx.showToast({
                title: res.data.message,
                icon: "none",
                duration: 2000
              })
            }
          }
          util.getPostRequest(url, postdata, success);
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '获取用户登录态失败！',
            icon: "none",
            duration: 2000
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: 'login登录接口失败',
          icon: "none",
          duration: 2000
        })
        wx.hideLoading();
      }
    }) 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imageurl:"../../images/logo.png"
    })    
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

  onShareAppMessage: function (res) {
    return {
      title: '打卡',
      desc: "打卡",
      path: 'pages/login/login',
      success: function (res) {
        wx.showShareMenu({
          // 要求小程序返回分享目标信息
          withShareTicket: true
        });

      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})