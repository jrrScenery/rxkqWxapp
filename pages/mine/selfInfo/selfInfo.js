// pages/mine/selfInfo/selfInfo.js
var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hiddenmodalput: true,
    oldPwd: '',
    newPwd: '',
    newPwd1: ''
  },
  modalInput:function(){
    this.setData({
      hiddenmodalput: !this.data.hiddenmodalput
    })  
  },
  passwordInput:function(e){
    console.log(e);
    if(e.currentTarget.id=="oldPwd"){
      this.setData({
        oldPwd: e.detail.value
      })
    }
    if (e.currentTarget.id == "newPwd"){
      this.setData({
        newPwd: e.detail.value
      })
    }
    if (e.currentTarget.id == "newPwd1") {
      this.setData({
        newPwd1: e.detail.value
      })
    }
  },
  confirm: function (e) {
    console.log(e);
    console.log(this.data);
    var that = this;
    if (that.data.oldPwd==""){
      wx.showToast({
        title: '旧密码不能为空',
        icon: "none",
        duration: 2000
      })
    } else if (that.data.newPwd == ""){
      wx.showToast({
        title: '新密码不能为空',
        icon: "none",
        duration: 2000
      })
    } else if (that.data.newPwd1 == ""){
      wx.showToast({
        title: '确认密码不能为空',
        icon: "none",
        duration: 2000
      })
    }else{
      if (that.data.oldPwd == that.data.newPwd) {
        wx.showToast({
          title: '新密码不能与旧密码相同',
          icon: "none",
          duration: 2000
        })
      } else if (that.data.newPwd == that.data.newPwd1) {
        var url = util.requestService("/api/hrkq/changePassword");
        var postdata = {
          topEmpId: wx.getStorageSync("topEmpId"),
          encryption: wx.getStorageSync("encryption"),
          passwordOld: that.data.oldPwd,
          passwordNew: that.data.newPwd,
        }
        console.log(postdata);
        function success(res) {
          console.log(res);
          if (res.data.code == 200) {
            wx.showToast({
              title: '密码修改成功',
              icon: "none",
              duration: 2000
            })
            that.setData({
              hiddenmodalput: true,
              oldPwd: '',
              newPwd: '',
              newPwd1: ''
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
          content: '确认修改密码吗？',
          success: function (res) {
            if (res.confirm) {
              util.checkEncryption(url, postdata, success);
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      } else {
        wx.showToast({
          title: '两次输入新密码不一致',
          icon: 'none',
          duration: 2000
        })
      }
    }
  },
  //取消按钮  
  cancel: function () {
    this.setData({
      hiddenmodalput: true,
      oldPwd: '',
      newPwd: '',
      newPwd1: ''
    });
  },  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var prjMapList = null;
    wx.getStorage({
      key: 'loginData',
      success: function(res) {
        
        that.setData({
          staffName: res.data.staffName,
          topUser: res.data.topUser,
          leadPrjMapList: res.data.leadPrjMapList,
          prjMapList: res.data.prjMapList,
          residueDay: res.data.residueDay,
          restDay: res.data.restDay,
          businessType: res.data.businessType
        })
      },
    })
    console.log(that.data)
  },

  updateInfo:function(){
    var that = this;
    var updateUrl = util.requestService("/api/hrkq/update");
    var update = {
      encryption: wx.getStorageSync("encryption"),
      topEmpId: wx.getStorageSync("topEmpId")
    }
    function success(res) {
      console.log(res);
      wx.hideLoading();
      if (res.data.code == 200) {
        wx.showToast({
          title: '更新成功',
          icon: "success",
          duration: 2000
        })
        wx.setStorage({
          key: 'loginData',
          data: res.data,
        })
        var prjMapList = null;
        wx.getStorage({
          key: 'loginData',
          success: function (res) {
            that.setData({
              staffName: res.data.staffName,
              topUser: res.data.topUser,
              leadPrjMapList: res.data.leadPrjMapList,
              prjMapList: res.data.prjMapList,
              residueDay: res.data.residueDay,
              restDay: res.data.restDay
            })
          },
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
  },

  removeTap:function(){
    wx.showModal({
      title: '提示',
      content: "确定解除绑定吗？",
      success: function (res) {
        if (res.confirm) {
          wx.clearStorage();
          wx.reLaunch({
            url: '../../login/login',
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})