import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Hexagonal / Clean Architecture Boundary Rules', () => {
  const coreDirs = [
    path.resolve(__dirname, '../src/core/domain'),
    path.resolve(__dirname, '../src/core/contracts'),
    path.resolve(__dirname, '../src/core/schemas'),
  ];

  const forbiddenImports = [
    'react',
    'react-native',
    'expo',
    'expo-file-system',
    'expo-sqlite',
    '@ui',
    '@adapters',
  ];

  it('Core domain and contracts must have ZERO UI or React Native imports', () => {
    coreDirs.forEach((dir) => {
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ts'));
      files.forEach((file) => {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        forbiddenImports.forEach((forbidden) => {
          const importRegex = new RegExp(`from ['"]${forbidden}(/.*)?['"]`, 'g');
          const hasForbiddenImport = importRegex.test(content);
          expect(
            hasForbiddenImport,
            `File ${file} in ${path.basename(dir)} illegally imports ${forbidden}`
          ).toBe(false);
        });
      });
    });
  });
});
