// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    answer:'',
    title:'',
    image:'',
    image_source:'',
    questions: [{
      question_title: 'title',
      answer: {
        meta: {
          image: '',
          author: '',
          bio: ''
        },
        content: {
        }
      }
    }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that =this
    this.setData({
      id:options.id
    })
    wx.request({
      url: 'https://news-at.zhihu.com/api/4/news/'+options.id,
      // url: 'https://news-at.zhihu.com/api/4/news/'+9722718,
      data: {},
      header: {'content-type':'application/json'},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: (result)=>{
        if(result.data.body!=null){
          // console.log(result.data.body)
          that.change(result.data.body)
        }

        that.setData({
          title:result.data.title,
          image_source: result.data.image_source,
          image: result.data.image
        })
      },
      fail: ()=>{},
      complete: ()=>{}
    })
    this.getExtra(options.id);
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

  },

  // 下面bar的返回图标触发 返回主页
  onBack: function(){
    console.log("返回")
    console.log(getCurrentPages())
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  // 下面的评论图标触发 查看评论
  onComment:function(){
    wx.navigateTo({
      url: '../comment/comment?id='+this.data.id,
    })
  },

  // 获取评论点赞等信息
  getExtra(id){
    let that=this
    wx.request({
      url: 'https://news-at.zhihu.com/api/4/story-extra/' + id,
      // url: 'https://news-at.zhihu.com/api/4/story-extra/' + 9722718,
      header:{
        'Content-Type': 'application/json'
      },
      success(result){
        that.setData({
          extra: result.data
        })
      }
    })
  },

  // 富文本正则表达式匹配转换
  change(html) {
    let questionsHtml = html.match(/<div class=\"question\">([\s\S]*?)<\/a>(\n*)<\/div>(\n*)<\/div>/g);

    let questions = [];
    let images = []; // 图片集合

    for (var i = 0; i < questionsHtml.length; i++) {

      var question = {
        'question-title': '',
        'answer': [],
        'view-more': ''
      }

      var title = questionsHtml[i].match(/<h2.*?<\/h2>/g);
      if (title != null && title.length > 0) {
        title = title[0].substring(27, title[0].length - 5);
      } else {
        title = '';
      }

      let answersHtml = questionsHtml[i].match(/<div class=\"answer\">([\s\S]*?)<\/div>(\n*)<\/div>/g);
      let answers = [];

      for (var j = 0; j < answersHtml.length; j++) {

        var avatar = answersHtml[j].match(/<img class=\"avatar\"(.*?).jpg\">/g);
        var author = answersHtml[j].match(/<span class=\"author\">(.*?)<\/span>/g);
        var bio = answersHtml[j].match(/<span class=\"bio\">(.*?)<\/span>/g);

        if (avatar != null && avatar.length > 0) {
          avatar = avatar[0].substring(25, avatar[0].length - 2);
        } else {
          avatar = '';
        }

        if (author != null && author.length > 0) {
          author = author[0].substring(21, author[0].length - 7);
        } else {
          author = '';
        }

        if (bio != null && bio.length > 0) {
          bio = bio[0].substring(18, bio[0].length - 7);
        } else {
          bio = '';
        }

        var contentsHtml = answersHtml[j].match(/(<p>|<figure).*?(<\/p>|<\/figure>)/g);
        var isImage = false;
        if (contentsHtml) {
          
          for (var k = 0; k < contentsHtml.length; k++) {
            isImage = /<img.*?>/.test(contentsHtml[k]);
            var temp = {
              type: '',
              content: ''
            }
            if (isImage) {
              temp.content = contentsHtml[k].match(/src=".*?"/);
              temp.content = temp.content[0].substring(5, temp.content[0].length - 1);
              temp.type = 'IMAGE';
              contentsHtml[k] = temp;
              images.push(temp.content)
            } else {
              temp.type = 'PARAGRAPH';
              temp.content = contentsHtml[k]
                .replace(/<a.*?\/a>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&ldquo;/g, '"')
                .replace(/&rdquo;/g, '"');
              contentsHtml[k] = temp;
            }
          }
        }
        console.log(author)
        var answer = {
          'avatar': avatar,
          'author': author,
          'bio': bio,
          'content': contentsHtml
        }
        answers[j] = answer;
      }

      var question = {
        'title': title,
        'answers': answers
      }
      questions[i] = question
    }

    this.setData({
      questions: questions,
      images: images
    })
  },


})