var util = require('../../../utils/util.js');
var date = new Date();

var newYear = new Date().getFullYear();
var newMonth = new Date().getMonth();
if (newMonth < 1) {
  newYear = new Date().getFullYear() - 1;
  newMonth = 12;
}
var start = new Date((newYear + "-" + newMonth + "-1").replace(/\-/g, '/'));
var newStart = new Date((newYear + "-" + (newMonth + 1) + "-1").replace(/\-/g, '/'));
var beginDate = util.formatTime(date).substring(0,10);
var a = new Date((new Date().getFullYear()+1) + "-12-31");
var oribeginDate = null;
if(new Date().getDate()=='1'){
  oribeginDate = util.formatTime(start).substring(0, 10)
}else{
  oribeginDate = util.formatTime(newStart).substring(0, 10)
}
var enddate = null;
var imgNum = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: [],
    id:null,
    reason:"",
    abstype: [ 
      "请选择",
      "调休",
      "病假",
      "事假",
      "年假",
      "婚假",
      "产假",
      "哺乳假",
      "丧假",
      "产检假",
      "陪产假"
    ],
    selectedIndex: 0
  },
  //开始日期
  beginDateChange: function (e) {
    var date = e.detail.value;
    if (date > this.data.selectEndDate){
      wx.showToast({
        title: '结束日期小于开始日期',
        icon: "none"
      }, 1000)
    }
    this.setData({
      selectBeginDate: date,
    })
  },
