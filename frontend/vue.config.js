const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  
  // PWA 配置
  pwa: {
    name: 'ThreadBond',
    themeColor: '#4DBA87',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    
    // 图标配置
    iconPaths: {
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/apple-touch-icon-152x152.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'img/icons/msapplication-icon-144x144.png'
    },

    // Service Worker 配置
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/sw.js',
      swDest: 'sw.js'
    },

    // 清单文件配置
    manifestOptions: {
      name: 'ThreadBond - 匿名线索社交',
      short_name: 'ThreadBond',
      description: '通过解密线索开启匿名聊天的创新社交应用',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#ffffff',
      theme_color: '#4DBA87',
      start_url: '/',
      scope: '/',
      categories: ['social', 'entertainment'],
      lang: 'zh-CN',
      icons: [
        {
          src: './img/icons/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: './img/icons/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  },

  // 开发服务器配置
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: 'all',
    hot: true,
    liveReload: false, // 禁用自动刷新，只使用热重载
    client: {
      logging: 'warn', // 减少日志输出
      overlay: {
        errors: true,
        warnings: false
      }
    }
  },

  // CSS 配置
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },

  // Vant UI 按需加载配置
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    },
    // 正确的 watch 配置位置
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300,
      poll: false
    }
  },

  // Babel 插件配置
  chainWebpack: config => {
    // 移动端优化
    config.plugin('html').tap(args => {
      args[0].title = 'ThreadBond - 匿名线索社交';
      args[0].meta = {
        viewport: 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no',
        'format-detection': 'telephone=no',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'black-translucent'
      };
      return args;
    });

    // 生产环境优化
    if (process.env.NODE_ENV === 'production') {
      // 代码分割
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          vant: {
            name: 'chunk-vant',
            test: /[\\/]node_modules[\\/]vant[\\/]/,
            priority: 20
          }
        }
      });
    }
  },

  // 生产环境配置
  productionSourceMap: false,
  
  // 静态资源处理
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/'
});