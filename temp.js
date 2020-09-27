let dayjs = require('dayjs');

dayjs.extend(require('dayjs/plugin/customParseFormat'));
dayjs.extend(require('dayjs/plugin/utc'));

let date = dayjs.utc('1970-01-01 1', 'YYYY-MM-DD ss');
console.log(date);