//结束日期
  endDatechange: function (e) {
    var date = e.detail.value;
    if (date < this.data.selectBeginDate){
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
  beginTimeChange:function(e){
    var flag = (this.data.selectBeginDate == this.data.selectEndDate);
    var currentTime = e.detail.value;
    if (flag && currentTime > this.data.selectEndTime){
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
  endTimeChange:function(e){
    var flag = (this.data.selectBeginDate == this.data.selectEndDate);
    var currentTime = e.detail.value;
    if (flag && currentTime < this.data.selectBeginTime){
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
  addrChange:function(e){
    console.log(this.data);
    console.log(e)
    var index = parseInt(e.detail.value);
    var newbeginTime = this.data.address[index].ambegintime;
    var newendTime = this.data.address[index].pmendtime
    this.setData({
      beginTime: newbeginTime,
      selectBeginTime: newbeginTime,
      selectEndTime: newendTime,
      endTime: newendTime,

      selectedAddrIndex: parseInt(e.detail.value)
    })
  },

  formSubmit:function(e){
    console.log(e)
    var that = this;   
    var value = e.detail.value;
    if (value.leaveType==0){
      wx.showToast({
        title: '请填写请假类型',
        icon:'none',
        duration:2000
      })
    } else if (value.beginDate == value.endDate && value.beginTime > value.endTime){
      wx.showToast({
        title: '结束时间小于开始时间',
        icon:"none",
        duration:2000
      })
    } else if (value.beginDate > value.endDate){
      wx.showToast({
        title: '结束日期小于开始日期',
        icon: "none",
        duration:2000
      })
    }else if (value.reason==""){
      wx.showToast({
        title: '请填写请假事由',
        icon:'none',
        duration:2000
      })
    } else{
      value.leaveType = util.getType().myabsence[value.leaveType];
      // value.leaveType += 1;
      // if (value.leaveType>9){
      //   value.leaveType+=3
      // }
      var url = util.requestService("/api/hrkq/askLeave");
      var uploadUrl = util.requestService("/api/hrkq/askLeavePhoto");
      var postdata = value;
      postdata.topEmpId = wx.getStorageSync("topEmpId");
      postdata.encryption = wx.getStorageSync("encryption");
      var idx = that.data.selectedAddrIndex;
      postdata.prjId = that.data.address[idx].prjId;
      postdata.loaType = 0;
      if (that.data.id != null) {
        postdata.id = that.data.id;
      }
      console.log(that.data.address);
      postdata.addrId = that.data.address[value.address].addrId;  
      postdata.groupId = that.data.address[value.address].groupId;
      var uploadData = {
        topEmpId: wx.getStorageSync("topEmpId"),
        encryption: wx.getStorageSync("encryption")
      }
      console.log(postdata);
      function success(res){
        console.log(res);
        if(res.data.code == 200){
          uploadData.leaveId = res.data.leaveId;
          wx.showToast({
            title: '数据提交成功',
            icon:"success",
            duration:2000
          })
          function success(res){
            var res = JSON.parse(res.data);
            if (res.code == 200){
              if (imgNum == that.data.src.length){
                wx.showToast({
                  title: '图片上传成功',
                  icon: "success",
                  duration: 2000
                })
              }
              that.setData({
                src:[]
              })
            } else if (res.code == 99) {
              console.log(res);
              util.mineRedirect(res.message);
            } else {
              console.log(res);
              wx.showToast({
                title: '"' + res.message + '"',
                icon: "none",
                duration: 2000
              })
            }
          }
          if (that.data.src.length!=0){
            for (var i = 0; i < that.data.src.length;i++){
              imgNum++;
              util.upload(uploadUrl, that, that.data.src[i], uploadData, success);
            }
          }
          that.setData({
            id:null,
            selectBeginDate: beginDate,
            endDate: enddate,
            selectEndDate: beginDate,
            selectBeginTime: wx.getStorageSync('ambegintime'),
            selectEndTime: wx.getStorageSync('pmendtime'),
            reason: "",
            selectedIndex: 0,
            selectedAddrIndex:0
            // src: []
          })
        } else if (res.data.code == 99) {
          util.mineRedirect(res.data.message);
        }else{
          wx.showToast({
            title: '"'+res.data.message+'"',
            icon:"none",
            duration:2000
          })
        }
      } 
      wx.showModal({
        title: '提示',
        content: '确认提交请假申请吗？',
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

  choosePhoto:function() {
    var that = this;
    if(that.data.src.length<3){
      wx.chooseImage({
        count: 3, // 默认9
        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths;
          var srcArray = that.data.src;
          for (var i = 0; i < tempFilePaths.length;i++){
            if (srcArray.length>=3){
              that.setData({
                src: srcArray
              })
              return false;
            }else{
              srcArray.push(tempFilePaths[i]);
            }
          }
          that.setData({
            src: srcArray,
            tempFilePaths: tempFilePaths
          })
        }
      })
    }else{
      wx.showToast({
        title: '最多上传3张图片',
        icon: 'none',
        duration: 3000
      });
    }
    console.log(that.data.src);
  },

  // 删除图片
  deleteImg: function (e) {
    var srcArray = this.data.src;
    var index = e.currentTarget.dataset.index;
    srcArray.splice(index, 1);
    this.setData({
      src: srcArray
    });
  },

  upload: function (url, page, path, postdata) {
    wx.uploadFile({
      url: url,
      filePath: path[0],
      name: 'file',
      header: { "Content-Type": "multipart/form-data" },
      formData: {
        postdata: postdata
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == 200) {
          wx.showToast({
            title: '提交成功',
            icon: "success",
            duration: 2000
          })
          that.setData({
            src: [],
            id: null,
            selectBeginDate: beginDate,
            endDate: enddate,
            selectEndDate: beginDate,
            selectBeginTime: "09:00",
            selectEndTime: "18:00",
            reason: "",
            selectedIndex: 0
          })
        }
      },
      fail: function (e) {
        console.log(e);
        wx.showModal({
          title: '提示',
          content: '上传失败',
          showCancel: false
        })
      },
      complete: function () {
        wx.hideToast();  //隐藏Toast
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var address = [];
    var k = 0;
    var n = 0;
    var prjMapList = wx.getStorageSync("loginData").prjMapList;
    for (var i = 0; i < prjMapList.length; i++) {
      var addressList = prjMapList[i].addressMapList;
      for (var j = 0; j < addressList.length;j++){
        if (options.transdata) {
          if (JSON.parse(options.transdata).addrId == addressList[j].addrId && JSON.parse(options.transdata).groupId == prjMapList[i].groupId) {
            n = k;
          }
        }
        var addrObj = {};
        
        addrObj.prjId = prjMapList[i].prjId;
        addrObj.addrId = addressList[j].addrId;
        addrObj.address = prjMapList[i].prjCode+"-"+addressList[j].address;
        addrObj.prjCode = prjMapList[i].prjCode + "-" + prjMapList[i].prjName + "-" + addressList[j].address;
        addrObj.ambegintime = prjMapList[i].ambegintime;
        addrObj.pmendtime = prjMapList[i].pmendtime;
        addrObj.prjType = prjMapList[i].prjType;
        addrObj.groupId = prjMapList[i].groupId;
        address[k++] = addrObj
      }
    }
    var businessType = wx.getStorageSync("loginData").businessType;
    console.log("businessType:" + businessType);
    if (businessType == '2') {
      oribeginDate = util.formatTime(start).substring(0, 10)
      console.log("oribeginDate", oribeginDate);
    }
    that.setData({
      address: address,
      selectedAddrIndex: n,
      staffName: wx.getStorageSync("loginData").staffName
    })
    if (options.transdata) {
      var transdata = JSON.parse(options.transdata);
      var selectedIndex = parseInt(transdata.selectedIndex)-1;
      if (selectedIndex>9){
        selectedIndex-=3
      }
      var id = transdata.id;
      var addrId = transdata.addrId;
      var groupId = transdata.groupId;   //新加
      //ios手机日期兼容转换
      var optionsBeginDate = new Date(transdata.selectBeginDate.replace(/\-/g, '/'));
      var optionsEndDate = new Date(transdata.selectEndDate.replace(/\-/g, '/'));
      that.setData({
        id: id,
        addrId: addrId,
        groupId: groupId,
        selectBeginDate: util.formatTime(optionsBeginDate).substring(0, 10),
        selectEndDate: util.formatTime(optionsEndDate).substring(0,10),
        selectBeginTime: transdata.beginTime,
        selectEndTime: transdata.endTime,
        reason: transdata.reason,
        selectedIndex: selectedIndex
      })
    } else {     
      that.setData({
        beginTime: wx.getStorageSync('ambegintime'),
        endTime: wx.getStorageSync('pmendtime'),
        selectBeginTime: wx.getStorageSync('ambegintime'),
        selectEndTime: wx.getStorageSync('pmendtime'),
        beginDate: oribeginDate,
        endDate: enddate,
        selectBeginDate: beginDate,
        selectEndDate: beginDate,
        selectedAddrIndex:0
      })
    }
    console.log(this.data)
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