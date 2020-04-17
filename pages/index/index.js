//index.js
//获取应用实例
const app = getApp()

import {
  formatDate
} from "../../utils/util.js"

Page({
  data: {
    banner: [],
    info_list: [],
    index_day: 1
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },


  onLoad: function() {
    this.fetchArticles()
  },


  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  onReachBottom: function() {
    this.lodemore()
  },


  // 下拉刷新
  onPullDownRefresh: function() {
    this.fetchArticles()
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh()
  },
  // 加载更多
  lodemore: function() {
    if (this.data.info_list.length == 0) return
    var date = this.getNextDate()
    var that = this
    that.setData({
      loading: true
    })
    console.log('下一个日期' + Number(formatDate(date)))
    wx.request({
      url: 'https://news-at.zhihu.com/api/4/news/before/' + (Number(formatDate(date)) + 1),
      data: {},
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: (result) => {
        that.setData({
          loading: false,
          info_list: that.data.info_list.concat(
            [{
              header: formatDate(date, '-')
            }]
          ).concat(result.data.stories)
        })
      },
      fail: () => {},
      complete: () => {}
    });
  },
  // 获取下一个要加载的日期
  getNextDate() {
    const now = new Date();
    console.log('现在时间是' + now)
    now.setDate(now.getDate() - this.index++)
    console.log('下一个时间是' + now)
    return now
  },
  // 初始化 加载当天的日报
  fetchArticles: function() {
    let that = this
    wx.request({
      url: 'https://news-at.zhihu.com/api/4/news/latest',
      data: {},
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: (result) => {
        that.setData({
          // 顶部 swiper
          banner: result.data.top_stories,
          // list 内容
          info_list: result.data.stories,
        })
      },
      fail: () => {},
      complete: () => {}
    });
    this.index = 1
  }
})