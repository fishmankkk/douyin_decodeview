const router = require('koa-router')()
const axios = require('axios')
const fs = require('fs')
var path = require('path')
const dayjs = require('dayjs')
const cheerio = require('cheerio')
const {
    getString,
    getIPAddress
} = require('../utils/help')
const {
    ipAddress
} = require('../utils/config')

let requestUrl = `https://v.douyin.com/KWuu31/`

var renderPage = function (requestUrl) {
    return new Promise((resolve, reject) => {
        axios
            .get(requestUrl, {
                headers: {
                    'user-agent': ' Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
                }
            })
            .then(function (response) {
                const $ = cheerio.load(response, {
                    decodeEntities: false
                })
                let item_ids = getString($.html(), 'itemId: "', '",')
                let dytk = getString($.html(), 'dytk: "', '" }')
                console.log('response', item_ids, dytk)
                resolve({
                    item_ids,
                    dytk
                })
            })
            .catch(function (error) {
                console.log(error)
                reject(error)
            })
    })
}

var getDYVideoUrl = function ({
    item_ids,
    dytk
}) {
    return new Promise((resolve, reject) => {
        axios
            .get(
                `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${item_ids}&dytk=${dytk}`, {
                    headers: {
                        'user-agent': ' Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
                    }
                }
            )
            .then(function (response) {
                // console.log("response", response.data)
                let {
                    status_code,
                    item_list
                } = response.data
                if (status_code === 0) {
                    let url = item_list[0].video.play_addr.url_list[0].replace(
                        'playwm',
                        'play'
                    )
                    console.log('url', url)
                    resolve(url)
                } else {
                    reject(status_code)
                }
            })
            .catch(function (error) {
                console.log(error)
                reject(error)
            })
    })
}

var getCurrentVideo = function (url) {
    return new Promise((resolve, reject) => {
        axios
            .get(url, {
                headers: {
                    'user-agent': ' Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
                }
            })
            .then(function (response) {
                console.log('response: getCurrentVideo', response.data)
            })
            .catch(function (error) {
                console.log(error)
                reject(error)
            })
    })
}
async function downloadFile(url, filepath, name) {
    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath)
    }
    const mypath = path.resolve(filepath, name)
    const writer = fs.createWriteStream(mypath)
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })
    response.data.pipe(writer)
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
        resolve()
    })
}

router.prefix('/douyin')

var buildVideoFilesToUrl = function (url) {
    return new Promise((resolve, reject) => {
        renderPage(url)
            .then(data => {
                getDYVideoUrl(data)
                    .then(currentUrl => {
                        let fileName = `${dayjs().unix()}.mp4`
                        downloadFile(
                                currentUrl,
                                path.join(__dirname, '../public/video'),
                                fileName
                            )
                            .then(() => {
                                resolve(`${ipAddress}/video/${fileName}`)
                            })
                            .catch(() => {
                                reject('下载出错')
                            })
                    })
                    .catch(() => {
                        reject('获取无水印链接出错')
                    })
            })
            .catch(() => {
                reject('爬虫页面出错')
            })
    })
}

router.post('/getCurrentUrl', async function (ctx, next) {
    let {
        url
    } = ctx.request.body
    await buildVideoFilesToUrl(url).then(cuurentUrl => {
        ctx.body = {
            status: true,
            result: {
                url: cuurentUrl
            },
            msg: '转换成功'
        }
    }).catch((err) => {
        ctx.body = {
            status: false,
            result: {
                msg: err
            },
            msg: '转换失败'
        }
    })
})

router.get('/getCurrentUrl', async function (ctx, next) {
    let {
        url
    } = ctx.query
    await buildVideoFilesToUrl(url).then(cuurentUrl => {
        ctx.body = {
            status: true,
            result: {
                url: cuurentUrl
            },
            msg: '转换成功'
        }
    }).catch((err) => {
        ctx.body = {
            status: false,
            result: {
                msg: err
            },
            msg: '转换失败'
        }
    })
})

module.exports = router