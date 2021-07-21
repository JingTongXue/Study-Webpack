'use strict';

const path = require('path');
const glob = require('glob');
// css文件指纹插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

 // css文件压缩插件配置
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

//  HTML文件压缩插件配置
const HtmlWebpackPlugin = require('html-webpack-plugin');

// 清除构建目录的插件
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const setMPA = () => {
    const entry = {};
    const htmlWebpackPlugins = [];
    const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'));

    Object.keys(entryFiles)
        .map((index) => {
            const entryFile = entryFiles[index];
            const match = entryFile.match(/src\/(.*)\/index\.js/);
            const pageName = match && match[1];

            entry[pageName] = entryFile;
            htmlWebpackPlugins.push(
                new HtmlWebpackPlugin({
                    inlineSource: '.css$',
                    template: path.join(__dirname, `src/${pageName}/index.html`),
                    filename: `${pageName}.html`,
                    chunks: ['vendors', pageName],
                    inject: true,
                    minify: {
                        html5: true,
                        collapseWhitespace: true,
                        preserveLineBreaks: false,
                        minifyCSS: true,
                        minifyJS: true,
                        removeComments: false
                    }
                })
            );
        });
    
    console.log('entryFiles:    ',entryFiles);
    return {
        entry,
        htmlWebpackPlugins
    }
}
const { entry, htmlWebpackPlugins } = setMPA();

module.exports = {
    entry: entry,
    output: {
        path: path.join(__dirname, 'dist'),
        // 增加js的文件指纹
        filename: '[name]_[chunkhash:8].js'
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /.js$/,
                use: 'babel-loader'
            },
            {
                test: /.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader',
                    {
                        loader: 'postcss-loader',
                        options:{
                            postcssOptions: {
                                ident: 'postcss',
                                plugins: () => [
                                    require('postcss-preset-env')()
                                    // require('autoprefixer')({
                                    //     browsers: ['last 2 version', '>1%', 'ios 7']
                                    // })
                                ]
                            }
                        }
                    },
                    // px单位转换成rem相对单位，用以适配其他设备 
                    {
                        loader: 'px2rem-loader',
                        options:　{
                            remUnit: 75,
                            remPrecesion: 8
                        }
                    }
                ]
            },
            {
                test: /.(png|jpg|gif|jpeg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name]_[hash:8].[ext]'
                        }
                    }
                ]
            },
            {
                test: /.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name]_[hash:8][ext]'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        // css文件指纹设置
        new MiniCssExtractPlugin({
            filename: '[name]_[contenthash:8].css'
        }),
        // css文件压缩配置
        new OptimizeCSSAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano')
        }),
        //  HTML文件压缩配置
        // new HtmlWebpackPlugin({
        //     template: path.join(__dirname, 'src/index.html'),
        //     filename: 'index.html',
        //     chunks: ['index'],
        //     inject: true,
        //     minify: {
        //         html5: true,
        //         collapseWhitespace: true,
        //         preserveLineBreaks: false,
        //         minifyCSS: true,
        //         minifyJS: true,
        //         removeComments: false
        //     }
        // }),
        // new HtmlWebpackPlugin({
        //     template: path.join(__dirname, 'src/search.html'),
        //     filename: 'search.html',
        //     chunks: ['search'],
        //     inject: true,
        //     minify: {
        //         html5: true,
        //         collapseWhitespace: true,
        //         preserveLineBreaks: false,
        //         minifyCSS: true,
        //         minifyJS: true,
        //         removeComments: false
        //     }
        // }),
        new CleanWebpackPlugin()
    ].concat(htmlWebpackPlugins),
};
