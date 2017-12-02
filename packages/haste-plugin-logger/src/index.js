const chalk = require('chalk');
const { format, delta } = require('./utils');

module.exports = class LoggerPlugin {
  apply(runner) {
    runner.hooks.beforeExecution.tapPromise('logger', async (execution) => {
      execution.hooks.createTask.tap('pipe streams', (task) => {
        const maxListeners = 100;

        process.stdout.setMaxListeners(maxListeners);
        process.stderr.setMaxListeners(maxListeners);

        task.pool.stdout.pipe(process.stdout);
        task.pool.stderr.pipe(process.stderr);

        let start;

        task.hooks.before.tap('log start', () => {
          start = new Date();
          console.log(`[${format(start)}] ${chalk.black.bgGreen('Starting')} '${task.name}'...`);
        });

        task.hooks.success.tap('log success', () => {
          const [end, time] = delta(start);
          console.log(`[${format(end)}] ${chalk.black.bgCyan('Finished')} '${task.name}' after ${time} ms`);
        });

        task.hooks.failure.tap('log failure', () => {
          const [end, time] = delta(start);
          console.log(`[${format(end)}] ${chalk.white.bgRed('Failed')} '${task.name}' after ${time} ms`);
        });
      });
    });
  }
};
