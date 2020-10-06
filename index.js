const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;

async function init() {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 720 });
    await page.goto('https://internal.indzz.com/login');
    return { browser, page }
}

async function destroy(browser) {
    browser.close()
}

async function login(page) {
    const username = "USERNAME"
    const password = "PASSWORD"
    await page.type('#username', username)
    await page.type('#password', password)
    // click and wait for navigation
    await Promise.all([
        page.click('.submit-button'),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ])
}

async function checkout(page) {
    const checkOutSelector = 'a[href="/attendance/sign"].btn.btn-danger'
    const checkInSelector = 'a[href="/attendance/sign"].btn.btn-success'
    try {
        await page.waitForSelector(checkOutSelector)
        await Promise.all([
            page.click(checkOutSelector),
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ])
        console.log('You have been logged out')
    } catch (error) {
        console.log(error)
        console.log('You haven\'t logged in.')
    }
}

async function close(browser) {
    await browser.close()
}

async function main() {
    const pattern = '0 45 23 * * 1-4'
    // const pattern = '* * * * * *'
    const job = new CronJob(pattern, async function () {
        const { browser, page } = await init();
        await login(page);
        await checkout(page);
        await close(browser);
    }, null, true, 'Asia/Hong_Kong');
    job.start();
}

main();