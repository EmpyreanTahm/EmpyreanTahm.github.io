import algoliaConfig from './algoliaConfig'
import navConfig from './navConfig'
import sidebarConfig from './sidebarConfig'

export default {
    title: 'Kernel Tahm',
    description: '前端 开发 学习 常空',
    themeConfig: {
        logo: '/logo.png',
        siteTitle: 'Kernel Tahm',
        markdown: { lineNumbers: true },
        lastUpdated: true,
        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2023-PRESENT Kernel Tahm'
        },
        ...algoliaConfig,
        ...navConfig,
        ...sidebarConfig
    }
}
