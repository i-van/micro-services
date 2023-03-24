const modules = (process.env.MODULES ?? '').split(',');

const bootstrap = async () => {
  for (const moduleName of modules) {
    try {
      const module = require(`${__dirname}/${moduleName}`);
      await module.start();
      console.log(`"${moduleName}" started`);
    } catch (err) {
      err.code === 'MODULE_NOT_FOUND'
        ? console.log(`"${moduleName}" not found`)
        : console.log(`"${moduleName}" failed`);
    }
  }

  process.on('SIGTERM', () => {
    setTimeout(() => process.exit(1), 1000);

    modules.forEach(async (moduleName) => {
      try {
        const module = require(`${__dirname}/${moduleName}`);
        await module.stop();
        console.log(`"${moduleName}" stopped`);
      } catch (err) {
        err.code === 'MODULE_NOT_FOUND'
          ? console.log(`"${moduleName}" not found`)
          : console.log(`"${moduleName}" failed`);
      }
    });
  });
};
bootstrap();
