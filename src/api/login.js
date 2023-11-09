import request from '@/utils/request'

// 登录方法
export function login(username, password, code, uuid) {
    const data = {
        username,
        password,
        code,
        uuid
    }
    return request({
        url: '/system/pwd/login',
        headers: {
            isToken: false,
            repeatSubmit: false
        },
        method: 'post',
        data: data
    })
}

// 注册方法
export function register(data) {
    return request({
        url: '/register',
        headers: {
            isToken: false
        },
        method: 'post',
        data: data
    })
}

// 获取用户详细信息
export function getInfo() {
    return request({
        url: '/getInfo',
        method: 'get'
    })
}

// 退出方法
export function logout() {
    return request({
        url: '/logout',
        method: 'post'
    })
}
export function socialAuthRedirect(redirectUri) {
    return request({
        url: '/system/auth/social-auth-redirect?redirectUri = ' + redirectUri,
        method: 'get'
    })
}

export function sendSmsCode(phone) {
    return request({
        url: '/system/sms/get/code',
        method: 'get',
        params: phone

    })
}
export function dinGing(redirectUri) {
    return request({
        url: '/system/dinging/social-auth-redirect',
        method: 'get',
        params: {
            redirectUri,
        }
    })
}

// 获取验证码
export function getCodeImg() {
    return request({
        url: '/captchaImage',
        headers: {
            isToken: false
        },
        method: 'get',
        timeout: 20000
    })
}