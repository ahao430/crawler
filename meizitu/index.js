// 引入模块
const fs = require('fs')
const request = require('request')
const cheerio = require('cheerio')
const mkdirp = require('mkdirp')
const path = require('path')
const async = require('async')

// 设置常量
const fromPage = 1
const toPage = 30
const baseUrl = "http://meizitu.com/a/"
const downUrl = "./images"

// 目标网址
function geturls () {
  let urls = []
  for (let i = fromPage; i <= toPage; i++) {
    let temp = baseUrl + i +'.html'
    urls.push(temp)

    //创建目录
    let dir = downUrl + '/' + i
    mkdirp(dir, function (e) {
      if (e) console.log(e)
      console.log(dir+'文件夹创建成功！')
    })
  }
  return urls
} 
var urls = geturls()

//发送请求
function getData (url, callback) {
  var option = {
    url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36',
      'Connection':'keep-alive'
    }
  }
  request (
    option, 
    function (err, res, body) {
      if (!err && res.statusCode === 200) {
        var $ = cheerio.load(body)
        var imgs = $('#maincontent').find('img')
        var page = url.split('.html')[0].split('/').pop()
        var dir = downUrl + '/' + page
        console.log('正在下载'+ dir)
        imgs.each(function (i) {
          var src = $(this).attr('src')
          console.log(src);
          var filename = src.split('uploads/')[1].split('/').join('_')
          download(src, dir, filename)
        })
        callback(null, null)
      }
    }
  )
}

//下载方法
function download (url, dir, filename) {
  request.head(url, function (err, res, body) {
    request(url).pipe(fs.createWriteStream(dir + "/" + filename ))
    console.log(filename + '下载完成！')
  })
}

// 异步执行
async.eachSeries(
  urls,
  function (url, callback) {
    getData(url, callback)
  },
  function (err, result) {
    console.log('下载中！')
  }
)