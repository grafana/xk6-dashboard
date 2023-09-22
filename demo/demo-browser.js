// SPDX-FileCopyrightText: 2023 Raintank, Inc. dba Grafana Labs
//
// SPDX-License-Identifier: AGPL-3.0-only

import { browser } from "k6/experimental/browser";

export const options = {
  scenarios: {
    browser: {
      executor: "ramping-vus",
      options: {
        browser: {
          type: "chromium",
        },
      },
      startVUs: 1,
      stages: [
        { duration: "30s", target: 1 },
        { duration: "3m", target: 2 },
        { duration: "2m", target: 2 },
        { duration: "3m", target: 1 },
        { duration: "2m", target: 2 },
        { duration: "1m", target: 1 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    browser_http_req_duration: ["p(90) < 500"],
  },
};

export default async function () {
  const page = browser.newPage();

  try {
    await page.goto("https://test.k6.io/");

    let link = page.locator('a[href="/contacts.php"]');

    await Promise.all([page.waitForNavigation(), link.click()]);

    let back = page.locator('a[href="/"]');

    await Promise.all([page.waitForNavigation(), back.click()]);

    link = page.locator('a[href="/news.php"]');

    await Promise.all([page.waitForNavigation(), link.click()]);

    back = page.locator('a[href="/"]');

    await Promise.all([page.waitForNavigation(), back.click()]);
  } finally {
    page.close();
  }
}
