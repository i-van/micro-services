const modules = (process.env.MODULES ?? '').split(',');

const run = async () => {
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
};
run();
