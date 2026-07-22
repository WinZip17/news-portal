const path = require('path');

module.exports = [
    // Клиентский бандл
    {
        entry: './src/client.tsx',
        output: { path: path.resolve(__dirname, 'public'), filename: 'client.js' },
        resolve: { extensions: ['.tsx', '.ts', '.js'] },
        module: { rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ }] },
        target: 'web',

    },
    // Серверный бандл
    {
        entry: './src/main.ts',
        output: { path: path.resolve(__dirname, 'dist'), filename: 'main.js', libraryTarget: 'commonjs2' },
        resolve: { extensions: ['.tsx', '.ts', '.js'] },
        module: { rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ }] },
        target: 'node',
        externals: [
            '@nestjs/core',
            '@nestjs/common',
            '@nestjs/platform-express',
            '@nestjs/websockets',
            '@nestjs/microservices',
            '@nestjs/platform-socket.io',
            '@nestjs/serve-static',
        ],
    },

];