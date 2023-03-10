import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidDriver from '../../../lib/driver';
import ADB from 'appium-adb';


chai.should();
chai.use(chaiAsPromised);

let driver;
let caps = {
  browserName: 'Browser',
  deviceName: 'Android',
  platformName: 'Android'
};

describe('setUrl', function () {
  let urlId = 'com.android.browser:id/url';
  before(async function () {
    if (process.env.CI) return this.skip(); // eslint-disable-line curly

    let adb = new ADB();
    if (!await adb.isAppInstalled('com.android.browser')) {
      if (!await adb.isAppInstalled('com.android.chrome')) {
        throw new Error('Neither default browser nor chrome available');
      }
      // `browser` is not available, so use `Chrome`
      caps.browserName = 'Chrome';
      urlId = 'com.android.chrome:id/url_bar';
    }

    driver = new AndroidDriver();
    await driver.createSession(caps);
  });
  after(async function () {
    if (driver) {
      await driver.deleteSession();
    }
  });

  it('should be able to start a data uri via setUrl', async function () {
    if (caps.browserName === 'Chrome') {
      try {
        // on some chrome systems, we always get the terms and conditions page
        let btn = await driver.findElement('id', 'com.android.chrome:id/terms_accept');
        await driver.click(btn.ELEMENT);

        btn = await driver.findElement('id', 'com.android.chrome:id/negative_button');
        await driver.click(btn.ELEMENT);
      } catch (ign) {}
    }

    await driver.setUrl('http://saucelabs.com');

    let el = await driver.findElement('id', urlId);
    await driver.getText(el.ELEMENT).should.eventually.include('saucelabs.com');
  });
});
