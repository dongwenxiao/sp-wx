module.exports = {
    WX_OAUTH_SCOPE: {
        SNSAPI_USERINFO: 'snsapi_userinfo',
        SNSAPI_BASE: 'snsapi_base',
        SNSAPI_LOGIN: 'snsapi_login' // 网页应用目前仅填写
    },
    GET_OAuth_URL: 'https://open.weixin.qq.com/connect/oauth2/authorize',
    GET_OAuth_QRCODE_URL: 'https://open.weixin.qq.com/connect/qrconnect',
    GET_OAuth_ACCESS_TOKEN_URL: 'https://api.weixin.qq.com/sns/oauth2/access_token',
    GET_ACCESS_TOKEN_URL: 'https://api.weixin.qq.com/cgi-bin/token',
    GET_USER_INFO_URL: 'https://api.weixin.qq.com/sns/userinfo',
    GET_TICKET_URL: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
    GET_MEDIA_FILE_URL: 'http://file.api.weixin.qq.com/cgi-bin/media/get'
}