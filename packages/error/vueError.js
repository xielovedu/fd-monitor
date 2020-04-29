import BaseMonitor from '../base/baseMonitor.js'
import { ErrorCategoryEnum, ErrorLevelEnum } from '../base/baseConfig.js'

/**
 * vue错误
 */
class VueError extends BaseMonitor {
    constructor(params) {
        super(params)
    }

    /**
     * 处理Vue错误提示
     */
    handleError(Vue) {
        if (!Vue) {
            return
        }
        Vue.config.errorHandler = (error, vm, info) => {
            try {
                let metaData = {
                    name: error.name, //异常名称
                    message: error.message, //异常信息
                    stack: error.stack, //异常堆栈信息
                    vueInfo: error.info, //vue info
                    resourceUrl: error.script // 异常脚本url
                }

                //解析resourceUrl，line，col
                let errs = error.stack.match(/\(.+?\)/)
                if (errs && errs.length) {
                    errs = errs[0]
                    errs = errs.replace(/\w.+[js|html]/g, $1 => {
                        this.url = $1
                        return ''
                    })
                    errs = errs.split(':')
                    if (errs.length > 1) {
                        this.line = parseInt(errs[1] || null) //行
                        this.col = parseInt(errs[2] || null) //列
                    }
                }

                if (Object.prototype.toString.call(vm) === '[object Object]') {
                    metaData.componentName = vm._isVue ? vm.$options.name || vm.$options._componentTag : vm.name
                    metaData.propsData = vm.$options.propsData
                }
                this.level = ErrorLevelEnum.WARN
                this.msg = JSON.stringify(metaData)
                this.category = ErrorCategoryEnum.VUE_ERROR
                this.recordError()
            } catch (error) {
                console.log('vue错误异常', error)
            }
        }
    }
}
export default VueError