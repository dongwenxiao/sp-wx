const fs = require('fs')

const sha1 = require('sp-functions/crypto/sha1')
const md5 = require('sp-functions/crypto/md5')
const randomString = require('sp-functions/random/string')
const moment = require('moment')

const {
    WX_OAUTH_SCOPE,
    GET_OAuth_URL,
    GET_OAuth_ACCESS_TOKEN_URL,
    GET_ACCESS_TOKEN_URL,
    GET_USER_INFO_URL,
    GET_TICKET_URL,
    GET_MEDIA_FILE_URL
} = require('./enum')

const error = require('debug')('sp-wx:error')
const debug = require('debug')('sp-wx:debug')

export default class Wechat {

    // 公众号提供
    appId = ''
    secret = ''

    constructor({ appId, secret }) {
        this.appId = appId
        this.secret = secret
    }

    /**
     * 获取授权页面的URL地址
     * @param {String} redirect 授权后要跳转的地址
     * @param {String} state 开发者可提供的数据
     * @param {String} scope 作用范围，值为snsapi_userinfo和snsapi_base，前者用于弹出，后者用于跳转
     */
    getAuthorizeURL(redirect, state = '', scope = WX_OAUTH_SCOPE.SNSAPI_USERINFO) {

        let url = `${GET_OAuth_URL}?appid=${this.appId}&redirect_uri=${redirect}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
        debug('getAuthorizeURL() url: %o', url)

        return url
    }

    /**
     * 获取微信登录授权需要的accessToken
     * 
     * @param {String} code 授权页面回调带参数
     */
    async getOAuthAccessToken(code) {

        let url = `${GET_OAuth_ACCESS_TOKEN_URL}?appid=${this.appId}&secret=${this.secret}&code=${code}&grant_type=authorization_code`
        debug('getOAuthAccessToken() url: %o', url)

        return await fetch(url)
            .then((res) => {
                return res.json()
            })
            .then((data) => {
                debug('getOAuthAccessToken() data: %O', data)
                return data
            })
            .catch((err) => {
                error(err)
                return false
            })
    }

    /**
     * 获取access_token
     */
    async getAccessToken() {

        let url = `${GET_ACCESS_TOKEN_URL}?grant_type=client_credential&appid=${this.appId}&secret=${this.secret}`
        debug('getAccessToken() url: %o', url)

        let accessToken = await fetch(url)
            .then((res) => {
                return res.json()
            })
            .then((data) => {
                debug('getAccessToken() data: %O', data)
                return data
            })
            .catch((err) => {
                error(err)
                return false
            })

        return accessToken
    }

    /**
     * 获取用户信息
     * @param {*} accessToken 
     * @param {*} openid 
     */
    async getUserInfo(accessToken, openid) {

        let url = `${GET_USER_INFO_URL}?access_token=${accessToken}&openid=${openid}`
        debug('getUserInfo() url: %o', url)

        return await fetch(url)
            .then((res) => {
                return res.json()
            })
            .then((data) => {
                debug('getUserInfo() data: %O', data)
                return data
            })
            .catch((err) => {
                error(err)
                return false
            })
    }


    async getJssdkTicket() {

        let accessToken = await this.getAccessToken()
        let url = `${GET_TICKET_URL}?access_token=${accessToken.access_token}&type=jsapi`
        debug('getJssdkTicket() url: %o', url)

        let ticket = await fetch(url)
            .then((res) => {
                return res.json()
            })
            .then((data) => {
                debug('getJssdkTicket() data: %O', data)
                return data
            })
            .catch((err) => {
                error(err)
                return false
            })

        return ticket
    }

    async getJssdkToken(url) {

        let ticket = await this.getJssdkTicket(),
            noncestr = randomString(16, true),
            timestamp = Math.floor(Date.now() / 1000)

        let token = {
            appid: this.appId,
            noncestr,
            timestamp,
            url,
            jsapi_ticket: ticket.ticket,
            signature: sha1(`jsapi_ticket=${ticket.ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`)
        }

        return token
    }

    validTicket(ticket) {
        if (!ticket) return false
        return this.validExpire(ticket.time, ticket.expires_in)
    }

    validAccessToken(token) {
        if (!token) return false
        return this.validExpire(token.time, token.expires_in)
    }

    validExpire(start, expire) {
        let now = new Date()
        let time = new Date(start)
        time.setSeconds(time.getSeconds() + (expire * 1))
        if (time > now)
            return true // 验证通过
        return false
    }


    async fetchAudio(mediaId, savePath, filename) {

        let access_token = await this.getAccessToken()
        let url = `${GET_MEDIA_FILE_URL}?access_token=${access_token.access_token}&media_id=${mediaId}`
        debug('fetchAudio() url: %o', url)

        return fetch(url)
            .then((res) => {
                return res.buffer()
            })
            .then((buffer) => {
                let writeFile = new Promise((reslove) => {
                    // 默认md5名字
                    if (!filename) {
                        filename = (() => {
                            let now = moment().format('YYYYMMDDHHss.S')
                            let random = randomString(5)
                            return md5(now + random) + '.amr'
                        })()
                    }
                    // 保存文件到本地
                    fs.writeFile(`${savePath}/${filename}`, buffer, () => {
                        reslove(filename)
                    })
                })
                return writeFile
            })
            .catch((err) => {
                error(err)
            })
    }
}