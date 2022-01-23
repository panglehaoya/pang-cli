/**
 * @babel/preset-typescript 不支持编译 Vue 文件中的 ts 代码
 * 通过手动添加 @babel/plugin-transform-typescript 的方式来解决这个问题
 * see: https://github.com/babel/babel-loader/pull/738
 */
export {};
