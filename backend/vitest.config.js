import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    // La suite corre contra una base SQLite en memoria: no toca database.sqlite
    env: {
      NODE_ENV: 'test',
      DB_STORAGE: ':memory:'
    }
  }
});
