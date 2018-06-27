var express = require('express');
const http = require("http");
const querystring = require("querystring");
var router = express.Router();
var request = require('request');
var fs = require('fs');

const generateStr = function(a) {
  var c = (function() {
          for (var d = 0, f = new Array(256), g = 0; 256 != g; ++g) {
              (d = g),
                  (d = 1 & d ? -306674912 ^ (d >>> 1) : d >>> 1),
                  (d = 1 & d ? -306674912 ^ (d >>> 1) : d >>> 1),
                  (d = 1 & d ? -306674912 ^ (d >>> 1) : d >>> 1),
                  (d = 1 & d ? -306674912 ^ (d >>> 1) : d >>> 1),
                  (d = 1 & d ? -306674912 ^ (d >>> 1) : d >>> 1),
                  (d = 1 & d ? -306674912 ^ (d >>> 1) : d >>> 1),
                  (d = 1 & d ? -306674912 ^ (d >>> 1) : d >>> 1),
                  (d = 1 & d ? -306674912 ^ (d >>> 1) : d >>> 1),
                  (f[g] = d);
          }
          return "undefined" != typeof Int32Array ? new Int32Array(f) : f;
      })(),
      b = function(g) {
          for (var j, k, h = -1, f = 0, d = g.length; f < d; ) {
              (j = g.charCodeAt(f++)),
                  j < 128
                      ? (h = (h >>> 8) ^ c[255 & (h ^ j)])
                      : j < 2048
                          ? ((h =
                                (h >>> 8) ^
                                c[255 & (h ^ (192 | ((j >> 6) & 31)))]),
                            (h = (h >>> 8) ^ c[255 & (h ^ (128 | (63 & j)))]))
                          : j >= 55296 && j < 57344
                              ? ((j = (1023 & j) + 64),
                                (k = 1023 & g.charCodeAt(f++)),
                                (h =
                                    (h >>> 8) ^
                                    c[255 & (h ^ (240 | ((j >> 8) & 7)))]),
                                (h =
                                    (h >>> 8) ^
                                    c[255 & (h ^ (128 | ((j >> 2) & 63)))]),
                                (h =
                                    (h >>> 8) ^
                                    c[
                                        255 &
                                            (h ^
                                                (128 |
                                                    ((k >> 6) & 15) |
                                                    ((3 & j) << 4)))
                                    ]),
                                (h =
                                    (h >>> 8) ^
                                    c[255 & (h ^ (128 | (63 & k)))]))
                              : ((h =
                                    (h >>> 8) ^
                                    c[255 & (h ^ (224 | ((j >> 12) & 15)))]),
                                (h =
                                    (h >>> 8) ^
                                    c[255 & (h ^ (128 | ((j >> 6) & 63)))]),
                                (h =
                                    (h >>> 8) ^
                                    c[255 & (h ^ (128 | (63 & j)))]));
          }
          return h ^ -1;
      };
  return b(a) >>> 0;
};

let getCookies = function() {
  return new Promise(function(resolve, reject) {
      var options = {
          hostname: "douyin.iiilab.com",
          port: 80,
          path: "/",
          method: "GET"
      };
      var req = http.request(options, function(res) {
          res.setEncoding("utf8");
          res.on("data", function(chunk) {
              let cArr = res.headers["set-cookie"];
              let Cookie = "";
              Cookie = cArr[0].split(";")[0] + ";" + cArr[1].split(";")[0];
              resolve(Cookie);
          });
      });
      req.on("error", function(e) {
          console.log("problem with request: " + e.message);
      });
      req.end();
  });
};
let postAns = function(link, Cookies = "") {
  return new Promise(function(resolve, reject) {
      let DATA;
      const r = Math.random()
          .toString(10)
          .substring(2);
      const s = generateStr(link + "@" + r).toString(10);
    
      const postData = querystring.stringify({
          link: link,
          r: r,
          s: s
      });
      const options = {
          hostname: "service0.iiilab.com",
          port: 80,
          path: "/video/web/douyin",
          method: "POST",
          headers: {
              "Content-Type":
                  "application/x-www-form-urlencoded; charset=UTF-8",
              Origin: "http://douyin.iiilab.com",
              Referer: "http://douyin.iiilab.com/",
              Cookie: Cookies
          }
      };
      var req = http.request(options, function(res) {
          res.setEncoding("utf-8");
          res.on("data", function(chun) {
              // console.log("body分隔线---------------------------------\r\n");
            //   console.info(chun);
              DATA = chun;
              resolve(DATA);
          });
          res.on("end", function() {
              // console.log("No more data in response.********");
          });
      });
      req.on("error", function(err) {
          console.error(err);
      });
      req.write(postData);
      req.end(function() {});
  });
};
/* GET users listing. */
router.post('/', async function(req, res, next) {
  const link  = req.body.url
  let Cookies = await getCookies();
//   console.log('Cookies', Cookies)
  let reData = await postAns(link, Cookies);
  const videoData = JSON.parse(reData).data;
  if(videoData){
    let timestamp = Date.parse(new Date());
    request(videoData.video).pipe(fs.createWriteStream('public/video/' + timestamp+ '.mp4'));
    videoData.curVideo = '/public/video/' + timestamp+ '.mp4';
  }
  res.send(videoData);
});

router.get('/auditing', async function(req, res, next) {
  res.send({data: true, statusCode: 200});
});

module.exports = router;
