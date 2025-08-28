import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const modules = ['file', 'date'];

// JavaScript 빌드 설정
const jsConfigs = [
  // 메인 index 파일 (모든 모듈 re-export)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'named',
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
      },
    ],
    plugins: [
      typescript({
        declaration: false, // 개별 dts 설정에서만 생성
        declarationMap: false,
      }),
    ],
    external: ['react', 'react-dom'],
  },

  // 각 모듈별 개별 빌드
  ...modules.map((module) => ({
    input: `src/${module}/index.ts`,
    output: [
      {
        file: `dist/${module}.js`,
        format: 'cjs',
        exports: 'named',
      },
      {
        file: `dist/${module}.esm.js`,
        format: 'esm',
      },
    ],
    plugins: [
      typescript({
        declaration: false, // 개별 dts 설정에서만 생성
        declarationMap: false,
      }),
    ],
    external: ['react', 'react-dom'],
  })),
];

// TypeScript 선언 파일 빌드 설정
const dtsConfigs = [
  // 메인 index.d.ts
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },

  // 각 모듈별 .d.ts 파일
  ...modules.map((module) => ({
    input: `src/${module}/index.ts`,
    output: {
      file: `dist/${module}.d.ts`,
      format: 'es',
    },
    plugins: [dts()],
  })),
];

export default [...jsConfigs, ...dtsConfigs];
