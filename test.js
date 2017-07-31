/**
 * Created by afkari on 7/11/17.
 */
const app = require('./index');

app.GET('test', function () {
  console.log('cb');
}, function () {
  console.log('cb_2');
});