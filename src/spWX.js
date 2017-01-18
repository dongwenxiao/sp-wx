const OAuth = require('wechat-oauth')

const appid = 'wx32bdcb04c239609a'
const appsecret = 'a04248f387d39df9ba631e43fa66d6c6'

const client = new OAuth(appid, appsecret, function(openid, callback) {
    // 传入一个根据openid获取对应的全局token的方法
    // 在getUser时会通过该方法来获取token
    fs.readFile(openid + ':access_token.txt', 'utf8', function(err, txt) {
        if (err) { return callback(err) }
        callback(null, JSON.parse(txt))
    })
}, function(openid, token, callback) {
    // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
    // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
    // 持久化时请注意，每个openid都对应一个唯一的token!
    fs.writeFile(openid + ':access_token.txt', JSON.stringify(token), callback)
})


/**
 * 微信操作的类
 * 构造方法参数：{appid: '', appsecret: '', token: ''}
 * @export
 * @class spW
 */
export default class spWX {
    constructor(opt) {

        this.appid = opt.appid
        this.appsecret = opt.appsecret
        this.token = opt.token

        this.client = this.getClient()
    }

    // TODO: 重写用mongodb存储 token
    getClient() {
        return new OAuth(this.appid, this.appsecret, function(openid, callback) {
            // 传入一个根据openid获取对应的全局token的方法
            // 在getUser时会通过该方法来获取token
            fs.readFile(openid + ':access_token.txt', 'utf8', function(err, txt) {
                if (err) { return callback(err) }
                callback(null, JSON.parse(txt))
            })
        }, function(openid, token, callback) {
            // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
            // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
            // 持久化时请注意，每个openid都对应一个唯一的token!
            fs.writeFile(openid + ':access_token.txt', JSON.stringify(token), callback)
        })
    }

    /**
     * 返回调取微信api后的回调URL
     * 
     * @param {any} url 微信回调自定义的URL
     * @param {string} [scope='snsapi_userinfo'] 微信API权限
     * @returns {string} 用于跳转的授权跳转的URL
     * 
     * @memberOf spWX
     */
    getDirectURL(url, scope = 'snsapi_userinfo') {
        return this.client.getAuthorizeURL(url, 'state', scope)
    }


}