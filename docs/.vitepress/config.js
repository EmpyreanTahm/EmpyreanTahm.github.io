export default {
    title: 'Empyrean Tahm',
    description: '前端 开发 学习 常空',
    themeConfig: {
        logo: '/logo.png',
        siteTitle: 'Empyrean Tahm',
        markdown: { lineNumbers: true },
        lastUpdated: true,
        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2023-PRESENT Empyrean Tahm'
        },
        nav: [
            { text: '🐌进阶篇', link: '/进阶篇/Event Loop' },
            { text: '💯性能优化', link: '/性能优化/requestAnimationFrame' }
        ],
        sidebar: {
            '/进阶篇/': {
                items: []
            },
            '/性能优化/': {
                items: [
                    {
                        text: 'API',
                        collapsed: true,
                        items: [
                            { 'text': 'Event Loop', 'link': '/性能优化/Event Loop' },
                            { 'text': '浅谈 GC', 'link': '/性能优化/浅谈 GC' },
                            { 'text': 'requestAnimationFrame', 'link': '/性能优化/requestAnimationFrame' },
                            { 'text': 'requestIdleCallback', 'link': '/性能优化/requestIdleCallback' },
                            { 'text': 'DocumentFragment', 'link': '/性能优化/DocumentFragment' },
                            { 'text': 'Observers', 'link': '/性能优化/Observers' }
                        ]
                    }
                ]
            }
        }
    }
}
