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
        nav: [
            { text: '🐌进阶篇', link: '/进阶篇/Event Loop' },
            { text: '💯性能优化', link: '/性能优化/requestAnimationFrame' }
        ],
        sidebar: {
            '/进阶篇/': [{
                'items': [
                    { 'text': 'Event Loop', 'link': '/进阶篇/Event Loop' }
                ]
            }],
            '/性能优化/': [{
                'items': [
                    { 'text': 'requestAnimationFrame', 'link': '/性能优化/requestAnimationFrame' }
                ]
            }]
        }
    }
}
