const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  // return [hour, minute, second].map(formatNumber).join(':')
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//请求地址
function requestService(serverMethod) {
  // var httpInfo = "https://wbm.dcits.com" + serverMethod;
  // var httpInfo = "http://192.168.2.104:8808" + serverMethod;
  var httpInfo = "http://10.1.200.187:8808" + serverMethod;
  
  return httpInfo;
}

//页面跳转
function navigateTo(event){
  console.log(event);
  let route = event.currentTarget.dataset.route;
  var id = event.currentTarget.dataset.id;
  if (event.currentTarget.dataset.current!=null){
    var loaType = event.currentTarget.dataset.current;
    wx.navigateTo({
      url: route + "?id=" + id + "&loaType=" + loaType
    })
  }else{
    wx.navigateTo({
      url: route + "?id=" + id
    })
  }
}

//跳转登录页面代码
function redirect(res){
  wx.showModal({
    title: '提示',
    content: res,
    success: function (res) {
      if (res.confirm) {
        wx.redirectTo({
          url: '../login/login',
        })
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}
function mineRedirect(res) {
  wx.showModal({
    title: '提示',
    content: res,
    success: function (res) {
      if (res.confirm) {
        wx.redirectTo({
          url: '../../login/login',
        })
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}
var postFlag = true;
function checkEncryption(url, postdata, success) {
  console.log(postFlag);
  if (wx.getStorageSync("encryption")) {
    wx.checkSession({
      success: function (res) {
        if (postFlag){
          postFlag = false
          getPostRequest(url, postdata, success);
        }
      },
      fail: function () {
        wx.hideLoading();
        mineRedirect("登录失效，请重新登录");
      }
    })
  } else {
    wx.hideLoading();
    mineRedirect("您未登录，请先登录");
  }
}

function getPostRequest(url, data, success) {
  wx.request({
    method: 'POST',
    url: url,
    data: data,
    header: { 'content-type': 'application/json' },
    success: success,
    complete:function(res){
      // console.log(res);
      postFlag = true
    },
    fail: function (res) {
      console.log(res);
      // wx.showToast({
      //   title: res.errMsg,
      //   icon:'none',
      //   duration:2000
      // })
    }
  });
}

function upload(url,page, path,data,success) {
  wx.uploadFile({
    url: url,
    filePath: path,
    name: 'image',
    formData: data,
    header: { "Content-Type": "multipart/form-data/application/json" },
    success: success,
    fail: function (e) {
      wx.showModal({
        title: '提示',
        content: '提交失败',
        showCancel: false
      })
    },
    complete: function () {
      wx.hideToast();  //隐藏Toast
    }
  })
}

function getType(){
  var data = {
    loaType:{
      0: "请假",
      1: "加班",
      2: "考勤",
      3: "报派工",
      4: "批量加班"
    },
    myattence: {
      0: 0,
      1: 1,
      2: 3,
      3: 4,
      4: 5,
      5: 6,
      6: 7,
      7: 8,
      8: 9,
      9: 13,
      10: 14,
      11: 15,
      12: 16
    },
    myabsence:{
      0:0,
      1:2,
      2:3,
      3:4,
      4:5,
      5:6,
      6:7,
      7:8,
      8:9,
      9:13,
      10:14
    },
    myabsencereserve: {
      0: 0,
      1: 1,
      3: 2,
      4: 3,
      5: 4,
      6: 5,
      7: 6,
      8: 7,
      9: 8,
      13: 9,
      14: 10,
      15: 11,
      16: 12
    },
    leaveType:{
      0: "请选择",
      1: "因公",
      2: "调休",
      3: "病假",
      4: "事假",
      5: "年假",
      6: "婚假",
      7: "产假",
      8: "哺乳假",
      9: "丧假",
      10: "迟到",
      11: "早退",
      12: "旷工",
      13: "产检假",
      14: "陪产假",
      15:"分包替岗",
      16:"漏打卡"
    },
    relaxation:{
      0:"调休",
      1:"有偿"
    },
    processStatus:{
      0 : "未提交",
      1 : "审批中",
      2 : "已审批",
      3: "修改"
    },
    auditType:{
      0 : "同意",
      1 : "驳回"
    },
    processType:{
      0: "代办任务",
      1 : "审批记录"
    }
  }
  return data;
}
//获取当前时间前后N天前后日期的方法
function GetMonthStr(AddDayCount){
  var dd = new Date();
  dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
  var y = dd.getFullYear();
  var m = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1);//获取当前月份的日期，不足10补0
  return y + "-" + m;
}

//获取当前时间前后N天前后日期的方法
function GetMonthStr1(AddDayCount) {
  var dd = new Date();
  dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
  var y = dd.getFullYear();
  var m = (dd.getMonth() + 1);//获取当前月份的日期，不足10补0
  return y + "-" + m;
}

function GetDateStr(AddDayCount){
  var dd = new Date();
  dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
  var y = dd.getFullYear();
  var m = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1);//获取当前月份的日期，不足10补0
  var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();//获取当前几号，不足10补0
  return y + "-" + m + "-" + d;
}
module.exports = {
  formatTime: formatTime,
  requestService: requestService,
  redirect: redirect,
  mineRedirect: mineRedirect,
  checkEncryption: checkEncryption,
  getPostRequest: getPostRequest,
  getType: getType,
  navigateTo: navigateTo,
  upload:upload,
  GetMonthStr: GetMonthStr,
  GetDateStr: GetDateStr,
  GetMonthStr1: GetMonthStr1
}

